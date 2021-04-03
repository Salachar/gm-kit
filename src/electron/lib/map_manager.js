const electron = require('electron');
const IPC = electron.ipcMain;

const fs = require('fs');
const path = require('path');

const GMConfig = require('./config');
const FileHelpers = require('./file_helpers');

const DM_VARIATIONS = ['DM_', '_DM', ' DM', 'DM ', '(DM)', '[DM]'];
const DM_VARIATIONS_LENGTH = DM_VARIATIONS.length;

class MapManager {
    constructor () {
        this.list = {};

        this.setIPCEvents();
    }

    setIPCEvents () {
        IPC.on('load_map_list', (e) => {
            this.loadMapList();
        });

        IPC.on('refresh_map_list', (e) => {
            this.list = {};
            this.loadMapList();
        });

        IPC.on('load_maps', (e, maps = {}) => {
            let loaded_maps = {};
            for (let m in maps) {
                const map = maps[m];
                if (map.json_exists) map.json = FileHelpers.readJSON(map.json_directory);
                loaded_maps[map.name] = map;
            }
            global.shared.WINDOW.webContents.send('maps_loaded', loaded_maps);
        });

        IPC.on('save_maps', (e, maps = {}) => {
            const map_keys = Object.keys(maps);
            map_keys.forEach((map_key) => {
                const map = maps[map_key];
                try {
                    const file_json = JSON.stringify(map.json, null, 4);
                    fs.writeFileSync(map.json_directory, file_json, 'utf-8');
                } catch (e) {
                    console.log('Unable to save map: ' + map.name);
                }
            });

            let message = `${map_keys.length} maps`;
            if (map_keys.length === 1) {
                message = `Map:${maps[map_keys[0]].name}`;
            }

            global.shared.WINDOW.webContents.send('message', {
                type: 'success',
                text: `${message} sucessfully saved`
            });
        });
    }

    loadMapList () {
        if (!GMConfig.map_directory) {
            GMConfig.chooseDirectory('map', (folder_path) => {
                global.shared.WINDOW.webContents.send('map_list_loaded', this.generateList());
            });
        } else {
            if (Object.keys(this.list || {}).length) {
                global.shared.WINDOW.webContents.send('map_list_loaded', this.list);
            } else {
                global.shared.WINDOW.webContents.send('map_list_loaded', this.generateList());
            }
        }
    }

    generateList () {
        this.list = {};

        let directory_split = GMConfig.map_directory.split(path.sep);
        this.main_folder_name = directory_split[directory_split.length - 1];

        FileHelpers.readDir(GMConfig.map_directory, {
            types: ['image', 'video'],
            onFile: (dir, item, type) => {
                this.investigateFile(dir, item, type);
            },
            onError: (error) => {
                console.log(error);
            }
        });

        return this.list;
    }

    investigateFile (dir, item, type) {
        // type is 'video' or 'image' based on the types passed into readDir
        const [file_name, file_type] = item.split('.');

        // If the file is a DM image, skip it
        if (file_name.match(/DM_|_DM| DM|DM |(DM)/)) return;

        // For non-DM images, Search for the DM version of the map
        let dm_version = null;
        for (let i = 0; i < DM_VARIATIONS_LENGTH; ++i) {
            const dm_ext = DM_VARIATIONS[i];
            // Check prepended dm version
            let dm_file_name = `${dm_ext}${file_name}.${file_type}`;
            dm_version = fs.existsSync(`${dir}/${dm_file_name}`) ? dm_file_name : null;
            if (dm_version) break;
            // Check appended dm version
            dm_file_name = `${file_name}${dm_ext}.${file_type}`;
            dm_version = fs.existsSync(`${dir}/${dm_file_name}`) ? dm_file_name : null;
            if (dm_version) break;
        }

        const json_directory = path.join(GMConfig.json_directory, 'maps', `${file_name}.json`);
        // Create the file object
        let file_obj = {
            name: file_name,
            type: type,
            [type]: path.join(dir, item),
            dm_version: dm_version && path.join(dir, dm_version),
            json_directory: json_directory,
            json_exists: fs.existsSync(json_directory),
        };

        this.addToMapList(dir, file_obj);
    }

    addToMapList (dir, file_obj) {
        // Remove the map directory path and only the leading path separator character
        const relative_directory = dir.replace(GMConfig.map_directory, '').replace(path.sep, '');
        const dir_split = [this.main_folder_name, ...relative_directory.split(path.sep), 'files'].filter(e => e);

        let curr = this.list;
        for (let i = 0; i <= dir_split.length; ++i) {
            if (i === dir_split.length) {
                // We've created the full path in the list, now
                // add the file under the file name
                curr[file_obj.name] = file_obj;
            } else {
                // Keep moving through list and create objects when needed
                const n = dir_split[i];
                curr[n] = curr[n] || {};
                curr = curr[n];
            }
        }
    }
}

module.exports = new MapManager();
