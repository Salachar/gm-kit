const {
    createElement
} = Lib.helpers;

class Container {
    constructor (opts = {}) {
        this.node = null;
        this.tab = null;

        this.parent = opts.parent;
        this.type = opts.type;
        this.active = false;

        this.createNode(this.type);
        this.createTab(this.type);
        this.render();

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
        this.node = createElement('div', `${class_name} container`, {
            addTo: document.getElementById('containers')
        });
    }

    createTab (tab_title) {
        this.tab = createElement('div', 'tab', {
            html: tab_title,
            addTo: document.getElementById('tabs'),
            events: {
                click: (e) => {
                    this.parent.setActiveContainer(this);
                }
            }
        });
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

    render () {
        this.node.innerHTML = this.template();
        this.container_header = this.node.getElementsByClassName('container_header')[0];
        this.container_body = this.node.getElementsByClassName('container_body')[0];
    }
}

module.exports = Container;