class Base {
  constructor (opts = {}) {
    this.map_data = opts.map_data || {};
    this.map_data.json = this.map_data.json || {};
    this.map_instance = opts.map_instance;
  }
}

module.exports = Base;
