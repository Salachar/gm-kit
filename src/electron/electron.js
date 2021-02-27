const electron = require('electron');
const app = electron.app;
app.commandLine.appendSwitch('--autoplay-policy','no-user-gesture-required');

const BrowserWindow = electron.BrowserWindow;
const IPC = electron.ipcMain;

const path = require('path');
const url = require('url');

const GMMapManager = require('./lib/map_manager');
const GMAudioManager = require('./lib/audio_manager');
const GMConfig = require('./lib/config');

global.shared = {
    WINDOW: null
};

// Need a reference to hang onto the first map needed to display
let WINDOW = null;

function createWindow () {
    WINDOW = new BrowserWindow({
        width: 1280,
        height: 720,
        icon: __dirname + '/map.png'
    });
    WINDOW.setMenu(null);
    WINDOW.setPosition(20, 20);

    global.shared.WINDOW = WINDOW;

    let window_url = url.format({
        pathname: path.join(__dirname, `../client/html/dm_screen.html`),
        protocol: 'file:',
        slashes: true
    });

    window_url += `?data_dir=${Boolean(GMConfig.json_directory)}`;

    WINDOW.loadURL(window_url);
    WINDOW.webContents.openDevTools();
    WINDOW.on('closed', function () {
        app.quit();
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

IPC.on('app_loaded', (e) => {
    WINDOW.webContents.send('config', GMConfig.data);
});
