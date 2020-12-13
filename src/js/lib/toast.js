class ToastMesseger {
    constructor () {
        this.time_shown = 3000;
        this.node = document.getElementById('toast');
        this.hidden = true;

        this.setEvents();
    }

    success (message) {
        return this.message(message, 'success');
    }

    error (message) {
        return this.message(message, 'error');
    }

    message (message, type) {
        if (CONFIG.is_player_screen) return;
        this.node.innerHTML = message;
        this.show(type);
        setTimeout(() => {
            this.hide();
        }, this.time_shown);
        return this;
    }

    hide () {
        this.hidden = true;
        this.node.classList.remove('show-toast');
        this.node.classList.remove('toast-success');
        this.node.classList.remove('toast-error');
        return this;
    }

    show (type) {
        this.hidden = false;
        this.node.classList.add('show-toast');
        if (type) this.node.classList.add(`toast-${type}`);
        return this;
    }

    setEvents () {
        this.node.addEventListener('click', (e) => {
            if (this.hidden) return true;
            this.hide();
        });
    }
}
module.exports = ToastMesseger;
