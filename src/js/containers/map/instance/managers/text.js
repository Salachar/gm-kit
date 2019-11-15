const {
    createElement
} = require('../../../../lib/helpers');

const Base = require('./base');
class TextManager extends Base {
    constructor (opts = {}) {
        super(opts);
        
        this.text_blocks = {};
        this.text_icons = {};

        this.text_block_node = document.getElementById('text_block_container');

        this.position = null;

        this.el_text_block = null;

        if (CONFIG.is_player_screen) return;

        this.render();
        this.loadTextBlocks();
    }

    get data () {
        return this.text_blocks;
    }

    get open () {
        return this.map_instance.manager.TextManager.open;
    }

    close () {
        this.map_instance.manager.TextManager.close();
    }

    loadTextBlocks () {
        this.text_blocks = (this.map_data.json || {}).text || {};
        for (let key in this.text_blocks) {
            this.addIcon({
                key: key,
                position: this.text_blocks[key].position
            });
        }
    }

    addText (text_data) {
        const position = {
            x: this.position.x,
            y: this.position.y
        };
        this.text_blocks[text_data.key] = {
            position: position,
            text: text_data.text
        };
        text_data.position = position;
        this.addIcon(text_data);
    }

    removeText (text_data) {
        const key = text_data.key || (text_data.position.x + '_' + text_data.position.y);
        delete this.text_blocks[key];
        this.text_icons[key].remove();
        delete this.text_icons[key];
        this.close();
    }

    addIcon (text_data) {
        ((data) => {
            const text_marker = createElement('div', 'text_marker', {
                addTo: this.el_text_container,
                html: '?',
                events: {
                    click: (e) => {
                        this.showTextInput(data.position);
                    }
                }
            });
            text_marker.style.top = data.position.y + 'px';
            text_marker.style.left = data.position.x + 'px';
            this.text_icons[data.key] = text_marker;
        })(text_data);
    }

    showTextInput (position) {
        this.position = position || {
            x: Mouse.x,
            y: Mouse.y
        };

        const key = this.position.x + '_' + this.position.y;
        const text = (this.text_blocks[key] || {}).text || '';

        this.map_instance.manager.TextManager.show({
            text: text,
            key: key,
            position: this.position,
            receiver: this
        });
    }

    render () {
        this.el_text_container = createElement('div', 'text_container', {
            addTo: this.map_instance.node
        });
    }
}

module.exports = TextManager;
