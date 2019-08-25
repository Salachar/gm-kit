const {
    createElement
} = require('../../helpers');

class FileManager {
    constructor (opts = {}) {
        this.map_list = null;

        this.onMapLoad = opts.onMapLoad;

        this.el_modal_wrap = document.getElementById('map_list_modal_wrap');
        this.el_modal_body = document.getElementById('map_list_modal_body');

        // Buttons
        this.el_open_button = document.getElementById('map_list_modal_open');
        this.el_folder_button = document.getElementById('map_list_modal_folder');
        this.el_close_button = document.getElementById('map_list_modal_close');

        this.el_map_list = document.getElementById('map_list_modal_body_list');
        this.el_map_preview = document.getElementById('map_list_modal_body_preview');

        // Reference to the current map hovered over for preview images
        this.current_map_hover = null;

        // List of maps that have been checked for mass open
        this.selected_maps = {};

        this.addInfoTitle();
        this.setEvents();
    }

    addInfoTitle () {
        if (!CONFIG.params.map_dir) return;
        document.getElementById('map_dir_location').setAttribute('title', CONFIG.params.map_dir);
    }

    createFileTree (map_list) {
        this.el_map_list.innerHTML = '';
        this.addSection(map_list, this.el_map_list);
        this.openModal();
    }

    addSection (sections, node) {
        for (let s in sections) {
            const section_node = createElement('div', 'map_list_section', {
                addTo: node
            });
            createElement('div', 'map_list_section_title', {
                html: s.replace(/_/g, ' '),
                addTo: section_node
            });
            const section_container = createElement('div', 'map_list_section_container', {
                addTo: section_node
            });

            if (s.match(/complete|image_only|json_only/)) {
                for (let f in sections[s]) {
                    // Closure to make sure reference to map is kept
                    ((map) => {
                        const map_node = createElement('div', 'map_list_map', {
                            html: map.name,
                            addTo: section_container,
                            events: {
                                click: (e) => {
                                    if (e.defaultPrevented) return;
                                    let selected_map = {};
                                    selected_map[map.name] = map;
                                    IPC.send('load_map', selected_map);
                                }
                            }
                        });

                        createElement('div', 'checkbox', {
                            addTo: map_node,
                            events: {
                                click: (e) => {
                                    e.preventDefault();
                                    const node = e.currentTarget;
                                    if (e.currentTarget.classList.contains('checked')) {
                                        node.classList.remove('checked');
                                        this.removeMap(map);
                                    } else {
                                        node.classList.add('checked');
                                        this.addMap(map);
                                    }
                                }
                            }
                        });

                        map_node.addEventListener('mouseenter', (e) => {
                            this.current_map_hover = map.image;
                            ((image_source) => {
                                let img = new Image;
                                img.onload = () => {
                                    if (image_source !== this.current_map_hover) return;
                                    this.el_map_preview.style.backgroundImage = `url("${img.src}")`;
                                }
                                img.src = image_source;
                            })(map.image);
                        });
                    })(sections[s][f]);
                }
            } else {
                this.addSection(sections[s], section_container);
            }
        }
    }

    searchMaps (sections, search_string) {
        let sections_copy = JSON.parse(JSON.stringify(sections));
        search(sections_copy);
        function search (sections) {
            for (let s in sections) {
                if (s.match(/complete|image_only|json_only/)) {
                    for (let f in sections[s]) {
                        let map = sections[s][f];
                        let name = map.name.toLowerCase();
                        if (name.indexOf(search_string) === -1) {
                            delete sections[s][f];
                        }
                    }

                } else if (s.toLowerCase().indexOf(search_string) === -1) {
                    search(sections[s]);
                }
                // If everything has been removed from the section, delete it
                if (!Object.keys(sections[s]).length) {
                    delete sections[s];
                }
            }
        }

        this.createFileTree(sections_copy);
    }

    addMap (map) {
        this.selected_maps[map.name] = map;
    }

    removeMap (map) {
        delete this.selected_maps[map.name];
    }

    openModal () {
        this.el_modal_wrap.classList.remove('hidden');
    }

    closeModal () {
        this.el_modal_wrap.classList.add('hidden');
        this.el_map_list.innerHTML = '';
        document.getElementById('map_list_search').value = '';
    }

    setEvents () {
        document.getElementById('load_files').addEventListener('click', (e) => {
            IPC.send('load_maps');
        });

        document.getElementById('no_map_screen_load').addEventListener('click', (e) => {
            IPC.send('load_maps');
        });

        this.el_open_button.addEventListener('click', (e) => {
            IPC.send('load_map', this.selected_maps);
        });

        this.el_close_button.addEventListener('click', (e) => {
            this.closeModal();
        });

        this.el_folder_button.addEventListener('click', (e) => {
            IPC.send('open_dialog_modal');
        });

        document.getElementById('map_list_search').addEventListener('keyup', (e) => {
            const search_string = e.currentTarget.value;
            console.log(search_string);
            this.searchMaps(this.map_list, search_string);
        });

        document.getElementById('save_map').addEventListener('click', (e) => {
            const map_data = window.AppManager.containers.map.getMapData();
            if (!map_data) {
                Toast.error('There is no map to save');
                return;
            }
            IPC.send('save_map', map_data);
        });

        document.getElementById('save_all_maps').addEventListener('click', (e) => {
            const map_data = window.AppManager.containers.map.getAllMapData();
            if (!map_data) {
                Toast.error('There are no maps to save');
                return;
            }
            IPC.send('save_map', map_data);
        });

        document.getElementById('save_state').addEventListener('click', (e) => {
            const map = window.AppManager.containers.map.current_map;
            const map_data = window.AppManager.containers.map.getMapData();
            const state_data = window.AppManager.containers.map.getMapStateData();
            map_data[map.name].json.state = state_data;
            IPC.send('save_map', map_data);
        });

        IPC.on('maps_loaded', (e, map_list) => {
            this.map_list = map_list;
            console.log(map_list);
            this.createFileTree(map_list);
        });

        IPC.on('map_loaded', (e, maps) => {
            this.onMapLoad(maps);
            this.closeModal();
        });
    }
}
module.exports = FileManager;
