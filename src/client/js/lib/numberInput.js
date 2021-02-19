class NumberInput {
  constructor (classname, props = {}) {
    this.guid = Lib.guid.generate();

    this.timer = null;
    this.input = null;

    this.props = {
      classname: classname || '',
      step: 1,
      interval: 100,
      default_value: 0,
      ...props,
    };

    this.handleEvent = this.handleEvent.bind(this);

    this.addListeners();
  }

  addListeners () {
    // document.addEventListener('mousedown', this.handleMouseDown);
    // document.addEventListener('mouseup', this.stopTimer);
    // document.addEventListener('mouseleave', this.stopTimer);
    // document.addEventListener('keyup', this.handleInputChange);
    // document.addEventListener('change', this.handleInputChange);

    document.addEventListener('mousedown', this.handleEvent);
    document.addEventListener('mouseup', this.handleEvent);
    document.addEventListener('mouseleave', this.handleEvent);
    document.addEventListener('keyup', this.handleEvent);
    document.addEventListener('change', this.handleEvent);
  }

  handleEvent (e) {
    const target_id = e.target.id;
    if (!target_id || !target_id.match(this.guid)) return;

    if (!this.input) {
      this.input = document.getElementById(`number_input_${this.guid}`);
    }

    const event_type = e.type;
    switch (event_type) {
      case 'mousedown':
        this.handleMouseEvent(target_id);
        break;
      case 'mouseup':
        this.stopTimer();
        break;
      case 'mouseleave':
        this.stopTimer();
        break;
      case 'keyup':
        this.handleInputChange(e);
        break;
      case 'change':
        this.handleInputChange(e);
        break;
    }
  }

  handleMouseEvent (target_id) {
    if (target_id === `arrow_left_${this.guid}`) {
      this.fireInput(-1);
    }
    if (target_id === `arrow_right_${this.guid}`) {
      this.fireInput(1);
    }
  }

  stopTimer () {
    clearInterval(this.timer);
    this.timer = null;
  }

  handleInputChange (e) {
    this.checkValue(0, e.target.value, false);
  }

  fireInput (mod) {
    const { step, interval } = this.props;
    mod = mod * step;
    this.checkValue(mod, null, true);
    this.timer = setInterval(() => {
      this.checkValue(mod, null, true);
    }, interval);
  }

  checkValue (mod, new_value, set) {
    const {
      min,
      max,
      step,
      store_key,
      store_event,
    } = this.props;

    let value = parseFloat(this.input.value) || 0;
    value += mod;
    if (new_value) value = new_value;
    if (typeof min === 'number' && value < min) value = min;
    if (typeof min === 'number' && value > max) value = max;

    if (set) {
        this.input.value = value.toFixed(Lib.input.getDecimalCount(step));
    }

    Lib.input.handleStore({
      store_key,
      store_event,
    }, value);
  }

  render () {
    const {
      classname,
      default_value,
      min,
      max
    } = this.props;

    return `
      <div class="${classname} number_input_container">
        <div id="arrow_left_${this.guid}" class="number_input_button arrow_left"></div>
        ${!isNaN(min) ? `<div class="number_input_info number_input_min">${min}</div>` : ''}
        <input id="number_input_${this.guid}" class="number_input" value=${default_value} />
        ${!isNaN(max) ? `<div class="number_input_info number_input_max">${max}</div>` : ''}
        <div id="arrow_right_${this.guid}" class="number_input_button arrow_right"></div>
      </div>
    `;
  }
}

module.exports = NumberInput;

  // node = checkNode(node);
  // const { node_tag = 'div' } = opts;
  // node = createElement(node_tag, classname);

  // node.classList.add('number_input_container');

  // opts.step = opts.step || 1;
  // opts.interval = (typeof opts.interval === 'number') ? opts.interval : 100;

  // const left_arrow = createElement('div', 'number_input_button arrow_left', { addTo: node });
  // const right_arrow = createElement('div', 'number_input_button arrow_right', { addTo: node });
  // const input = createElement('input', 'number_input', { addTo: node });

  // if (typeof opts.min === 'number') {
  //     createElement('div', 'number_input_info number_input_min', {
  //         html: opts.min,
  //         addTo: node
  //     });
  // }
  // if (typeof opts.max === 'number') {
  //     createElement('div', 'number_input_info number_input_max', {
  //         html: opts.max,
  //         addTo: node
  //     });
  // }

//   if (opts.init) {
//       input.value = opts.init;
//       if (opts.store_key) {
//           Store.set({
//               [opts.store_key]: opts.init
//           });
//       }
//   }

//   left_arrow.addEventListener('mousedown', (e) => {
//       fireInput(-1);
//   });
//   InputHelpers.killTimerListener(left_arrow);

//   right_arrow.addEventListener('mousedown', (e) => {
//       fireInput(1);
//   });
//   InputHelpers.killTimerListener(right_arrow);

//   input.addEventListener('keyup', (e) => {
//       checkValue(0, input.value, false);
//   });
//   input.addEventListener('change', (e) => {
//       checkValue(0, input.value, false);
//   });

//   function fireInput (mod) {
//       mod = mod * opts.step;
//       checkValue(mod, null, true);
//       InputHelpers.timer = setInterval(() => {
//           checkValue(mod, null, true);
//       }, opts.interval);
//   }

//   function checkValue (mod, new_value, set) {
//       let value = parseFloat(input.value) || 0;
//       value += mod;
//       if (new_value) value = new_value;
//       if (typeof opts.min === 'number' && value < opts.min) value = opts.min;
//       if (typeof opts.min === 'number' && value > opts.max) value = opts.max;
//       if (set) {
//           input.value = value.toFixed(InputHelpers.getDecimalCount(opts.step));
//       }

//       handleStore(opts, value);
//   }

//   return node.outerHTML;
// },