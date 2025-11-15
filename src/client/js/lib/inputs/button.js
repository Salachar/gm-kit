const Base = require('./base');
class Button extends Base {
  constructor (identifiers = '', props = {}) {
    if (typeof identifiers === 'object') {
      props = identifiers;
      identifiers = '';
    }

    super(identifiers, props);

    this.props = {
      identifiers: identifiers || '',
      ...props,
    };

    return this.render();
  }

  text (newText) {
    this.node.innerHTML = newText;
  }

  render () {
    const {
      identifiers,
      store_event,
      ipc_event,
      onclick,
      text,
      size = "medium",
    } = this.props;

    this.node = Lib.dom.generate(
      [`button ${identifiers} .${size} .button HTML=${text}`, {
        click: (e) => {
          if (onclick) {
            onclick(e);
            return;
          }
          if (store_event) {
            this.handleStore({
              store_event,
            });
          }
          if (ipc_event) {
            IPC.send(ipc_event);
          }
        },
      }],
    );

    return this.node;
  }
}

module.exports = Button;
