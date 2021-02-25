const Base = require('./base');
class Button extends Base {
  constructor (identifiers, props = {}) {
    super(identifiers, props);

    this.props = {
      identifiers: identifiers || '',
      ...props,
    };

    return this.render();
  }

  render () {
    const {
      identifiers,
      store_event,
      onclick,
      text,
    } = this.props;

    return Lib.dom.generate([`div ${identifiers} .button HTML=${text}`, {
      click: (e) => {
        if (onclick) {
          onclick();
          return;
        }
        if (store_event) {
          this.handleStore({
            store_event,
          });
        }
      }
    }]);
  }
}

module.exports = Button;
