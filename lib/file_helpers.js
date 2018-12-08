const electron = require('electron');
// Module to control application life.
const app = electron.app;

const fs = require('fs');
const path = require('path');
const url = require('url');

const FileHelpers = {
    file_extensions: {
        image: ['.png', '.jpg', '.jpeg', '.bmp'],
        audio: ['.mp3', '.mp3', '.wav']
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
        let output = '';

        const { base, name, type, init_content } = opts;
        // Get the path to the electron executable
        const app_path = app.getPath('exe');

        console.log(base);
        console.log(app_path);

        output = path.join(base, name);

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

        console.log(output);
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
        const { file, type } = opts;
        if (this.file_extensions[type]) {
            for (let i = 0; i < this.file_extensions[type].length; ++i) {
                if (file.indexOf(this.file_extensions[type][i]) !== -1) return true;
            }
            return false;
        }

        // No extensions to check
        if (file.indexOf(type) !== -1) return true;
        return false;
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
    }
};
module.exports = FileHelpers;
