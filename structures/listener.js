const { ExtendedError } = require("./error");

class Listener {
    constructor(id, {
        name = '',
        emitter = '',
        category = ''
    }) {
        this.id = id;
        this.name = name;
        this.emitter = emitter;
        this.category = category;
    };

    exec() {
        throw new ExtendedError('NOT_IMPLEMENTED', this.constructor.name, 'exec');
    };
};

module.exports.Listener = Listener;