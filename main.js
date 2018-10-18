const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
const IPC = electron.ipcMain;

const fs = require('fs');;
const path = require('path');
const url = require('url');

const base_dir = 'maps';
let map_dir = '';
let map_dir_exists = false;

let LOCAL = false;

// Need a reference to hang onto the first map needed to display
let WINDOW = null;

function generateMapDir () {
    let app_path = app.getPath('exe');
    if (app_path.indexOf('node_modules') !== -1) {
        LOCAL = true;
        map_dir = path.join(__dirname, base_dir);
    } else {
        LOCAL = false;
        let app_split = (process.platform === 'darwin') ? ".app" : ".exe";
        let dir_split = (process.platform === 'darwin') ? "/" : "\\";
        let app_path_split = app_path.split(app_split)[0].split(dir_split);
        app_path_split.pop();
        app_path_split.push(base_dir);
        map_dir = app_path_split.join(dir_split);
    }

    if (fs.existsSync(map_dir)) {
        map_dir_exists = true;
    } else {
        map_dir_exists = false;
        fs.mkdirSync(map_dir);
    }
}

function createWindow () {
    generateMapDir();

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
    window_url += `?map_dir=${map_dir}`;

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

IPC.on('load_maps', (e) => {
    generateMapList();
});

IPC.on('remove_map', (e, map) => {
    // console.log(map.image);
    // console.log(map.json);
    // console.log(map);
    // console.log(fs.existsSync(map.image));
    fs.unlinkSync(map.json);
});

IPC.on('load_map', (e, maps) => {
    let loaded_maps = {};

    let map = null;
    for (let m in maps) {
        map = maps[m];
        let map_data = {
            type: map.type,
            name: map.name,
        };
        if (map.image) {
            map_data.image = map.image;
        }
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
            const file_json = JSON.stringify(map.json);
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
    let cur_path = map_dir;

    readDir(cur_path);
    WINDOW.webContents.send('maps_loaded', map_list);

    function readDir (dir) {
        fs.readdirSync(dir).forEach((file) => {
            let full_path = dir + '/' + file;
            if (fs.lstatSync(full_path).isDirectory()) {
                readDir(full_path);
            } else {
                let file_name = file.split('.')[0];
                if (isImage(file)) {
                    let json_exists = matchingJSONExists(dir, file);
                    if (json_exists) {
                        addToComplete(dir, {
                            name: file_name,
                            image: file,
                            json: json_exists
                        });
                    } else {
                        addToImageOnly(dir, {
                            name: file_name,
                            image: file
                        });
                    }
                } else if (isJSON(file)) {
                    let image_exists = matchingImageExists(dir, file);
                    if (image_exists) {
                        addToComplete(dir, {
                            name: file_name,
                            image: image_exists,
                            json: file
                        });
                    } else {
                        addToJSONOnly(dir, {
                            name: file_name,
                            json: file
                        });
                    }
                }
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

    function addToJSONOnly (dir, file_obj) {
        file_obj.type = 'json_only';
        addToMapList(dir + '/json_only', file_obj);
    }

    function addToMapList (dir, file_obj) {
        let relative_directory = dir.split(base_dir)[1];
        let map_directory = relative_directory.replace('/', '');

        relative_directory = base_dir + relative_directory;
        relative_directory = relative_directory.replace(/\/complete|\/image_only|\/json_only/, '');

        if (!LOCAL) relative_directory = relative_directory.replace(base_dir, '');

        if (file_obj.image) {
            if (LOCAL) {
                file_obj.image = path.join(__dirname, relative_directory + '/' + file_obj.image);
            } else {
                file_obj.image = map_dir + '/' + relative_directory + '/' + file_obj.image;
            }
        }
        if (file_obj.json) {
            if (LOCAL) {
                file_obj.json = path.join(__dirname, relative_directory + '/' + file_obj.json);
            } else {
                file_obj.json = map_dir + '/' + relative_directory + '/' + file_obj.json;
            }
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

    function isJSON (file) {
        return file.match(/json/);
    }

    function isImage (file) {
        if (file.match(/png|jpg|jpeg|bmp|pdf/)) return true;
        return false;
    }

    function matchingImageExists (dir, file) {
        let image_types = ['.png', '.jpg', '.jpeg', '.bmp', '.pdf'];
        let file_no_extension = file.split('.')[0];
        for (let i = 0; i < image_types.length; ++i) {
            try {
                let image_file = file_no_extension + image_types[i]
                if (fs.existsSync(dir + '/' + image_file)) return image_file;
            } catch (e) {
                console.log('Issue reading file, skipping...');
            }
        }
        // console.log('No Image match found for: ' + file);
        return false;
    }

    function matchingJSONExists (dir, file) {
        let file_no_extension = file.split('.')[0];
        let json_file = file_no_extension + '.json';
        try {
            if (fs.existsSync(dir + '/' + json_file)) return json_file;
            // console.log('No JSON match found for: ' + file);
            return false;
        } catch (e) {
            // console.log('Error trying to read "' + json_file + '". It must not exist.');
            return false;
        }
    }
}
