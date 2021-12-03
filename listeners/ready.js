const { Listener } = require("../structures/listener");

class ReadyListener extends Listener {
    constructor() {
        super("ready", {
            name: "ready",
            emitter: "client"
        });
    };

    async exec(client) {
        try {
            const statuses = {
                "online": "Online",
                "idle": "Idle",
                "dnd": "Do Not Disturb"
            };

            client.user.setActivity(`${client.guilds.cache.size} servers | ${client.commandHandler.prefix} help`, { type: "WATCHING" });
            client.user.setPresence({
                status: "dnd",
                activity: {
                    name: `${client.guilds.cache.size} servers | ${client.commandHandler.prefix} help`,
                    type: "WATCHING"
                }
            });

            console.log(`${client.util.time()} | [ MyClient ] ${client.user.tag} is ready and online | Status: ${statuses[client.user.presence.status]}`);
        } catch (err) {
            return console.log(`${client.util.time()} | [ MyClient ] ${err.stack} `);
        };
    };
};

module.exports = ReadyListener;