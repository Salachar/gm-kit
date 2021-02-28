class Mouse {
    constructor () {
        this.x = null;
        this.y = null;

        this.key_x = null;
        this.key_y = null;

        this.prevX = null;
        this.prevY = null;

        this.prevDownX= null;
        this.prevDownY= null;

        this.prevUpX= null;
        this.prevUpY= null;

        this.downX = null;
        this.downY = null;

        this.upX = null;
        this.upY = null;

        this.down = false;
        this.up = true;

        this.key = null;

        this.x_offset = 0;
        this.y_offset = 0;

        this.left = false;
        this.right = false;
        this.middle = false;
    }

    get point () {
        return {
            x: this.x,
            y: this.y
        };
    }

    upEvent (e) {
        this.down = false;
        this.up = true;
        this.prevUpX = this.upX;
        this.prevUpY = this.upY;
        this.upX = this.x;
        this.upY = this.y;
    }

    downEvent (e) {
        this.key = e.which;
        switch (this.key) {
            case 1: this.left = true;
            case 2: this.middle = true;
            case 3: this.middle = true;
        }
        this.down = true;
        this.up = false;
        this.prevDownX = this.downX;
        this.prevDownY = this.downY;
        this.downX = this.x;
        this.downY = this.y;
    }

    moveEvent (e, pos = {}) {
        if (this.x != pos.x) this.prevX = this.x;
        if (this.y != pos.y) this.prevY = this.y;
        this.x = pos.x;
        this.y = pos.y;
    }

    clearMouse (e) {
        this.key = null;
        this.left = false;
        this.middle = false;
        this.right = false;
    }
};

module.exports = Mouse;
