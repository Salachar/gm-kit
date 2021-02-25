const Base = require('./base');
class RadioInput extends Base {
  constructor (identifiers, props = {}) {
    super(props);

    this.radio_inputs = [];

    this.props = {
      identifiers: identifiers || '',
      options: [],
      ...props,
    };
  }

  deselect () {
    this.radio_inputs.forEach((radio_input) => {
      radio_input.classList.remove('checked');
    });
  }

  render () {
    const {
      identifiers,
      options,
    } = this.props;

    return [`div ${identifiers} .radio_input`, [
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
              const is_checked = checkbox.classList.contains('checked');
              this.radio_inputs.forEach((radio_input) => {
                radio_input.classList.remove('checked');
              });

              let new_value = null;

              if (!is_checked) {
                  checkbox.classList.add('checked');
                  new_value = value;
              }

              this.handleStore({
                store_key,
                store_event
              }, value);
            }
          }],
          [`div .checkbox_label HTML=${label}`],
        ]];
      }),
    ]]
  }
}

module.exports = RadioInput;
