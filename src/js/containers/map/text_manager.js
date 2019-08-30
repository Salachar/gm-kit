const {
    cacheElements
} = require('../../lib/helpers');

class TextManager {
    constructor (opts = {}) {
        this.el_text_block_container = document.getElementById('text_block_container');

        this.open = false;
        this.current_text_data = null;

        const cache_list = [
            'text_block_save',
            'text_block_delete',
            'text_block_close',
            'text_block_textarea'
        ];

        cacheElements(this, cache_list);

        this.setEvents();
    }

    show (text_data) {
        this.open = true;
        this.current_text_data = text_data;
        this.el_text_block_container.classList.add('show');
        this.el_text_block_textarea.value = text_data.text;
        this.el_text_block_textarea.scrollTop = 0;
    }

    close () {
        this.open = false;
        this.el_text_block_container.classList.remove('show');
    }

    setEvents () {
        this.el_text_block_save.addEventListener('click', (e) => {
            this.current_text_data.receiver.addText({
                text: this.el_text_block_textarea.value,
                key: this.current_text_data.key
            });
            this.close();
            Store.fire('save_map');
        });

        this.el_text_block_delete.addEventListener('click', (e) => {
            this.current_text_data.receiver.removeText({
                key: this.current_text_data.key,
                position: this.current_text_data.position
            });
        });

        this.el_text_block_close.addEventListener('click', (e) => {
            this.close();
        });
    }
}

module.exports = TextManager;
