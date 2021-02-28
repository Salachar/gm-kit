class TextManager {
    constructor (opts = {}) {
        this.open = false;
        this.current_text_data = null;
    }

    show (text_data) {
        this.open = true;
        this.current_text_data = text_data;
        this.refs.text_block_container.classList.add('show');
        this.refs.text_block_textarea.value = text_data.text;
        this.refs.text_block_textarea.scrollTop = 0;
    }

    close () {
        this.open = false;
        this.refs.text_block_container.classList.remove('show');
    }

    render () {
        return Lib.dom.generate(['div #text_block_container', [
            ['div .text_block_header', [
                ['div .text_block_header_buttons', [
                    ['div #text_block_save .button HTML=SAVE', {
                        click: (e) => {
                            this.current_text_data.receiver.addText({
                                text: this.refs.text_block_textarea.value,
                                key: this.current_text_data.key
                            });
                            this.close();
                            Store.fire('save_maps');
                        }
                    }],
                    ['div #text_block_delete .button HTML=DELETE', {
                        click: (e) => {
                            this.current_text_data.receiver.removeText({
                                key: this.current_text_data.key,
                                position: this.current_text_data.position
                            });
                        }
                    }]
                ]],
                ['div #text_block_close', {
                    click: (e) => this.close()
                }],
            ]],
            ['div .text_block_body', [
                ['textarea #text_block_textarea']
            ]]
        ]], this);
    }
}

module.exports = TextManager;
