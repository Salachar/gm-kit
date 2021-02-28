const electron = require('electron');
const app = electron.app;
const IPC = electron.ipcMain;

const fs = require('fs');
const path = require('path');

const GMConfig = require('./config');
const FileHelpers = require('./file_helpers');

class AudioManager {
    constructor () {
        this.list = null;

        this.setIPCEvents();
    }

    setIPCEvents () {
        IPC.on('audio_page_loaded', (e) => {
            this.loadAudioJSON();
            this.sendAudio();
        });

        IPC.on('save_audio_json', (e, audio_data) => {
            this.saveAudioJSON(audio_data);
        });
    }

    sendAudio () {
        const list = this.generateList();
        if (!list) {
            global.shared.WINDOW.webContents.send('audio_list_error', list);
        } else {
            global.shared.WINDOW.webContents.send('audio_list_loaded', list);
        }
    }

    loadAudioJSON () {
        try {
            const audio_path = path.join(GMConfig.json_directory, 'audio_data.json');
            let audio_data = fs.readFileSync(audio_path, {
                encoding: 'utf-8'
            });
            global.shared.WINDOW.webContents.send('audio_json_loaded', JSON.parse(audio_data));
        } catch (e) {
            console.log(e);
            console.log('No audio_data.json file found');
            global.shared.WINDOW.webContents.send('audio_json_loaded', {});
        }
    }

    saveAudioJSON (audio_data) {
        try {
            const audio_path = path.join(GMConfig.json_directory, 'audio_data.json');
            fs.writeFileSync(audio_path, JSON.stringify(audio_data, null, 4), 'utf-8');
        } catch (e) {
            console.log('Failed to save the file !');
        }
    }

    generateList () {
        this.list = {};

        console.log('Generating Audio List from: ' + GMConfig.audio_directory);
        FileHelpers.readDir(GMConfig.audio_directory, {
            types: ['audio'],
            onDirectory: (dir, item) => {
                this.addDirectory(dir, item);
            },
            onFile: (dir, item) => {
                this.investigateFile(dir, item);
            },
            onError: (error) => {
                this.list = {};
            }
        });

        if (!Object.keys(this.list).length) return null;
        return this.list;
    }

    addDirectory (dir, item) {
        let curr = this.list;
        const relative_directory = dir.replace(GMConfig.audio_directory, "").replace(path.sep, '');
        relative_directory.split(path.sep).forEach((path_seg) => {
            curr[path_seg] = curr[path_seg] || {
                type: 'directory',
                name: item
            };
            curr = curr[path_seg];
        });
        return curr;
    }

    investigateFile (dir, item) {
        let curr = this.list;
        let file_name = item.split('.')[0];
        let relative_directory = dir.replace(GMConfig.audio_directory, "").replace(path.sep, '');

        relative_directory.split(path.sep).forEach((path_seg) => {
            curr = curr[path_seg];
        });

        const key = this.generateKey(relative_directory, file_name);
        const formatted_name = file_name.replace(/_/g, ' ').replace(/^[-\d\s]*/,"");
        const file_path = path.join(GMConfig.audio_directory, relative_directory, item);

        if (!curr) curr = this.list;
        curr.files = curr.files || {};
        curr.files[file_name] = {
            type: 'audio',
            key: key,
            name: formatted_name,
            path: file_path,
        };
    }

    generateKey (relative_directory, file_name) {
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

module.exports = new AudioManager();
