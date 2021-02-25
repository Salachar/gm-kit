const Base = require('./base');
class Checkbox extends Base {
  constructor (identifiers, props = {}) {
    super(props);

    this.props = {
      identifiers: identifiers || '',
      ...props,
    };
  }

  render () {
    const {
      identifiers,
      store_key,
      store_event,
    } = this.props;

    return [`div ${identifiers} .checkbox`, {
      click: (e) => {
        const node = e.target;
        let new_value = false;
        if (!node.classList.contains('checked')) {
            node.classList.add('checked');
            new_value = true;
        } else {
            node.classList.remove('checked');
        }

        this.handleStore({
          store_key,
          store_event,
        }, new_value);
      }
    }];
  }
}

module.exports = Checkbox;
