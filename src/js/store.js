class Store {
    constructor () {
        this.__events = {};
        this.__key_events = {};
        this.__store = {};

        this.__key = null;

        this.display_window_events = {
            'image_loaded': true,
            'light_poly_update': true,
            'scroll_left': 'ALT',
            'scroll_right': 'ALT',
            'scroll_up': 'ALT',
            'scroll_down': 'ALT',
            'dim_up': 'ALT',
            'dim_down': 'ALT',
            'zoom_in': 'ALT',
            'zoom_out': 'ALT'
        };
    }

    set key (new_key) {
        this.__key = new_key;
    }

    get key () {
        return this.__key;
    }

    fire (fired_event, data) {
        // If the display window accepts the event, send it there
        const dwe = this.display_window_events[fired_event];
        if (window.display_window && dwe) {
            if (dwe === true || (dwe === 'ALT' && KEY_DOWN[KEYS.ALT])) {
                window.display_window.postMessage({
                    event: fired_event,
                    data: {
                        map_name: window.MapManager.current_map.name,
                        data: data
                    }
                });
            }
            // If its an ALT event, return early, since we only want the display
            // screen to get an ALT event
            if (dwe === 'ALT') return;
        }

        this.set(data);

        (this.__events[fired_event] || []).forEach((callback) => {
            callback(data);
        });

        if (this.key && this.__key_events[this.key]) {
            (this.__key_events[this.key][fired_event] || []).forEach((callback) => {
                callback(data);
            });
        }
    }

    set (data) {
        for (let d in data) {
            this.__store[d] = data[d];
        }
    }

    get (key) {
        return this.__store[key] || null;
    }

    register (events, key) {
        if (key) {
            if (!this.__key_events[key]) {
                this.__key_events[key] = {};
            }
            for (let event in events) {
                if (!this.__key_events[key][event]) this.__key_events[key][event] = [];
                this.__key_events[key][event].push(events[event]);
            }
        } else {
            for (let event in events) {
                if (!this.__events[event]) this.__events[event] = [];
                this.__events[event].push(events[event]);
            }
        }
    }

    clear () {
        this.__store = {};
    }
}
module.exports = new Store();
