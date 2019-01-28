const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
const IPC = electron.ipcMain;
const dialog = electron.dialog;

const fs = require('fs');;
const path = require('path');
const url = require('url');

const FileHelpers = require('./lib/file_helpers');
let CONFIG = null;

// Need a reference to hang onto the first map needed to display
let WINDOW = null;

let file_info = {
    config: {
        base: __dirname,
        name:'config',
        type: 'json',
        init_content: '{}',
        directory: ''
    }
};

function loadConfig () {
    let output_dir = FileHelpers.generate(file_info.config);
    console.log(output_dir);
    file_info.config.directory = output_dir;
    let config_data = FileHelpers.read(output_dir);
    try {
        config_data = JSON.parse(config_data);
        CONFIG = config_data;
    } catch (e) {
        console.log(e);
        CONFIG = {};
    }
}

function createWindow () {
    loadConfig();

    WINDOW = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: __dirname + '/map.png'
    });
    WINDOW.setMenu(null);
    WINDOW.setPosition(10, 100);

    let window_url = url.format({
        pathname: path.join(__dirname, `./src/html/main.html`),
        protocol: 'file:',
        slashes: true
    });
    window_url += `?map_dir=${CONFIG.map_directory}`;

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

function chooseMapDirectory () {
    dialog.showOpenDialog(WINDOW, {
        properties: ['openDirectory']
    }, (folders) => {
        if (!folders || !folders.length) {
            console.log('User must have canceled folder selection');
            return;
        }
        const folder_path = folders[0];
        // console.log(folder_path);
        CONFIG.map_directory = folder_path;
        fs.writeFileSync(file_info.config.directory, JSON.stringify(CONFIG, null, 4), 'utf-8');
        generateMapList();
    });
}

IPC.on('open_dialog_modal', (e) => {
    chooseMapDirectory();
});

IPC.on('load_maps', (e) => {
    if (!CONFIG.map_directory) {
        chooseMapDirectory();
    } else {
        generateMapList();
    }
});

IPC.on('load_map', (e, maps) => {
    let loaded_maps = {};

    let map = null;
    for (let m in maps) {
        map = maps[m];
        let map_data = {
            type: map.type,
            name: map.name,
            image: map.image,
            dm_image: map.dm_image
        };
        // if (map.image) {
        //     map_data.image = map.image;
        // }
        if (map.json) {
            try {
                let json = fs.readFileSync(map.json, {
                    encoding: 'utf-8'
                });

                json = JSON.parse(json);
                map_data.json = json;
                map_data.json_directory = map.json;
            } catch (e) {
                console.log('ERROR');
            }
        } else {
            map_data.json_directory = map.image.replace(/png|jpg|jpeg|bmp/, 'json')
        }
        loaded_maps[map.name] = map_data;
    }

    WINDOW.webContents.send('map_loaded', loaded_maps);
});

IPC.on('save_map', (e, maps) => {
    maps = maps || {};
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

function generateMapList () {
    let map_list = {};
    let cur_path = CONFIG.map_directory;

    readDir(cur_path);
    WINDOW.webContents.send('maps_loaded', map_list);

    function readDir (dir) {
        fs.readdirSync(dir).forEach((file) => {
            const full_path = dir + '/' + file;
            if (fs.lstatSync(full_path).isDirectory()) {
                readDir(full_path);
            } else {
                const file_name = file.split('.')[0];
                const file_type = file.split('.')[1];

                if (file_name.match(/DM_|_DM/)) return;

                if (FileHelpers.isImage(file)) {
                    const json_exists = FileHelpers.getMatchingFile({
                        dir: dir,
                        file: file,
                        type: 'json'
                    });

                    let dm_image = FileHelpers.getFile({
                        dir: dir,
                        file: `DM_${file_name}.${file_type}`
                    });
                    if (!dm_image) {
                        dm_image = FileHelpers.getFile({
                            dir: dir,
                            file: `${file_name}_DM.${file_type}`
                        });
                    }
                    if (dm_image) console.log(dm_image);

                    let file_obj = {
                        name: file_name,
                        image: file,
                        dm_image: dm_image
                    };
                    if (json_exists) {
                        file_obj.json = json_exists;
                        addToComplete(dir, file_obj);
                    } else {
                        addToImageOnly(dir, file_obj);
                    }
                }
                // else if (FileHelpers.isJSON(file)) {
                //     const image_exists = FileHelpers.getMatchingFile({
                //         dir: dir,
                //         file: file,
                //         type: 'image'
                //     });
                //     if (image_exists) {
                //         addToComplete(dir, {
                //             name: file_name,
                //             image: image_exists,
                //             json: file
                //         });
                //     } else {
                //         addToJSONOnly(dir, {
                //             name: file_name,
                //             json: file
                //         });
                //     }
                // }
            }
        });
    }

    function addToComplete (dir, file_obj) {
        file_obj.type = 'complete';
        addToMapList(dir + '/complete', file_obj);
    }

    function addToImageOnly (dir, file_obj) {
        file_obj.type = 'image_only';
        addToMapList(dir + '/image_only', file_obj);
    }

    // function addToJSONOnly (dir, file_obj) {
    //     file_obj.type = 'json_only';
    //     addToMapList(dir + '/json_only', file_obj);
    // }

    function addToMapList (dir, file_obj) {
        let relative_directory = dir.replace(CONFIG.map_directory, "");
        let map_directory = relative_directory.replace('/', '');
        relative_directory = relative_directory.replace(/\/complete|\/image_only|\/json_only/, '');

        if (file_obj.image) {
            // C:\Projects\dnd_map_app\maps\Examples\Hideout.jpg
            file_obj.image = path.join(CONFIG.map_directory, relative_directory, file_obj.image);
        }
        if (file_obj.dm_image) {

            // C:\Projects\dnd_map_app\maps\Examples\Hideout.jpg
            file_obj.dm_image = path.join(CONFIG.map_directory, relative_directory, file_obj.dm_image);
            console.log(file_obj.dm_image);
        }
        if (file_obj.json) {
            file_obj.json = path.join(CONFIG.map_directory, relative_directory, file_obj.json);
        }

        let dir_split = map_directory.split('/');
        let curr = map_list;
        for (let i = 0; i <= dir_split.length; ++i) {
            if (i === dir_split.length) {
                // We've created the full path in the map_list, now
                // add the file under the file name
                curr[file_obj.name] = file_obj;
            } else {
                // Keep moving through map_list and create objects when needed
                curr[dir_split[i]] = curr[dir_split[i]] || {};
                curr = curr[dir_split[i]];
            }
        }
    }
}
