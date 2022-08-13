class PlayerScreenManager {
  constructor () {
    this.current_map_data = null;

    this.window = null;

    this.window_options = {
      // autoHideMenuBar: 1,
      // titleBarStyle: 'hidden',
    };

    Store.register({
      'show_player_screen': this.onShowPlayerScreen.bind(this),
      'player_screen_loaded': this.onPlayerScreenLoad.bind(this),
      'player_screen_unloaded': this.close.bind(this),
      'player_screen_remove_map': this.remove.bind(this)
    });
  }

  get is_open () {
    // A window has been created and is still open
    return (this.window && !this.window.closed);
  }

  onShowPlayerScreen () {
    this.create().show();
  }

  onPlayerScreenLoad () {
    this.create();
    Store.fire('store_data_set_(PS)',Store.data);
    this.show();
  }

  create () {
    if (this.is_open) return this;

    this.window = window.open(
      '../html/player_screen.html',
      'electron',
      this.generateParamString()
    );

    // Global for now for legacy purposes
    // while I remove those dependencies
    window.player_screen = this.window;

    // Clear all key downs, key ups dont register properly when a new
    // window open and the old one loses focus
    KEY_DOWN = {};

    return this;
  }

  show () {
    this.current_map_data = Store.get('current_map_data');
    this.window.postMessage({
      event: 'display_map',
      data: this.current_map_data,
      config: CONFIG,
    });
    Store.fire('zoom_(ps)', {
      zoom: this.current_map_data.meta.zoom,
    });
    Store.fire('brightness_(ps)', {
      brightness: this.current_map_data.meta.brightness,
    });
  }

  remove (data) {
    this.send('remove_map', data.map_name);
  }

  send (event, payload) {
    if (!this.is_open) return;
    this.window.postMessage({
      event: event,
      data: payload,
    });
  }

  close () {
    console.log('PlayerScreenManager >> close');
    this.current_map_data = null;
    this.window = null;
  }

  generateParamString () {
    let params = '';
    for (let x in this.window_options) {
      params += x + '=' + this.window_options[x] + ','
    }
    return params;
  }
}

module.exports = new PlayerScreenManager();
