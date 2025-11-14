const electron = require('electron');
const IPC = electron.ipcMain;

const fs = require('fs');
const path = require('path');

const GMConfig = require('./config');
const FileHelpers = require('./file_helpers');

const DM_VARIATIONS = ['DM_', '_DM', ' DM', 'DM ', '(DM)', '[DM]'];
const DM_VARIATIONS_LENGTH = DM_VARIATIONS.length;
const GARBAGE_FOLDERS = ['Roll20', 'Gridded', 'Grid', 'Grid Versions'];

const copy = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

class MapManager {
  constructor () {
    this.list = {};
    this.map_tags = {};

    this.setIPCEvents();
  }

  setIPCEvents () {
    IPC.on('load_map_list', (e) => {
      this.loadMapTags();
      this.loadMapList();
    });

    IPC.on('refresh_map_list', (e) => {
      this.list = {};
      this.loadMapTags();
      this.loadMapList();
    });

    IPC.on('map_tags_request', (e) => {
      this.loadMapTags();
    });

    IPC.on('save_map_tag', (e, tag_data = {}) => {
      this.saveMapTag(tag_data);
    });

    IPC.on('remove_map_tag', (e, tag_data = {}) => {
      this.removeMapTag(tag_data);
    });

    IPC.on('load_map', (e, map = {}) => {
      if (map.json_exists) {
        map.json = FileHelpers.readJSON(map.json_directory);
      } else {
        map.json = {};
      }
      if (!map.json.meta) {
        map.json.meta = {};
      }
      global.shared.WINDOW.webContents.send('maps_loaded', {
        [map.name]: map,
      });
    });

    IPC.on('save_maps', (e, maps = {}) => {
      const map_keys = Object.keys(maps);
      map_keys.forEach((map_key) => {
        const map = maps[map_key];
        try {
          const file_json = JSON.stringify(map.json, null, 4);
          fs.writeFileSync(map.json_directory, file_json, 'utf-8');
        } catch (e) {
          console.log('Unable to save map: ' + map.name);
        }
      });

      let message = `${map_keys.length} maps`;
      if (map_keys.length === 1) {
        message = `Map:${maps[map_keys[0]].name}`;
      }

      global.shared.WINDOW.webContents.send('message', {
        type: 'success',
        text: `${message} sucessfully saved`
      });
    });
  }

  loadMapTags () {
    try {
      const map_tags_path = path.join(GMConfig.json_directory, 'map_tags.json');
      if (!fs.existsSync(map_tags_path)) {
        console.log('This path doesnt exist: ', map_tags_path);
        return;
      }
      this.map_tags = FileHelpers.read(map_tags_path, { json: true });
      global.shared.WINDOW.webContents.send('map_tags_response', this.map_tags);
    } catch (e) {
      console.log('No map_tags.json file found', e);
      global.shared.WINDOW.webContents.send('map_tags_response', {});
    }
  }

  saveMapTag ({ key = "", tag = "" }) {
    try {
      if (!key || !tag) return;
      if (!this.map_tags[key]) {
        this.map_tags[key] = [];
      }
      this.map_tags[key].push(tag);
      const map_tags_path = path.join(GMConfig.json_directory, 'map_tags.json');
      fs.writeFileSync(map_tags_path, JSON.stringify(this.map_tags, null, 4), 'utf-8');
      global.shared.WINDOW.webContents.send('map_tags_response', this.map_tags);
    } catch (e) {
      console.log('Failed to save the map_tags file!', e);
    }
  }

  removeMapTag ({ key = "", tag = "" }) {
    try {
      if (!key || !tag) return;
      if (!this.map_tags[key]) {
        console.log("Error, couldnt find tags for: ", key);
        return;
      }
      const filtered_tags = this.map_tags[key].filter(t => t !== tag);
      this.map_tags[key] = filtered_tags;
      const map_tags_path = path.join(GMConfig.json_directory, 'map_tags.json');
      fs.writeFileSync(map_tags_path, JSON.stringify(this.map_tags, null, 4), 'utf-8');
      global.shared.WINDOW.webContents.send('map_tags_response', this.map_tags);
    } catch (e) {
      console.log('Failed to save the map_tags file!', e);
    }
  }

  loadMapList () {
    if (!GMConfig.map_directory) {
      GMConfig.chooseDirectory('map', (folder_path) => {
        global.shared.WINDOW.webContents.send('map_list_loaded', this.generateList());
      });
    } else {
      if (Object.keys(this.list || {}).length) {
        global.shared.WINDOW.webContents.send('map_list_loaded', {
          maps: this.list,
          tags: this.map_tags,
        });
      } else {
        global.shared.WINDOW.webContents.send('map_list_loaded', {
          maps: this.generateList(),
          tags: this.map_tags,
        });
      }
    }
  }

