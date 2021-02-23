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
    },

    c: function (parent, html_array = []) {
        const [
            tag,
            identifiers = '',
            opts = {},
            children = []
        ] = html_array;

        let node = document.createElement(tag);

        (identifiers || '').split(' ').forEach((identifier) => {
            if (identifier[0] === '#') {
                node.id = identifier.replace('#','');
            }
            if (identifier[0] === '.') {
                node.classList.add( identifier.replace('.',''));
            }
        });

        // You know, incase the fucking html is the number 0
        if (typeof opts.html !== "undefined") {
            node.innerHTML = opts.html;
        }

        if (opts.events) {
            for (let event in opts.events) {
                node.addEventListener(event, opts.events[event]);
            }
        }

        parent.appendChild(node);

        if (children.length) {
            children.forEach((child_html_array) => {
                DOM.c(node, child_html_array);
            });
        }

        return node;
    },

    ctwo: function (parent, html_array = [], component) {
        // console.log(html_array);
        // console.log(html_array);
        if (!Array.isArray(html_array) || !html_array.length) return;

        const [
            markup,
            params_one = null,
            params_two = null,
        ] = html_array;

        let split_markup = markup.split(' ');
        const tag = split_markup.shift();
        let node = document.createElement(tag);

        let html = '';
        if (markup.match('HTML=')) {
            html = markup.split('HTML=')[1];
            split_markup.pop();
        }

        // let last_markup = split_markup[split_markup.length - 1];
        // // console.log(last_markup);
        // let html = '';
        // if (last_markup && last_markup.match('HTML=')) {
        //     html = split_markup.pop().replace('HTML=', '');
        //     console.log(html);
        // }

        // identifier being #id or .class
        split_markup.forEach((identifier) => {
            if (identifier[0] === '#') {
                const id = identifier.replace('#','');
                node.id = id;
                if (component) {
                    if (!component.refs) component.refs = {};
                    component.refs[id] = node;
                }

            }
            if (identifier[0] === '.') {
                node.classList.add( identifier.replace('.',''));
            }
        });

        let opts = null;
        let children = null;
        // check if params_one is an array, if so there are no options
        // and params_one is the array of child elements
        if (params_one && Array.isArray(params_one)) {
            opts = {};
            children = params_one;
        } else {
            opts = params_one || {};
            children = params_two || [];
        }

        // You know, incase the fucking html is the number 0
        html = html || opts.html;
        if (typeof html !== "undefined") {
            node.innerHTML = html;
        }

        if (opts.oncreate) {
            opts.oncreate(node);
        }

        if (opts.dataset) {
            for (let data in opts.dataset) {
                if (opts.dataset[data]) {
                    node.dataset[data] = opts.dataset[data];
                }
            }
        }

        // The most common events
        if (opts.click) {
            node.addEventListener('click', opts.click);
        }
        if (opts.mousedown) {
            node.addEventListener('mousedown', opts.mousedown);
        }
        if (opts.mouseup) {
            node.addEventListener('mouseup', opts.mouseup);
        }
        if (opts.mouseleave) {
            node.addEventListener('mouseleave', opts.mouseleave);
        }
        if (opts.keydown) {
            node.addEventListener('keydown', opts.keydown);
        }

        if (opts.contextmenu) {
            node.addEventListener('contextmenu', opts.contextmenu);
        }

        if (opts.onchange) {
            node.addEventListener('change', opts.onchange);
            node.addEventListener('keyup', opts.onchange);
        }
        if (opts.mouseend) {
            node.addEventListener('mouseup', opts.mouseend);
            node.addEventListener('mouseleave', opts.mouseend);
        }



        if (typeof opts.value !== opts.value) {
            node.value = opts.value;
        }

        if (opts.events) {
            for (let event in opts.events) {
                node.addEventListener(event, opts.events[event]);
            }
        }

        parent.appendChild(node);

        if (children.length) {
            children.forEach((child_html_array) => {
                DOM.ctwo(node, child_html_array, component);
            });
        }

        return node;
    },
};

module.exports = DOM;
