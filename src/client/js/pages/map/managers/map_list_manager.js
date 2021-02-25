class MapListManager {
    constructor (opts = {}) {
        this.map_list = null;

        this.onMapLoad = opts.onMapLoad;

        // Reference to the current map hovered over for preview images
        this.current_map_hover = null;

        // List of maps that have been checked for mass open
        this.selected_maps = {};

        this.setIPCEvents();
    }

    setIPCEvents () {
        IPC.on('maps_loaded', (e, map_list) => {
            this.map_list = map_list;
            this.createFileTree(map_list);
        });

        IPC.on('map_loaded', (e, maps) => {
            this.onMapLoad(maps);
            this.closeModal();
        });
    }

    addMap (map) {
        this.selected_maps[map.name] = map;
    }

    removeMap (map) {
        delete this.selected_maps[map.name];
    }

    openModal () {
        this.refs.map_list_modal_wrap.classList.remove('hidden');
    }

    closeModal () {
        this.refs.map_list_modal_wrap.classList.add('hidden');
        this.refs.map_list_modal_body_list.innerHTML = '';
        this.refs.map_list_search.value = '';
    }

    searchMaps (sections, search_string) {
        let sections_copy = JSON.parse(JSON.stringify(sections));
        search(sections_copy);
        function search (sections) {
            for (let s in sections) {
                if (s.match(/complete|image|video|json/)) {
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

    createFileTree (map_list) {
        this.refs.map_list_modal_body_list.innerHTML = '';
        console.log(map_list);
        Lib.dom.generate(this.generateSectionNodes(map_list), this, this.refs.map_list_modal_body_list);
        this.openModal();
    }

    generateSectionNodes (sections) {
        return Object.keys(sections).map((s) => {
            return Lib.dom.generate(['div .map_list_section', [
                [`div .map_list_section_title HTML=${s.replace(/_/g, ' ')}`],
                ['div .map_list_section_container', [
                    s.match(/complete|image|video|json/) ? Object.keys(sections[s]).map((f) => {
                        const map = sections[s][f];
                        return Lib.dom.generate([`div .map_list_map HTML=${map.name}`, {
                          click: (e) => {
                              if (e.defaultPrevented) return;
                              let selected_map = {};
                              selected_map[map.name] = map;
                              IPC.send('load_map', selected_map);
                          },
                          mouseenter: (e) => {
                              if (!map.image) {
                                  console.log(`No image to display for map: ${map.name}`);
                                  this.refs.map_list_modal_body_preview.style.backgroundImage = '';
                                  return;
                              }
                              this.current_map_hover = map.image;
                              ((image_source) => {
                                  let img = new Image;
                                  img.onload = () => {
                                      if (image_source !== this.current_map_hover) return;
                                      this.refs.map_list_modal_body_preview.style.backgroundImage = `url("${img.src}")`;
                                  }
                                  img.src = image_source;
                              })(map.image);
                          }
                        }, [
                            ['div .checkbox', {
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
                            }]
                        ]])
                    }) : this.generateSectionNodes(sections[s])
                ]]
            ]])
        })
    }

    render () {
        return Lib.dom.generate(['div #map_list_modal_wrap .hidden', [
            ['div #map_list_modal .modal', [
                ['div .modal_header', [
                    ['div .modal_title', [
                        ['span .modal_title_info HTML=&#9432;'],
                        ['span .modal_title_text HTML=Select Map:', {
                            attributes: {
                                title: CONFIG.params.map_dir
                            }
                        }],
                    ]],
                    ['div .modal_header_buttons', [
                        ['input #map_list_search .text_input', {
                            onchange: (e) => {
                                const search_string = e.currentTarget.value;
                                this.searchMaps(this.map_list, search_string);
                            }
                        }],
                        ['div #map_list_modal_folder .button HTML=MAP DIRECTORY', {
                            click: (e) => IPC.send('open_map_dialog_modal')
                        }],
                        ['div #map_list_modal_open .button HTML=OPEN SELECTED', {
                            click: (e) => IPC.send('load_map', this.selected_maps)
                        }],
                    ]],
                    ['div #map_list_modal_close .modal_close', {
                        click: (e) => this.closeModal()
                    }],
                ]],
                ['div #map_list_modal_body .modal_body', [
                    ['div #map_list_modal_body_preview'],
                    ['div #map_list_modal_body_list']
                ]],
            ]],
        ]], this);
    }
}
module.exports = MapListManager;
