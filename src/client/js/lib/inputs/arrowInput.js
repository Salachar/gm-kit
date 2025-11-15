const Base = require('./base');
class ArrowInput extends Base {
  constructor (identifiers, props = {}) {
    if (typeof identifiers === 'object') {
      props = identifiers;
      identifiers = '';
    }

    super(identifiers, props);

    this.timer = null;

    this.props = {
      identifiers: identifiers || '',
      step: 1,
      interval: 100,
      ...props,
    };

    return this.render();
  }

  stopTimer () {
    clearInterval(this.timer);
    this.timer = null;
  }

  fireInput (x, y) {
    const {
      step,
      interval,
      store_key,
      store_event,
    } = this.props;

    let offset = {
      x: x * step,
      y: y * step
    };

    this.handleStore({
      store_key,
      store_event,
    }, offset);

    if (typeof interval === 'number') {
      this.timer = setInterval(() => {
        this.handleStore({
        store_key,
        store_event,
        }, offset);
      }, interval);
    }
  }

  render () {
    const {
      identifiers,
      text,
    } = this.props;

    return Lib.dom.generate(
      [`div ${identifiers} .arrow_input_container`, [
        text && [`div .input_text HTML=${text}`],
        [`div .arrow_buttons`, [
          ['div .arrow_button .arrow_top', {
            mousedown: (e) => this.fireInput(0, -1),
            mouseend: (e) => this.stopTimer(),
          }],
          ['div .arrow_button .arrow_bottom', {
            mousedown: (e) => this.fireInput(0, 1),
            mouseend: (e) => this.stopTimer(),
          }],
          ['div .arrow_button .arrow_left', {
            mousedown: (e) => this.fireInput(-1, 0),
            mouseend: (e) => this.stopTimer(),
          }],
          ['div .arrow_button .arrow_right', {
            mousedown: (e) => this.fireInput(1, 0),
            mouseend: (e) => this.stopTimer(),
          }],
        ]],
      ]]
    );
  }
}

module.exports = ArrowInput;
