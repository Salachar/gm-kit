const Button = require('../../../lib/inputs/button');

class MapListManager {
  constructor (opts = {}) {
    this.map_list = null;

    this.onMapLoad = opts.onMapLoad;

    // Reference to the current map hovered over for preview images
    this.current_map_hover = null;

    this.collapsed_sections = {};

    this.setIPCEvents();
  }

  setIPCEvents () {
    IPC.on('map_list_loaded', (e, map_list) => {
      this.map_list = map_list;
      this.createFileTree(map_list);
    });

    IPC.on('maps_loaded', (e, maps) => {
      this.onMapLoad(maps);
      // this.closeModal();
    });

    IPC.on('map_directory_chosen', (e) => {
      IPC.send('load_map_list');
    });
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
        if (s.match(/complete|image|video|files|json/)) {
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
    // There is always one folder at the top level, and we dont want to display it
    const top_level_folder = map_list[Object.keys(map_list)[0]];
    Lib.dom.generate(this.generateSectionNodes(top_level_folder), this, this.refs.map_list_modal_body_list);
    this.openModal();
  }

  generateSectionNodes (sections) {
    // This version will put files under the section name directly
    // and not under "files" or "image", etc...

    let node_array = [];

    // check for the loose files section so we can put them at the top
    if (sections.files) {
      Object.keys(sections.files).forEach((f) => {
        const map = sections.files[f];
        node_array.push(this.generateFileNode(map));
      })
    }

    Object.keys(sections).forEach((section_name) => {
      // Skip the "files" section, we've already handled it
      if (section_name === 'files') return;

      const section_node = Lib.dom.generate(
        ['div .map_list_section', [
          [`div .map_list_section_title HTML=${section_name.replace(/_/g, ' ')}`, {
            click: (e) => {
              const container = e.target.nextSibling;
              if (!container) return;
              container.classList.toggle('hidden');
              this.collapsed_sections[section_name] = container.classList.contains('hidden');
            }
          }],
          ['div .map_list_section_container', {
            oncreate: (node) => {
              if (this.collapsed_sections[section_name]) {
                node.classList.add('hidden');
              }
            }
          }, [
            this.generateSectionNodes(sections[section_name])
          ]]
        ]]
      );

      node_array.push(section_node);
    });

    return node_array;
  }

  generateFileNode (map) {
    return Lib.dom.generate(
      ['div .map_list_map', {
        mouseenter: (e) => {
          this.refs.map_list_modal_body_preview.innerHTML = '';

          if (!map.image && !map.video) {
            this.refs.map_list_modal_body_preview.style.backgroundImage = '';
            return;
          }

          if (map.image) {
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

          if (map.video) {
            this.refs.map_list_modal_body_preview.style.backgroundImage = '';
            this.current_map_hover = map.video;
            const video_preview = document.createElement('video');
            video_preview.src = map.video;
            video_preview.autoplay = true;
            video_preview.loop = true;
            video_preview.muted = true;
            this.refs.map_list_modal_body_preview.appendChild(video_preview);
          }
        }
      }, [
        ['div .map_list_map_name_wrapper', {
          click: (e) => {
            if (e.defaultPrevented) return;
            let selected_maps = {};
            selected_maps[map.name] = map;
            IPC.send('load_maps', selected_maps);
          },
        }, [
          [`span .map_list_map_indicator ${map.json_exists ? '.lit_up' : ''} HTML=W`],
          [`span .map_list_map_indicator ${map.dm_version ? '.lit_up' : ''} HTML=D`],
          [`span .map_list_map_indicator ${map.video ? '.lit_up' : ''} HTML=V`],
          [`span .map_list_map_name HTML=${map.name}`],
        ]],
      ]
    ]);
  }

  render () {
    return Lib.dom.generate(['div #map_list_modal_wrap .hidden', [
      ['div #map_list_modal_body_preview'],
      ['div .map_list_container', [
        ['div .modal_header', [
          ['input #map_list_search .map_search_input', {
            attributes: {
              placeholder: "SEARCH",
            },
            onchange: (e) => {
              let search_string = e.currentTarget.value || "";
              search_string = search_string.trim();
              search_string = search_string.toLowerCase();
              this.searchMaps(this.map_list, search_string);
            }
          }],
          ['div #map_list_modal_close .modal_close HTML=CLOSE', {
            click: (e) => this.closeModal()
          }],
        ]],
        ['div #map_list_modal_body_list'],
      ]]
    ]], this);
  }
}

module.exports = MapListManager;