  generateList () {
    this.list = {};

    let directory_split = GMConfig.map_directory.split(path.sep);
    this.main_folder_name = directory_split[directory_split.length - 1];

    FileHelpers.readDir(GMConfig.map_directory, {
      types: ['image', 'video'],
      onFile: (dir, item, type) => {
        this.investigateFile(dir, item, type);
      },
      onError: (error) => {
        console.log(error);
      }
    });

    // There are some garbage folders we don't want to show
    // "Roll20" and "Gridless" are examples of folders that
    // are filler and we want their contents to be moved up
    // and their folder removed
    // Recurse through the list and remove the garbage folders
    const removeGarbageFolders = (list) => {
      for (let key in list) {
        if (GARBAGE_FOLDERS.includes(key)) {
          // Move the contents of the garbage folder up
          // and delete the garbage folder
          const garbage_folder = list[key];
          delete list[key];
          for (let k in garbage_folder) {
            list[k] = garbage_folder[k];
          }
          // We need to re-run the loop because we've changed
          // the list object
          removeGarbageFolders(list);
        } else if (typeof list[key] === 'object') {
          // Recurse through the list
          removeGarbageFolders(list[key]);
        }
      }
    };
    removeGarbageFolders(this.list);

    this.checkForVariations(this.list);

    return this.list;
  }

  splitOnLast (str, char) {
    const idx = str.lastIndexOf(char);
    if (idx === -1) return null; // char not found
    return [str.slice(0, idx), str.slice(idx)];
  }

