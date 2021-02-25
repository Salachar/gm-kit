// const electron = require('electron');
// const app = electron.app;
// const IPC = electron.ipcRenderer;
const path = require('path');

const FileHelpers = require('./file_helpers');

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
        const [file_name, file_type] = item.split('.');

        // If the file is a DM image, skip it
        if (file_name.match(/DM_|_DM| DM|DM |(DM)/)) return;

        // For non-DM images, Search for the DM version of the map
        // DM_map.ext or map_DM.ext
        let dm_version = null;
        ['DM_', '_DM', ' DM', 'DM ', '(DM)', '[DM]'].forEach((dm_ext) => {
            let prepend_file_check = FileHelpers.getFile({
                dir: dir,
                file: `${dm_ext}${file_name}.${file_type}`
            });
            let append_file_check = FileHelpers.getFile({
                dir: dir,
                file: `${file_name}${dm_ext}.${file_type}`
            });
            if (prepend_file_check) dm_version = prepend_file_check;
            if (append_file_check) dm_version = append_file_check;
        });

        // let dm_version = FileHelpers.getFile({
        //     dir: dir,
        //     file: `DM_${file_name}.${file_type}`
        // }) || FileHelpers.getFile({
        //     dir: dir,
        //     file: `${file_name}_DM.${file_type}`
        // });

        // Create the file object
        let file_obj = {
            name: file_name,
            [type]: item,
            dm_version: dm_version,
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