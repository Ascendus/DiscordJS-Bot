const { ExtendedError } = require("./error");

class Command {
    constructor(id = '', {
        aliases = [],
        channel = null,
        ownerOnly = false,
        category = '',
        cooldown = null,
        description = '',
        usage = '',
        examples = [],
        clientPermissions = [],
        userPermissions = [],
        ignoreCooldown = [],
        ignorePermissions = []
    }) {
        this.commandID = id;
        this.id = id;
        this.categoryID = category;
        this.aliases = aliases;
        this.channel = channel;
        this.ownerOnly = Boolean(ownerOnly);
        this.cooldown = cooldown;
        this.description = Array.isArray(description) ? description.join('\n') : description;
        this.usage = usage;
        this.examples = examples;
        this.clientPermissions = clientPermissions;
        this.userPermissions = userPermissions;
        this.ignoreCooldown = ignoreCooldown;
        this.ignorePermissions = ignorePermissions;
    };

    exec() {
        throw new ExtendedError('NOT_IMPLEMENTED', this.constructor.name, 'exec');
    };
};

module.exports.Command = Command;