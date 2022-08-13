class Container {
  constructor (opts = {}) {
    this.node = null;
    this.tab = null;

    this.parent = opts.parent;
    this.type = opts.type;
    this.active = false;

    this.createNode(this.type);
    this.createTab(this.type);

    if (opts.active === true) {
      this.parent.setActiveContainer(this);
    }
  }

  keyDown (key_code) {
    if (!this.active) return;
    this.onKeyDown(key_code);
  }

  keyUp (key_code) {
    if (!this.active) return;
    this.onKeyUp(key_code);
  }

  onKeyDown () {}

  onKeyUp () {}

  createNode (class_name) {
    const parent = document.getElementById('containers');
    this.node = Lib.dom.generate([`div ${class_name} .container`], null, parent);
  }

  createTab (tab_title) {
    this.tab = Lib.dom.generate([`div .tab HTML=${tab_title}`, {
      click: (e) => this.parent.setActiveContainer(this)
    }], null, document.getElementById('tabs'));
  }

  setActive () {
    this.active = true;
    this.tab.classList.add('active');
    this.node.classList.add('active');
  }

  setDisabled () {
    this.active = false;
    this.tab.classList.remove('active');
    this.node.classList.remove('active');
  }
}

module.exports = Container;