  checkNameForVariation (file_name) {
    /*
      For variants, we mainly care about hyphens and parens found on the last word, and not before
      4-Way Road (night)
    */
    try {
      let split = this.splitOnLast(file_name, '(');
      if (!split) split = this.splitOnLast(file_name, '-');
      if (!split) split = this.splitOnLast(file_name, '[');
      if (!split) return null;

      return {
        base_map_name: split[0].trim(),
      };
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  checkForVariations (list) {
    /*
      Variation examples:
      "ANCIENT DWARVEN UNDEGROUND CITY 1 (cobwebs)"
      "ANCIENT DWARVEN UNDEGROUND CITY 1 (no cobwebs)"
      "CaveTunnelsVol4-1"
      "CaveTunnelsVol4-2"
      "CaveTunnelsVol4-3"
    */

    // Recurse through the list and check all "files" objects.
    // Each field name is a map name we want to check for variations
    // within the list. Map variants can be found by checking for "(" and "-".
    // If variants are found we want to add a new item to the "files" object
    // representing the base map name. This base map will have a "variants"
    // object which will basically look like the "files" object.
    const checkVariations = (list, parent) => {
      for (let key in list) {
        if (key === 'files') {
          // Check for variations
          const files = list[key];
          // We'll need to reset this and go through it again each time we find a variation
          // as we may be adding a base or deleting a variation
          let objectKeys = Object.keys(files);
          let index = 0;

          while (index < objectKeys.length) {
            const file_key = objectKeys[index];
            const file = files[file_key];
            const file_name = file.name;

            const variant_data = this.checkNameForVariation(file_name);
            if (variant_data) {
              // We have a variation, create the base map
              const { base_map_name } = variant_data;

              // Its a little expensive, but we should check to see if the map is worth
              // splitting or if its a false positive. As long as one other map exists
              // that substring matches the base map name, we'll assume its a variation
              let found = false;
              for (let i = 0; i < objectKeys.length; ++i) {
                const other_file_key = objectKeys[i];
                const other_file = files[other_file_key];
                const other_file_name = other_file.name;
                if (other_file_name.indexOf(base_map_name) !== -1 && other_file_name !== file_name) {
                  found = true;
                  break;
                }
              }
              if (!found) {
                ++index;
                continue;
              }

              if (!files[base_map_name]) {
                files[base_map_name] = {
                  ...copy(file),
                  name: base_map_name,
                  display_name: this.createDisplayName(base_map_name),
                  json_directory_base: path.join(GMConfig.json_directory, 'maps', `${base_map_name}.json`),
                  json_directory_unique: path.join(GMConfig.json_directory, 'maps', `${base_map_name}.json`),
                  variants: {},
                };
              }
              // Sometimes the base map exists with the proper name
              // so the map will exist but not have a variants object
              if (!files[base_map_name].variants) {
                files[base_map_name].variants = {};
                // In this scenario the base map wont be validated, since it wont match
                // the variation trigger. So we need to add it to the list of variations
                // as "base"
                files[base_map_name].variants.base = copy(files[base_map_name]);
              }
              // Add the variation
              let variation_name = file_name.replace(base_map_name, '').trim();
              variation_name = variation_name.replace(/^-+/, '').trim();
              if (variation_name[0] === '(' || variation_name[0] === '[') {
                variation_name = variation_name.slice(1, -1);
              }

              files[base_map_name].variants[variation_name] = copy(file);
              // Remove the variation from the list
              delete files[file_key];
              // We need to re-run the loop because we've changed
              // the list object
              objectKeys = Object.keys(files);

              index = 0;
            } else {
              ++index;
            }
          }

          for (const f in files) {
            this.checkJSONDirectory(files[f]);
          }

          if (parent && objectKeys.length === 1) {
            // There is only "one" map (probably with variants) left, we can remove the folder
            const file = files[objectKeys[0]];
            if (!parent.files) parent.files = {};
            parent.files[file.name] = file;
            delete parent[file.folder];
          }
        } else if (typeof list[key] === 'object') {
          // Recurse through the list
          checkVariations(list[key], list);
        }
      }
    }

    checkVariations(list);
  }

  checkJSONDirectory (map) {
    if (!map.variants) return;
    const map_keys = Object.keys(map.variants || {});
    if (!map_keys.length) return;

    // Check the top level, if it exists, pass it the variants and move on
    if (map.json_exists) {
      for (const variant in map.variants) {
        if (map.variants[variant].json_exists) continue;
        map.variants[variant].json_exists = true;
        map.variants[variant].json_directory = map.json_directory;
      }
      return;
    }

    // If not found, double check the variants to see if one exists
    let valid_variant_directory = null;
    for (let i = 0; i < map_keys.length; ++i) {
      const variant = map.variants[map_keys[i]];
      if (variant.json_exists) {
        valid_variant_directory = variant.json_directory;
        break;
      }
    }

    // Update the variants like if there is a base level and move on
    if (valid_variant_directory) {
      map.json_exists = true;
      map.json_directory = valid_variant_directory;
      for (const variant in map.variants) {
        if (map.variants[variant].json_exists) continue;
        map.variants[variant].json_exists = true;
        map.variants[variant].json_directory = valid_variant_directory;
      }
      return;
    }

    // Nothing legacy was found
    map.json_directory = map.json_directory_base;
    map.json_exists = fs.existsSync(map.json_directory);
    for (const variant in map.variants) {
      map.variants[variant].json_exists = map.json_exists;
      map.variants[variant].json_directory = map.json_directory_base;
    }
  }

  createDisplayName (file_name) {
    try {
      const noGridded = file_name.replace(/Gridded-\d+x\d+/i, '');
      const noGrid = noGridded.replace(/Grid-\d+x\d+/i, '');
      const cleaned = noGrid.replace(/-?\d+dpi VTT/i, '');
      const trimmed = cleaned.replace(/[-_!@#\$%^&*()+=\[\]{};':"\\|,.<>\/?~`]+$/, '');
      const dehyphened = trimmed.replace(/-|_/g, ' ');
      const spaced = dehyphened.replace(/([a-z])([A-Z])/g, '$1 $2');
      return spaced.trim().toUpperCase();
    } catch (e) {
      return file_name;
    }
  }

  investigateFile (dir, item, type) {
    // type is 'video' or 'image' based on the types passed into readDir
    const [file_name, file_type] = item.split('.');

    // If the file is a DM image, skip it
    if (file_name.match(/DM_|_DM| DM|DM |(DM)/)) return;

    // For non-DM images, Search for the DM version of the map
    let dm_version = null;
    for (let i = 0; i < DM_VARIATIONS_LENGTH; ++i) {
      const dm_ext = DM_VARIATIONS[i];
      // Check prepended dm version
      let dm_file_name = `${dm_ext}${file_name}.${file_type}`;
      dm_version = fs.existsSync(`${dir}/${dm_file_name}`) ? dm_file_name : null;
      if (dm_version) break;
      // Check appended dm version
      dm_file_name = `${file_name}${dm_ext}.${file_type}`;
      dm_version = fs.existsSync(`${dir}/${dm_file_name}`) ? dm_file_name : null;
      if (dm_version) break;
    }

    const json_directory = path.join(GMConfig.json_directory, 'maps', `${file_name}.json`);

    // Create the file object
    let file_obj = {
      name: file_name,
      display_name: this.createDisplayName(file_name),
      type: type,
      [type]: path.join(dir, item),
      dm_version: dm_version && path.join(dir, dm_version),
      json_directory: json_directory,
      json_directory_unique: json_directory,
      json_exists: fs.existsSync(json_directory),
      path: dir,
      folder: this.getFolderName(dir),
    };

    this.addToMapList(dir, file_obj);
  }

  getFolderName (dir) {
    try {
      const split_path = dir.split('/').reverse();
      for (let i = 0; i < split_path.length; ++i) {
        let folder_name = split_path[i];
        if (!folder_name) continue;
        folder_name = folder_name.trim();
        if (!GARBAGE_FOLDERS.includes(folder_name)) return folder_name;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  addToMapList (dir, file_obj) {
    // Remove the map directory path and only the leading path separator character
    const relative_directory = dir.replace(GMConfig.map_directory, '').replace(path.sep, '');
    const dir_split = [this.main_folder_name, ...relative_directory.split(path.sep), 'files'].filter(e => e);

    let curr = this.list;
    for (let i = 0; i <= dir_split.length; ++i) {
      if (i === dir_split.length) {
        // We've created the full path in the list, now
        // add the file under the file name
        curr[file_obj.name] = file_obj;
      } else {
        // Keep moving through list and create objects when needed
        const n = dir_split[i];
        curr[n] = curr[n] || {};
        curr = curr[n];
      }
    }
  }
}

module.exports = new MapManager();
