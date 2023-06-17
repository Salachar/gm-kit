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

  generate: function (html_array = [], component, appendTo) {
    const is_array = Array.isArray(html_array);
    const is_obj = typeof html_array === 'object';

    // garbage
    if (!is_array && !is_obj) return null;
    // [] : empty array
    if (is_array && !html_array.length) return null;
    // node
    if (!is_array && is_obj) {
      // if (component) {
      //     if (!component.refs) component.refs = {};
      //     component.refs[html_array.id] = html_array;
      // }
      appendTo.appendChild(html_array);
      return html_array;
    }

    const is_first_item_obj = typeof html_array[0] === 'object';
    // array or object/node both identify as object
    // [node, node] or [['div'], ['div']]
    if (is_first_item_obj) {
      html_array.forEach((child_html_array) => {
        DOM.generate(child_html_array, component, appendTo);
      });
      return;
    }

    const [
      markup,
      params_one = null,
      params_two = null,
    ] = html_array;

    let tag = "div";
    const first_char = markup[0];
    const split_markup = markup.split(' ');
    if (first_char !== "." && first_char !== "#") {
      tag = split_markup.shift();
    }
    let node = document.createElement(tag);

    let html = '';
    if (markup.match('HTML=')) {
      html = markup.split('HTML=')[1];
      split_markup.pop();
    }

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

    [
      'click',
      'mousedown',
      'mouseup',
      'mouseleave',
      'keydown',
      'contextmenu',
      'mouseenter',
    ].forEach((event_type) => {
      if (opts[event_type]) {
        node.addEventListener(event_type, opts[event_type]);
      }
    })

    if (opts.onchange) {
      node.addEventListener('change', opts.onchange);
      node.addEventListener('keyup', opts.onchange);
    }
    if (opts.mouseend) {
      node.addEventListener('mouseup', opts.mouseend);
      node.addEventListener('mouseleave', opts.mouseend);
    }

    if (typeof opts.value !== "undefined") {
      node.value = opts.value;
    }

    if (opts.styles) {
      for (let style in opts.styles) {
        node.style[style] = opts.styles[style];
      }
    }

    if (opts.title) {
      node.title = opts.title;
    }

    if (opts.placeholder) {
      node.placeholder = opts.placeholder;
    }

    if (opts.attributes) {
      for (let attr in opts.attributes) {
        if (opts.attributes[attr]) {
          node.setAttribute(attr, opts.attributes[attr]);
        }
      }
    }

    if (opts.events) {
      for (let event in opts.events) {
        node.addEventListener(event, opts.events[event]);
      }
    }

    if (appendTo) appendTo.appendChild(node);

    if (children.length) {
      children.forEach((child_html_array) => {
        DOM.generate(child_html_array, component, node);
      });
    }

    return node;
  },
};

module.exports = DOM;
