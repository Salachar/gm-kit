const { V4MAPPED } = require('dns');
const electron = require('electron');
const app = electron.app;
const IPC = electron.ipcMain;

const fs = require('fs');
const path = require('path');

const GMConfig = require('./config');
const FileHelpers = require('./file_helpers');

const DM_VARIATIONS = ['DM_', '_DM', ' DM', 'DM ', '(DM)', '[DM]'];
const DM_VARIATIONS_LENGTH = DM_VARIATIONS.length;

class MapManager {
    constructor () {
      this.list = null;

      this.setIPCEvents();
    }

    setIPCEvents () {
      IPC.on('load_maps', (e) => {
        if (!GMConfig.map_directory) {
            GMConfig.chooseDirectory('map', (folder_path) => {
              global.shared.WINDOW.webContents.send('maps_loaded', this.generateList());
            });
        } else {
            global.shared.WINDOW.webContents.send('maps_loaded', this.generateList());
        }
    });

    IPC.on('load_map', (e, maps = {}) => {
      let loaded_maps = {};
      for (let m in maps) {
          let map = JSON.parse(JSON.stringify(maps[m]));

          if (map.json_exists) {
              try {
                  map.json = JSON.parse(fs.readFileSync(map.json_directory, { encoding: 'utf-8' }));
              } catch (e) {
                  console.log(e);
              }
          }

          loaded_maps[map.name] = map;
      }

      global.shared.WINDOW.webContents.send('map_loaded', loaded_maps);
  });

    IPC.on('save_map', (e, maps = {}) => {
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

    generateList () {
        this.list = {};

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
            dm_version = FileHelpers.getFile({
                dir: dir,
                file: `${dm_ext}${file_name}.${file_type}`
            });
            if (dm_version) break;
            dm_version = FileHelpers.getFile({
                dir: dir,
                file: `${file_name}${dm_ext}.${file_type}`
            });
            if (dm_version) break;
        }

        // Create the file object
        const json_directory = path.join(GMConfig.json_directory, 'maps', `${file_name}.json`);

        let file_obj = {
            name: file_name,
            [type]: item,
            dm_version: dm_version,
            type: type,
            json_directory: json_directory,
            json_exists: fs.existsSync(json_directory),
        };

        this.addToMapList(dir, file_obj);
    }

    addToMapList (dir, file_obj) {
        // Remove everything from the path before the selected map folder
        // Also remove the leading path separator
        // TODO - I should change this to split on the folder name

        let relative_directory = dir.replace(GMConfig.map_directory, "").replace(path.sep, '');

        ['video', 'image', 'dm_version', 'json'].forEach((file_type) => {
            if (file_obj[file_type]) {
                file_obj[file_type] = path.join(GMConfig.map_directory, relative_directory, file_obj[file_type]);
            }
        });

        let dir_split = relative_directory.split(path.sep);
        dir_split.push('files');

        let directory_split = GMConfig.map_directory.split(path.sep);
        let main_folder_name = directory_split[directory_split.length - 1];
        dir_split.unshift(main_folder_name);

        dir_split = dir_split.filter(e => e);

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
