const electron = require('electron');
const dialog = electron.dialog;

const fs = require('fs');
const path = require('path');

const FileHelpers = {
    file_extensions: {
        image: ['.png', '.jpg', '.jpeg', '.bmp'],
        video: ['.mp4'],
        audio: ['.mp3', '.mp4', '.wav']
    },

    read (path, opts = {}) {
        const { json = false } = opts;
        try {
            let data = fs.readFileSync(path, {
                encoding: 'utf-8'
            });
            if (json) return JSON.parse(data);
            return data;
        } catch (e) {
            console.log(e);
            return null;
        }
    },

    readJSON (path) {
        return FileHelpers.read(path, {
            json: true,
        });
    },

    isOfType (opts = {}) {
        let { file, types } = opts;
        // return true (to match all file types)
        if (!types) return true;

        types = (typeof types === 'string') ? [types] : types;

        let type_pass = false;
        types.forEach((type) => {
            if (!this.file_extensions[type]) return;
            this.file_extensions[type].forEach((ext) => {
                if (path.extname(file) === ext) {
                    type_pass = type;
                }
            });
        });

        return type_pass;
    },

    readDir: function (dir, opts = {}) {
        const onFile = opts.onFile || function(){};
        const onDirectory = opts.onDirectory || function(){};
        const onError = opts.onError || function(){};

        try {
            dir = path.normalize(dir);
            fs.readdirSync(dir).forEach((item) => {
                if (item.indexOf('(exclude)') !== -1) return;
                const full_path = path.normalize(path.join(dir, item));
                if (fs.lstatSync(full_path).isDirectory()) {
                    onDirectory(path.join(dir, item), item);
                    this.readDir(full_path, opts);
                } else {
                    const valid_type = this.isOfType({
                        file: item,
                        types: opts.types
                    });
                    if (valid_type) onFile(dir, item, valid_type);
                }
            });
        } catch (e) {
            onError(e);
        }
    },

    chooseDirectory: function (callback) {
        dialog.showOpenDialog(global.shared.WINDOW, {
            properties: ['openDirectory']
        }, (folders) => {
            if (!folders || !folders.length) {
                console.log('User must have canceled folder selection');
                return;
            }
            const folder_path = folders[0];
            callback(folder_path);
        });
    },
};

module.exports = FileHelpers;
