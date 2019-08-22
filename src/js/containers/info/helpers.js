const {
    createElement
} = require('../../helpers');

function addResult (container, result) {
    let new_result = createElement('div', 'result');
    let result_key = createElement('span', 'result_key', {
        html: result.type
    });
    let result_value = createElement('span', 'result_value', {
        html: result.value
    });
    new_result.append(result_key, result_value);
    // TODO: Find cleaner solution for this
    container.el_results.prepend(new_result);
}

function percentage () {
    return Math.floor(Math.random() * (100 - 1) + 1);
}

function randomFromList (list) {
    let list_index = Math.floor(Math.random() * list.length);
    return list[list_index];
}

function generateStandardButton (generator, container) {
    let el_button = createElement('div', 'info_button', {
        html: generator.title,
        events: {
            click: function (e) {
                for (var i = 0; i < container.amount_per_click; ++i) {
                    addResult(container, {
                        type: generator.title,
                        value: generator.generate()
                    });
                }
            }
        }
    });
    container.el_buttons.append(el_button);
}

function generateNameButtons (name_generator, container) {
    let male_button = createElement('div', 'info_button', {
        html: 'Male '  + name_generator.title,
        events: {
            click: function (e) {
                for (var i = 0; i < container.amount_per_click; ++i) {
                    addResult(container, {
                        type: 'Male ' + name_generator.title,
                        value: name_generator.generate(name_generator.male)
                    });
                }
            }
        }
    });

    let female_button = createElement('div', 'info_button', {
        html: 'Female ' + name_generator.title,
        events: {
            click: function (e) {
                for (var i = 0; i < container.amount_per_click; ++i) {
                    addResult(container, {
                        type: 'Female ' + name_generator.title,
                        value: name_generator.generate(name_generator.female)
                    });
                }
            }
        }
    });
    container.el_buttons.append(male_button, female_button);
}

module.exports = {
    addResult,
    randomFromList,
    percentage,
    generateNameButtons,
    generateStandardButton
};
