const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const IPC = electron.ipcMain;

const fs = require('fs');;
const path = require('path');
const url = require('url');

const FileHelpers = require('./lib/file_helpers');
const MapHelpers = require('./lib/map_helpers');
const AudioHelpers = require('./lib/audio_helpers');

const { log } = require('./lib/helpers');

global.shared = {
    CONFIG: null,
    CONFIG_DATA: {
        base: __dirname,
        name:'config',
        type: 'json',
        init_content: '{}',
        directory: ''
    },
    WINDOW: null
};

// Need a reference to hang onto the first map needed to display
let WINDOW = null;

function loadConfig () {
    let output_dir = FileHelpers.generate(global.shared.CONFIG_DATA);
    global.shared.CONFIG_DATA.directory = output_dir;
    let config_data = FileHelpers.read(output_dir);
    try {
        config_data = JSON.parse(config_data);
        global.shared.CONFIG = config_data;
    } catch (e) {
        console.log(e);
        global.shared.CONFIG = {};
    }
}

function createWindow () {
    loadConfig();

    WINDOW = new BrowserWindow({
        width: 2400,
        height: 1300,
        icon: __dirname + '/map.png'
    });
    WINDOW.setMenu(null);
    WINDOW.setPosition(100, 100);

    global.shared.WINDOW = WINDOW;

    let window_url = url.format({
        pathname: path.join(__dirname, `./src/html/main.html`),
        protocol: 'file:',
        slashes: true
    });

    window_url += `?map_dir=${global.shared.CONFIG.map_directory}`;

    WINDOW.loadURL(window_url);
    WINDOW.webContents.openDevTools();
    WINDOW.on('closed', function () {
        app.quit();
    });
}

function sendMaps () {
    const list = MapHelpers.generateList();
    WINDOW.webContents.send('maps_loaded', list);
}

function sendAudio () {
    const list = AudioHelpers.generateList();
    WINDOW.webContents.send('files_loaded', list);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

function chooseMapDirectory () {
    FileHelpers.chooseDirectory(function (folder_path) {
        global.shared.CONFIG.map_directory = folder_path;
        fs.writeFileSync(
            global.shared.CONFIG_DATA.directory,
            JSON.stringify(global.shared.CONFIG, null, 4),
            'utf-8'
        );
        sendMaps();
    });
}

IPC.on('open_dialog_modal', (e) => {
    chooseMapDirectory();
});

IPC.on('load_maps', (e) => {
    if (!global.shared.CONFIG.map_directory) {
        chooseMapDirectory();
    } else {
        sendMaps();
    }
});

IPC.on('load_map', (e, maps = {}) => {
    let loaded_maps = {};
    log('load_map', maps);

    for (let m in maps) {
        let map = JSON.parse(JSON.stringify(maps[m]));

        if (map.json) {
            try {
                const json = JSON.parse(fs.readFileSync(map.json, {
                    encoding: 'utf-8'
                }));
                map.json_directory = map.json;
                map.json = json;
            } catch (e) {
                console.log(e);
                console.log('Error loading map');
            }
        }

        if (!map.json_directory) {
            map.json_directory = map.image.replace(/png|jpg|jpeg|bmp/, 'json');
        }

        loaded_maps[map.name] = map;
    }

    WINDOW.webContents.send('map_loaded', loaded_maps);
});

IPC.on('save_map', (e, maps = {}) => {
    let map = null;

    for (var m in maps) {
        try {
            map = maps[m];
            const file_json = JSON.stringify(map.json, null, 4);
            fs.writeFileSync(map.json_directory, file_json, 'utf-8');
        } catch (e) {
            console.log('Unable to save map: ' + map.name);
        }
    }

    WINDOW.webContents.send('message', {
        type: 'success',
        text: 'Map(s) successfully saved'
    });
});

IPC.on('audio_loaded', (e) => {
    loadAudioData();
    sendAudio();
});

IPC.on('save_audio_data', (e, audio_data) => {
    try {
        const audio_path = path.join(global.shared.CONFIG.audio_directory, 'audio_data.json');
        fs.writeFileSync(audio_path, JSON.stringify(audio_data, null, 4), 'utf-8');
    } catch (e) {
        console.log('Failed to save the file !');
    }
});

function loadAudioData () {
    try {
        const audio_path = path.join(global.shared.CONFIG.audio_directory, 'audio_data.json');
        let audio_data = fs.readFileSync(audio_path, {
            encoding: 'utf-8'
        });
        WINDOW.webContents.send('data_loaded', JSON.stringify(audio_data));
    } catch (e) {
        console.log(e);
        console.log('No audio_data.json file found');
    }
}

