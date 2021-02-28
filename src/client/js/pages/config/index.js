const Button = require('../../lib/inputs/button');

const Container = require('../base');
class ConfigContainer extends Container {
    constructor (opts = {}) {
        super({
            ...opts,
            type: 'config',
        });

        this.render();
    }

    render () {
        Lib.dom.generate(['div .page', [
            ['div .container_header', [

            ]],
            ['div .container_body', [
              new Button('.choose_json_directory', {
                text: 'Choose JSON Directory',
                ipc_event: 'choose_json_directory',
              }),
              new Button('.choose_map_directory', {
                text: 'Choose Map Directory',
                ipc_event: 'choose_map_directory',
              }),
              new Button('.choose_audio_directory', {
                text: 'Choose Audio Directory',
                ipc_event: 'choose_audio_directory',
              }),
            ]]
        ]], null, this.node);
    }
}

module.exports = ConfigContainer;
