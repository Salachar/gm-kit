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

    isPlayerScreenEvent (fired_event) {
        return (fired_event.indexOf('_(ps)') !== -1 || fired_event.indexOf('_(PS)') !== -1);
    }

    isPlayerScreenEventOnly (fired_event) {
        return (fired_event.indexOf('_(PS)') !== -1);
    }

    fire (fired_event, data, key) {
        // Send the current key to the display window
        // If the display windows current key is different
        // then the one we sent, then the display window isn't showing the current map
        // The display window should then disregard any events
        if (key && this.key && this.key !== key) return;
        key = key || this.key || null;

        if (!CONFIG.is_player_screen && this.isPlayerScreenEvent(fired_event)) {
            if (window.player_screen) {
                window.player_screen.postMessage({
                    event: fired_event,
                    data: data,
                    key: key
                });
            }
            if (this.isPlayerScreenEventOnly(fired_event)) return;
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
