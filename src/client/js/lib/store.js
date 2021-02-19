class Store {
    constructor () {
        this.__events = {};
        this.__key_events = {};
        this.__store = {};

        this.__key = null;
    }

    set key (new_key) {
        this.__key = new_key;
    }

    get key () {
        return this.__key;
    }

    get data () {
        return this.__store;
    }

    isPlayerScreenEvent (fired_event) {
        return (fired_event.indexOf('(ps)') !== -1 || fired_event.indexOf('(PS)') !== -1);
    }

    isPlayerScreenEventOnly (fired_event) {
        return (fired_event.indexOf('(PS)') !== -1);
    }

    parseEvent (fired_event) {
        // -(ps) events get sent to the player screen with the ps tags
        // removed, so it will be processed like normal
        return fired_event.replace('-(ps)', '').replace('-(PS)', '');;
    }

    fire (fired_event, data, key) {
        // Send the current key to the display window
        // If the display windows current key is different
        // then the one we sent, then the display window isn't showing the current map
        // The display window should then disregard any events
        if (key && this.key && this.key !== key) return;
        key = key || this.key || null;

        // only (ps) or (PS) events get sent to the player screen
        if (!CONFIG.is_player_screen && this.isPlayerScreenEvent(fired_event)) {
            if (window.player_screen) {
                window.player_screen.postMessage({
                    event: this.parseEvent(fired_event),
                    data: data,
                    key: key
                });
            }
            if (this.isPlayerScreenEventOnly(fired_event)) return;
        }

        // set data sent with event in the store
        if (data) this.set(data);

        // Fire events at the "global" level
        (this.__events[this.parseEvent(fired_event)] || []).forEach((callback) => {
            callback(data);
        });

        // Check to see if there are registered events under the current store key
        if (this.key && this.__key_events[this.key]) {
            (this.__key_events[this.key][this.parseEvent(fired_event)] || []).forEach((callback) => {
                callback(data);
            });
        }
    }

    set (data, key) {
        let store_key = key || this.key || null;
        if (store_key && !this.__store[store_key]) {
            this.__store[store_key] = {};
        }
        for (let data_key in data) {
            if (store_key) {
                this.__store[store_key][data_key] = data[data_key];
            } else {
                this.__store[data_key] = data[data_key];
            }
            if (!CONFIG.is_player_screen) {
                this.fire('store_data_set-(PS)', {
                    store_key: store_key,
                    [data_key]: data[data_key]
                });
            }
        }
    }

    get (data_key, store_key) {
        store_key = store_key || this.key || null;
        let value = null;
        if (store_key) {
             value = this.__store[store_key][data_key] || null;
             if (value) return value;
        }
        return this.__store[data_key] || null;
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

    remove (key) {
        if (this.__key === key) {
            this.__key = null;
        }
        delete this.__key_events[key];
        delete this.__store[key];
    }

    clearData () {
        this.__store = {};
    }

    clear () {
        this.__events = {};
        this.clearData();
        this.clearKeys();
    }

    clearKeys () {
        this.__key_events = {};
        this.__key = null;
    }
}
module.exports = new Store();
