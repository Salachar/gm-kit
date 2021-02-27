const electron = require('electron');
const app = electron.app;
const IPC = electron.ipcMain;

const fs = require('fs');
const path = require('path');

const FileHelpers = require('./file_helpers');

class Config {
  constructor () {
      this.data = {};

      this.file_name = 'config.json';
      this.userdata_path = app.getPath('userData');
      this.path = path.join(this.userdata_path, this.file_name);

      IPC.on('choose_main_directory', (e) => {
        this.chooseDirectory('json', () => {
          this.createMapsFolder();
        });
      });

      IPC.on('open_map_dialog_modal', (e) => {
        this.chooseDirectory('map');
      });

      IPC.on('open_audio_dialog_modal', (e) => {
        this.chooseDirectory('audio', () => {
          global.shared.WINDOW.webContents.send('audio_folder_chosen');
        });
      });

      this.init();
  }

  init () {
      // Create a very basic config if the file does not exist
      if (!this.exists()) this.write();
      this.read();
  }

  exists () {
      return fs.existsSync(this.path);
  }

  read () {
      let data = fs.readFileSync(this.path, {
          encoding: 'utf-8',
      });
      try {
          this.data = JSON.parse(data);
          console.log(`Data successfully parsed: ${JSON.stringify(this.data, null, 2)}`);
          this.createMapsFolder();
      } catch (e) {
          this.data = {};
          console.log('Unable to parse data for supposed config');
          console.log(e);
      }
  }

  write () {
      fs.writeFileSync(this.path, JSON.stringify(this.data));
  }

  createMapsFolder () {
    const maps_folder = path.join(this.json_directory, 'maps');
    if (!fs.existsSync(maps_folder)) fs.mkdirSync(maps_folder);
  }

  get map_directory () {
    const { map_directory } = this.data;
    return map_directory || '';
  }

  set map_directory (dir) {
    this.data.map_directory = dir;
  }

  get audio_directory () {
    const { audio_directory } = this.data;
    return audio_directory || '';
  }

  set audio_directory (dir) {
    this.data.audio_directory = dir;
  }

  get json_directory () {
      const { json_directory } = this.data;
      return json_directory || '';
  }

  set json_directory (dir) {
    this.data.json_directory = dir;
  }

  chooseDirectory (type, callback) {
      FileHelpers.chooseDirectory((folder_path) => {
          this[`${type}_directory`] = folder_path;
          this.write();
          if (callback) callback(folder_path);
      });
  }
}

module.exports = new Config();