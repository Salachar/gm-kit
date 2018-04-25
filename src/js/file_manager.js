const createElement = require('./helpers').createElement;

class FileManager {
    constructor (opts = {}) {
        // Default file name, kinda moot now, only used when saving and no image was loaded
        // There is really no point in saving just json with no image at the moment
        this.file_name = 'mapthing';
        // Reference to the map list created by reading the file system
        this.map_list = {};

        this.selected_maps = {};

        this.base_node = null;

        this.onMapLoad = opts.onMapLoad;

        this.el_modal_wrap = document.getElementById('map_list_modal_wrap');
        this.el_modal_body = document.getElementById('map_list_modal_body');
        this.el_open_button = document.getElementById('map_list_modal_open');

        this.setEvents();
    }

    createFileTree (map_list) {
        // debugger;
        this.map_list = map_list;

        console.log(map_list);

        this.el_modal_body.innerHTML = '';
        this.addSection(map_list, this.el_modal_body);

        this.openModal();
    }

    addSection (sections, node) {
        for (var s in sections) {
            let section_node = createElement('div', 'map_list_section', {
                addTo: node
            });
            let section_title = createElement('div', 'map_list_section_title', {
                html: s,
                addTo: section_node
            });
            let section_container = createElement('div', 'map_list_section_container', {
                addTo: section_node
            });

            if (s.match(/complete|image_only|json_only/)) {
                for (var f in sections[s]) {
                    // Closure to make sure reference to map is kept
                    ((map) => {
                        let map_node = createElement('div', 'map_list_map', {
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

                        let map_node_checkbox = createElement('div', 'checkbox', {
                            addTo: map_node,
                            events: {
                                click: (e) => {
                                    e.preventDefault();
                                    let node = e.currentTarget;
                                    let is_checked = e.currentTarget.classList.contains('checked');
                                    if (is_checked) {
                                        node.classList.remove('checked');
                                        this.removeMap(map);
                                    } else {
                                        node.classList.add('checked');
                                        this.addMap(map);
                                    }
                                }
                            }
                        });
                    })(sections[s][f]);
                }
            } else {
                this.addSection(sections[s], section_container);
            }
        }
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
        this.el_modal_body.innerHTML = '';
    }

    setEvents () {
        document.getElementById('load_files').addEventListener('click', (e) => {
            IPC.send('load_maps');
        });

        document.getElementById('no_map_screen_load').addEventListener('click', (e) => {
            IPC.send('load_maps');
        });

        document.getElementById('map_list_modal_open').addEventListener('click', (e) => {
            IPC.send('load_map', this.selected_maps);
        });

        document.getElementById('map_list_modal_close').addEventListener('click', (e) => {
            this.closeModal();
        });

        document.getElementById('save_map').addEventListener('click', (e) => {
            let map_data = window.MapManager.getMapData();
            if (!map_data) {
                Toast.error('There is no map to save');
                return;
            }
            IPC.send('save_map', map_data);
        });

        document.getElementById('save_all_maps').addEventListener('click', (e) => {
            let map_data = window.MapManager.getAllMapData();
            if (!map_data) {
                Toast.error('There are no maps to save');
                return;
            }
            IPC.send('save_map',map_data);
        });

        IPC.on('maps_loaded', (e, maps) => {
            this.createFileTree(maps);
        });

        IPC.on('map_loaded', (e, maps) => {
            this.onMapLoad(maps);
            this.closeModal();
        });
    }
}
module.exports = FileManager;
