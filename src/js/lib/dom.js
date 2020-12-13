const DOM = {
    listener (node, event, handler, opts = {}) {
        // Node can be an id string or an element
        if (typeof node === 'string') {
            node = document.getElementById(node);
        }
        node.addEventListener(event, (e) => {
            if (opts.prevent_default) {
                e.preventDefault();
            }
            handler(e);
        });
    },
    
    cacheElements (obj, cache_list) {
        cache_list.forEach((id) => {
            obj['el_' + id] = document.getElementById(id);
        });
    },

    createElement: function (type, classes, opts = {}) {
        let node = document.createElement(type);

        (classes || '').split(' ').forEach((class_name) => {
            node.classList.add(class_name);
        });

        DOM.configureElement(node, opts);

        if (opts.prependTo) {
            if (!opts.prependTo.length) opts.prependTo = [opts.prependTo];
            opts.prependTo.forEach((container) => {
                container.insertBefore(node, container.firstChild);
            });
        }

        if (opts.addTo) {
            let container = opts.addTo;
            if (typeof container === 'string') {
                container = document.getElementById(container);
            }
            container.appendChild(node);
        }

        return node;
    },

    configureElement: function (node, opts = {}) {
        if (opts.attributes) {
            for (let attr in opts.attributes) {
                if (opts.attributes[attr]) {
                    node.setAttribute(attr, opts.attributes[attr]);
                }
            }
        }

        if (opts.dataset) {
            for (let data in opts.dataset) {
                if (opts.dataset[data]) {
                    node.dataset[data] = opts.dataset[data];
                }
            }
        }
        // You know, incase the fucking html is the number 0
        if (typeof opts.html !== "undefined") {
            node.innerHTML = opts.html;
        }

        if (opts.events) {
            for (let event in opts.events) {
                node.addEventListener(event, opts.events[event]);
            }
        }

        if (opts.css) {
            for (let style in opts.css) {
                node.style[style] = opts.css[style];
            }
        }

        return node;
    }

};

module.exports = DOM;
