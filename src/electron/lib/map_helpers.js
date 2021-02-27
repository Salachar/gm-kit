// const electron = require('electron');
// const app = electron.app;
// const IPC = electron.ipcRenderer;
const path = require('path');

const FileHelpers = require('./file_helpers');

const DM_VARIATIONS = ['DM_', '_DM', ' DM', 'DM ', '(DM)', '[DM]'];
const DM_VARIATIONS_LENGTH = DM_VARIATIONS.length;

const MapHelpers = {
    directory: null,
    list: null,

    generateList: function () {
        this.directory = global.shared.CONFIG.map_directory;
        this.list = {};

        FileHelpers.readDir(this.directory, {
            types: ['image', 'video'],
            onFile: (dir, item, type) => {
                this.investigateFile(dir, item, type);
            },
            onError: (error) => {
                console.log(error);
            }
        });

        return this.list;
    },

    investigateFile: function (dir, item, type) {
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
        let file_obj = {
            name: file_name,
            [type]: item,
            dm_version: dm_version,
            type: type,
        };

        // Check to see if there a JSON file for the map image
        const json_file = FileHelpers.getMatchingFile({
            dir: dir,
            file: item,
            type: 'json'
        });

        if (json_file) {
            file_obj.json = json_file;
            this.addToMapList(dir, file_obj);
        } else {
            this.addToMapList(dir, file_obj);
        }
    },

    addToMapList: function (dir, file_obj) {
        // Remove everything from the path before the selected map folder
        // Also remove the leading path separator
        // TODO - I should change this to split on the folder name

        let relative_directory = dir.replace(this.directory, "").replace(path.sep, '');

        ['video', 'image', 'dm_version', 'json'].forEach((file_type) => {
            if (file_obj[file_type]) {
                file_obj[file_type] = path.join(this.directory, relative_directory, file_obj[file_type]);
            }
        });

        let dir_split = relative_directory.split(path.sep);
        dir_split.push('files');

        let directory_split = this.directory.split(path.sep);
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

module.exports = MapHelpers;