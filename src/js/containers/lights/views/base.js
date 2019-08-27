class Base {
    constructor () {

    }

    updateElement (node, opts) {
        opts = opts || {};
        return this.configureElement(node, opts);
    }

    createElement (type, classes, opts) {
        opts = opts || {};
        let node = document.createElement(type);

        let classes_split = classes.split(' ');
        for (let i = 0; i < classes_split.length; ++i) {
            node.classList.add(classes_split[i]);
        }

        node = this.configureElement(node, opts);

        if (opts.addTo) {
            opts.addTo.appendChild(node);
        }

        return node;
    }

    configureElement (node, opts) {
        opts = opts || {};

        if (opts.attributes) {
            for (let attr in opts.attributes) {
                node.setAttribute(attr, opts.attributes[attr]);
            }
        }

        if (opts.html) {
            node.innerHTML = opts.html;
        }

        if (opts.handlers) {
            for (let handler in opts.handlers) {
                node.addEventListener(handler, opts.handlers[handler]);
            }
        }

        if (opts.styles) {
            for (let style in opts.styles) {
                node.style[style] = opts.styles[style];
            }
        }

        return node;
    }

    update () {

    }

    render () {

    }
}

module.exports = Base;
