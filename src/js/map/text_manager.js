const Store = require('../store');

const {
    createElement
} = require('../helpers');

class TextManager {
    constructor (map = {}, parent, options = {}) {
        this.map = map;
        this.parent = parent;

        this.text_blocks = {};
        this.text_icons = {};

        this.position = null;
        this.open = false;

        this.el_text_block = null;

        this.beforeRender();
        this.render();
        this.afterRender();
    }

    get data () {
        return this.text_blocks;
    }

    loadTextBlocks () {
        this.text_blocks = this.map.json.text || {};
        for (let key in this.text_blocks) {
            this.addIcon(this.text_blocks[key].position, key);
        }
    }

    generateTextBlockField (position) {
        this.position = position || {
            x: Mouse.x,
            y: Mouse.y
        };
        this.open = true;
        this.showTextInput();
    }

    onTextBlockClick () {

    }

    addIcon (position, text_key) {
        console.log(position, text_key);
        ((pos, key) => {
            const text_marker = createElement('div', 'text_marker', {
                addTo: this.el_text_container,
                html: '?',
                events: {
                    click: (e) => {
                        console.log(this.text_blocks[key]);
                        this.generateTextBlockField(pos);
                    }
                }
            });
            text_marker.style.top = pos.y + 'px';
            text_marker.style.left = pos.x + 'px';
            this.text_icons[key] = text_marker;
        })(position, text_key);
    }

    close () {
        this.position = null;
        this.open = false;
        this.el_text_block.classList.add('hidden');
    }

    showTextInput () {
        this.el_text_block.style.top = this.position.y + 'px';
        this.el_text_block.style.left = this.position.x + 'px';
        const text_key = this.position.x + '_' + this.position.y;
        this.el_text_area.value = (this.text_blocks[text_key] || {}).text || '';
        this.el_text_block.classList.remove('hidden');
        this.el_text_area.scrollTop = 0;
    }

    setEvents () {
        this.el_save_button.addEventListener('click', (e) => {
            const text_key = this.position.x + '_' + this.position.y;
            this.text_blocks[text_key] = {
                position: {
                    x: this.position.x,
                    y: this.position.y
                },
                text: this.el_text_area.value
            };
            this.addIcon(this.position, text_key);
            this.close();
        });

        this.el_edit_button.addEventListener('click', (e) => {
            // const key = this.position.x + '_' + this.position.y;
            // delete this.text_blocks[key];
            // this.text_icons[key].remove();
            // delete this.text_icons[key];
            // this.close();
        });

        this.el_delete_button.addEventListener('click', (e) => {
            const key = this.position.x + '_' + this.position.y;
            delete this.text_blocks[key];
            this.text_icons[key].remove();
            delete this.text_icons[key];
            this.close();
        });

        this.el_close_button.addEventListener('click', (e) => {
            this.close();
        });
    }

    beforeRender () {

    }

    render () {
        this.el_text_container = createElement('div', 'text_container', {
            addTo: this.parent.node
        });

        this.el_text_block = createElement('div', 'text_block_modal modal hidden', {
            addTo: this.el_text_container,
            html: (
                `<div class="modal_header">
                    <div class="modal_header_buttons"></div>
                </div>
                <div class="modal_body">
                    <div class="text_block_textarea"></div>
                </div>`
            )
        });

        this.el_save_button = createElement('div', 'text_block_save button', {
            addTo: this.el_text_block.getElementsByClassName('modal_header_buttons')[0],
            html: 'SAVE'
        });

        this.el_edit_button = createElement('div', 'text_block_save button', {
            addTo: this.el_text_block.getElementsByClassName('modal_header_buttons')[0],
            html: 'EDIT'
        });

        this.el_delete_button = createElement('div', 'text_block_save button', {
            addTo: this.el_text_block.getElementsByClassName('modal_header_buttons')[0],
            html: 'DELETE'
        });

        this.el_close_button = createElement('div', 'modal_close', {
            addTo: this.el_text_block.getElementsByClassName('modal_header')[0]
        });

        this.el_text_area = createElement('textarea', 'text_area', {
            addTo: this.el_text_block.getElementsByClassName('text_block_textarea')[0]
        });
    }

    afterRender () {
        this.setEvents();
        this.loadTextBlocks();
    }
}
module.exports = TextManager;
