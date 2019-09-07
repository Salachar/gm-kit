const DOM = {
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
            if (!opts.addTo.length) opts.addTo = [opts.addTo];
            opts.addTo.forEach((container) => {
                container.appendChild(node);
            });
        }

        return node;
    },

    configureElement (node, opts = {}) {
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
