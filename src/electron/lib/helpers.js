const Helpers = {
    // TODO: Implement actual debug output levels
    // levels: [
    //     'debug',
    //     'info',
    //     'warn',
    //     'error',
    //     'none'
    // ],
    // level: 2,
    // output: true,

    log: function (message, obj) {
        // const output = true;
        const output = false;
        if (!output) return;
        if (obj) {
            console.log(`${message} - ${JSON.stringify(obj, null, 2)}`);
        } else {
            console.log(message);
        }
    }
};

module.exports = Helpers;
