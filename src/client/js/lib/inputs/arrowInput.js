class ArrowInput {
  constructor (identifiers, props = {}) {
    this.timer = null;

    this.props = {
      identifiers: identifiers || '',
      step: 1,
      interval: 100,
      ...props,
    };
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

    Lib.input.handleStore({
      store_key,
      store_event,
    }, offset);

    if (typeof interval === 'number') {
      this.timer = setInterval(() => {
        Lib.input.handleStore({
          store_key,
          store_event,
        }, offset);
      }, interval);
    }
  }

  render () {
    const {
      identifiers,
    } = this.props;

    return [`div ${identifiers} .arrow_buttons`, [
      ['div .arrow_button .arrow_left', {
        mousedown: (e) => {
          this.fireInput(-1, 0);
        },
        mouseend: (e) => {
          this.stopTimer();
        }
      }],
      ['div .arrow_button .arrow_top', {
        mousedown: (e) => {
          this.fireInput(0, -1);
        },
        mouseend: (e) => {
          this.stopTimer();
        }
      }],
      ['div .arrow_button .arrow_right', {
        mousedown: (e) => {
          this.fireInput(1, 0);
        },
        mouseend: (e) => {
          this.stopTimer();
        }
      }],
      ['div .arrow_button .arrow_bottom', {
        mousedown: (e) => {
          this.fireInput(0, 1);
        },
        mouseend: (e) => {
          this.stopTimer();
        }
      }],
    ]]
  }
}

module.exports = ArrowInput;
