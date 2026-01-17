const Lib = require('..');
const Base = require('./base');
class RadioInput extends Base {
  constructor (identifiers, props = {}) {
    if (typeof identifiers === 'object') {
      props = identifiers;
      identifiers = '';
    }

    super(identifiers, props);

    this.radio_inputs = [];

    this.props = {
      identifiers: identifiers || '',
      options: [],
      ...props,
    };

    return this.render();
  }

  deselect () {
    const {
      store_key,
      store_event,
    } = this.props;

    this.radio_inputs.forEach((radio_input) => {
      radio_input.classList.remove('checked');
    });

    this.handleStore({
      store_key,
      store_event,
    }, null);
  }

  render () {
    const {
      identifiers,
      options,
    } = this.props;

    return Lib.dom.generate(
      [`div ${identifiers} .radio_input`, [
        ...options.map((option) => {
          let value = option;
          let label = option;
          if (typeof option === 'object') {
            value = option.value;
            label = option.label || value;
          }
          return ['div .checkbox_container', [
            ['div .checkbox', {
              oncreate: (node) => {
                this.radio_inputs.push(node);
              },
              click: (e) => {
                const {
                  store_key,
                  store_event,
                } = this.props;
                const checkbox = e.target;
                // The current state of the checkbox
                // If true, we're moving to false
                // If false, we're moving to true
                const is_checked = checkbox.classList.contains('checked');
                // Unselect all checkboxes
                this.radio_inputs.forEach((radio_input) => {
                  radio_input.classList.remove('checked');
                });
                let new_value = null;
                if (!is_checked) {
                  // If the previous state was unchecked, move to checked
                  checkbox.classList.add('checked');
                  new_value = value;
                }
                this.handleStore({
                  store_key,
                  store_event,
                }, new_value);
              }
            }],
          [`div .checkbox_label HTML=${label}`],
        ]];
      }),
    ]]);
  }
}

module.exports = RadioInput;
