const IMAGES = {
    'MAP': {
        'MAP_ONE_WAY_WALL': 'https://i.lensdump.com/i/isto45.png',
        'MAP_DOORS': 'https://i.lensdump.com/i/istYtC.png',
        'PLAYER_SCREEN_ONE': 'https://i.lensdump.com/i/istzMi.png',
        'PLAYER_SCREEN_TWO': 'https://i.lensdump.com/i/istn69.png',
    },
    'AUDIO': {
        'OVERVIEW': 'https://i.lensdump.com/i/istvz2.png',
    },
    'INFO': {
        'OVERVIEW': 'https://i.lensdump.com/i/istSao.png',
    },
    'LIGHTS': {
        'OVERVIEW': 'https://i.lensdump.com/i/istLbv.png',
    }
}

let el_image_modal = null;
let el_image_modal_img = null;

function populateImages () {
    for (let section_key in IMAGES) {
        try {
            const section_node = document.getElementById(section_key.toLowerCase());
            const section_images = section_node.getElementsByClassName('section_images')[0];
            for (let image_key in IMAGES[section_key]) {
                const image_source = IMAGES[section_key][image_key];
                let image_node = createElement('img', 'section_image', {
                    src:  image_source,
                    addTo: section_images
                });

                image_node.addEventListener('click', (e) => {
                    el_image_modal.classList.remove('hidden');
                    el_image_modal_img.style.backgroundImage = `url("${image_source}")`;
                });
            }
        } catch (e) {
            console.error('Problem loading images for key: ' + image_key);
            console.log(e);
        }
    }
}

window.onload = () => {
    el_image_modal = document.getElementById('image_modal');
    el_image_modal_img = document.getElementById('image_modal_img');

    el_image_modal.addEventListener('click', (e) => {
        el_image_modal.classList.add('hidden');
        el_image_modal_img.style.backgroundImage = `url("")`;
    });

    populateImages();

}

function createElement (type, classes, opts = {}) {
    let node = document.createElement(type);

    (classes || '').split(' ').forEach((class_name) => {
        node.classList.add(class_name);
    });

    configureElement(node, opts);

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
}

function configureElement (node, opts = {}) {
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

    if (opts.src) {
        node.src = opts.src;
    }

    return node;
}
