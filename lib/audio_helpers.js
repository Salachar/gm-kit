const path = require('path');
const FileHelpers = require('./file_helpers');

const AudioHelpers = {
    directory: null,
    list: null,

    generateList: function () {
        this.directory = global.shared.CONFIG.audio_directory;
        this.list = {};

        FileHelpers.readDir(this.directory, {
            types: ['audio'],
            onDirectory: (dir, item) => {
                this.addDirectory(dir, item);
            },
            onFile: (dir, item) => {
                this.investigateFile(dir, item);
            },
            onError: (error) => {
                console.log('AudioHelper generateList error');
                console.log(error);
            }
        });

        return this.list;
    },

    addDirectory: function (dir, item) {
        let curr = this.list;
        const relative_directory = dir.replace(this.directory, "").replace(path.sep, '');
        relative_directory.split(path.sep).forEach((path_seg) => {
            curr[path_seg] = curr[path_seg] || {
                type: 'directory',
                name: item
            };
            curr = curr[path_seg];
        });
        return curr;
    },

    investigateFile: function (dir, item) {
        let curr = this.list;
        let file_name = item.split('.')[0];
        let relative_directory = dir.replace(this.directory, "").replace(path.sep, '');

        relative_directory.split(path.sep).forEach((path_seg) => {
            curr = curr[path_seg];
        });

        const key = this.generateKey(relative_directory, file_name);
        const formatted_name = file_name.replace(/_/g, ' ').replace(/^[-\d\s]*/,"");
        const file_path = path.join(this.directory, relative_directory, item);

        curr.files = curr.files || {};
        curr.files[file_name] = {
            type: 'audio',
            key: key,
            name: formatted_name,
            path: file_path,
        };
    },

    generateKey: function (relative_directory, file_name) {
        const re = new RegExp(String.fromCharCode(160), "g");
        let key = relative_directory + '/' + file_name;
        key = JSON.parse(JSON.stringify(key));
        key = key.replace(re, " ");
        key = key.toLowerCase();
        key = key.replace(/ /g,'_');
        key = key.replace(/\//g,'_');
        key = key.replace(/__/g,'_');
        key = key.replace(/-/g,'');
        key = key.replace(/\(/g,'');
        key = key.replace(/\)/g,'');
        key = key.replace(/\./g,'');
        key = key.replace(/'/g,'');
        key = key.replace(/,/g,'');
        return key;
    }
}

module.exports = AudioHelpers;