class ToastMesseger {
    constructor () {
        this.time_shown = 3000;
        this.node = document.getElementById('toast');
    }

    success (message) {
        return this.message(message, 'success');
    }

    error (message) {
        return this.message(message, 'error');
    }

    message (message, type) {
        if (DISPLAY_WINDOW) return;
        this.node.innerHTML = message;
        this.show(type);
        setTimeout(() => {
            this.hide();
        }, this.time_shown);
        return this;
    }

    hide () {
        this.node.classList.remove('show-toast');
        this.node.classList.remove('toast-success');
        this.node.classList.remove('toast-error');
        return this;
    }

    show (type) {
        this.node.classList.add('show-toast');
        if (type === 'success') {
            this.node.classList.add('toast-success');
        }
        if (type === 'error') {
            this.node.classList.add('toast-error');
        }
        return this;
    }
}
module.exports = ToastMesseger;
