const Button = require('../../lib/inputs/button');

const Container = require('../base');
class ConfigContainer extends Container {
  constructor (opts = {}) {
    super({
      ...opts,
      type: 'config',
    });

    console.log(CONFIG);

    this.render();
  }

  render () {
    Lib.dom.generate([
      ['div .container_header', [

      ]],
      ['div .container_body', [
        [`div .text_bold .fr_ml .fr_mt HTML=${CONFIG.json_directory}`],
        new Button('.choose_directory_button', {
          text: 'Choose JSON Directory',
          ipc_event: 'choose_json_directory',
        }),

        [`div .text_bold .fr_ml .fr_mt HTML=${CONFIG.map_directory}`],
        new Button('.choose_directory_button', {
          text: 'Choose Map Directory',
          ipc_event: 'choose_map_directory',
        }),

        [`div .text_bold .fr_ml .fr_mt HTML=${CONFIG.audio_directory}`],
        new Button('.choose_directory_button', {
          text: 'Choose Audio Directory',
          ipc_event: 'choose_audio_directory',
        }),
      ]]
    ], this, this.node);
  }
}

module.exports = ConfigContainer;
