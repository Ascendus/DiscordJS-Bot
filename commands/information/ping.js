const { Command } = require("../../structures/command");

class PingCommand extends Command {
    constructor(client) {
        super("ping", {
            aliases: [],
            description: "Get the latency of the client websocket.",
            category: "Information",
            usage: "ping",
            examples: ["ping"],
            channel: "both",
            clientPermissions: ["SEND_MESSAGES"],
            userPermissions: ["SEND_MESSAGES"],
            ignoreCooldown: client.config.owners,
            ignorePermissions: client.config.owners,
            ownerOnly: false,
            cooldown: 5
        });
    };

    async exec(client, message) {
        try {
            return message.channel.send(`:ping_pong: **Pong!** \`${client.ws.ping}ms\``).catch(err => console.log(`[ Ascendus Client ] ${err}`));
        } catch (err) {
            return console.log(`[ MyClient ] ${err.stack}`);
        };
    };
};

module.exports = PingCommand;