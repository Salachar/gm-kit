const electron = require('electron');
// Module to control application life.
const app = electron.app;

const dialog = electron.dialog;

const fs = require('fs');
const path = require('path');
const url = require('url');

const FileHelpers = {
    file_extensions: {
        image: ['.png', '.jpg', '.jpeg', '.bmp'],
        audio: ['.mp3', '.mp4', '.wav']
    },

    isLocal: function () {
        const app_path = app.getPath('exe');
        return (app_path.indexOf('node_modules') !== -1);
    },

    read (path) {
        try {
            let data = fs.readFileSync(path, {
                encoding: 'utf-8'
            });
            return data;
        } catch (e) {
            console.log(e);
            return null;
        }
    },

    generate (opts = {}) {
        const { base, name, type, init_content } = opts;
        let output = path.join(base, name);

        // Get the path to the electron executable
        // const app_path = app.getPath('exe');
        // if (this.isLocal()) {
        //     output = path.join(base, name);
        // } else {
        //     const dir_split = (process.platform === 'darwin') ? "/" : "\\";
        //     let app_path_split = app_path.split("electron.")[0].split(dir_split);
        //     app_path_split.push(base);
        //     output = app_path_split.join(dir_split);
        // }

        if (type !== 'directory') {
            output = `${output}.${type}`;
        }

        if (!fs.existsSync(output)) {
            if (type === 'directory') {
                fs.mkdirSync(output);
            } else {
                const create_stream = fs.createWriteStream(output);
                if (opts.init_content) {
                    create_stream.write(init_content);
                }
                create_stream.end();
            }
        }

        return output;
    },

    isAudio: function (file) {
        return this.isOfType({
            file: file,
            type: 'audio'
        });
    },

    isJSON (file) {
        return this.isOfType({
            file: file,
            type: 'json'
        });
    },

    isImage (file) {
        return this.isOfType({
            file: file,
            type: 'image'
        });
    },

    isOfType (opts = {}) {
        let file = opts.file;
        let types = opts.type;
        types = (typeof types === 'string') ? [types] : types;

        let type_pass = false;
        types.forEach((type) => {
            if (!this.file_extensions[type]) return;
            this.file_extensions[type].forEach((ext) => {
                if (path.extname(file) === ext) {
                    type_pass = true;
                }
            });
        });

        return type_pass;
    },

    getFile (opts = {}) {
        const { file, dir } = opts;
        if (fs.existsSync(`${dir}/${file}`)) return file;
        return null;
    },

    getMatchingFile (opts = {}) {
        const { file, dir, type, tags } = opts;
        const file_no_extension = file.split('.')[0];

        if (this.file_extensions[type]) {
            for (let i = 0; i < this.file_extensions[type].length; ++i) {
                try {
                    let check_file = file_no_extension + this.file_extensions[type][i];
                    if (fs.existsSync(dir + '/' + check_file)) return check_file;
                } catch (e) {
                    console.log('Issue reading file, skipping...');
                }
            }
            return false;
        }

        // No extensions to check
        try {
            let check_file = `${file_no_extension}.${type}`;
            if (fs.existsSync(`${dir}/${check_file}`)) return check_file;
            return false;
        } catch (e) { console.log(e); }

        return false;
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
                } else if (!opts.types || opts.types && this.isOfType({file: item, type: opts.types})) {
                    onFile(dir, item);
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
    }

};
module.exports = FileHelpers;
