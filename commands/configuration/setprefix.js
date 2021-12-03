const { Command } = require("../../structures/command");
const { prefixModel } = require("../../structures/models/prefixModel");

class SetPrefixCommand extends Command {
    constructor(client) {
        super("setprefix", {
            aliases: ["set-prefix", "prefix-set", "prefixset", "prefix"],
            description: "Change Astron's prefix for the server.",
            category: "Configuration",
            usage: "setprefix <new prefix>",
            examples: ["setprefix ?", "prefix-set %"],
            channel: "guild",
            clientPermissions: ["SEND_MESSAGES"],
            userPermissions: ["SEND_MESSAGES", "MANAGE_GUILD"],
            ignoreCooldown: client.config.owners,
            ignorePermissions: client.config.owners,
            ownerOnly: false,
            cooldown: 8
        });
    };

    async exec(client, message, args) {
        try {
            let newPrefix;
            const prefixRepo = client.db.getRepository(prefixModel);
            const serverPrefix = await prefixRepo.findOne({ guildID: message.guild.id });
            const currentPrefix = await client.util.getPrefix(message);
            const filter = m => m.author.id === message.author.id;
            if (!args[0]) {
                message.channel.send(`**${message.author.username}, please provide a prefix to change to for the server. Ending prompt in 20 seconds.**\n\`\`\`http\nCommand Usage: ${currentPrefix}${this.usage}\nExamples: ${this.examples.map(example => currentPrefix + example).join(", ")}\nCommand Cancellation: cancel\`\`\``)
                    .then(async msg => {
                        const collector = msg.channel.createMessageCollector(filter, { time: 20000, errors: ["time"] });
                        collector.on("collect", async m => {
                            if (m.content.toLowerCase() === "cancel") {
                                collector.stop();
                                return m.channel.send(`**${message.author.username}, successfully cancelled the \`${this.id}\` command.**`);
                            } else {
                                newPrefix = m.content.split(" ")[0];
                                return !(await prefixRepo.findOne({ guildID: m.guild.id })) ?
                                    prefixRepo.insert({ prefix: newPrefix, guildID: m.guild.id }) && m.channel.send(`**${message.author.username}, successfully changed the prefix for ${m.guild.name} to \`${newPrefix}\`**`) && collector.stop() :
                                    prefixRepo.update(serverPrefix, { prefix: newPrefix, guildID: m.guild.id }) && m.channel.send(`**${message.author.username}, successfully changed the prefix for ${m.guild.name} to \`${newPrefix}\`**`) && collector.stop();
                            };
                        });

                        collector.on("end", async (collected, reason) => {
                            if (reason === "time") return msg.channel.send(`**${message.author.username}, you took to long to respond. This command has now been cancelled.**`);
                        });
                    });
            } else {
                newPrefix = args[0].toLowerCase();
                return !(await prefixRepo.findOne({ guildID: message.guild.id })) ?
                    prefixRepo.insert({ prefix: newPrefix, guildID: message.guild.id }) && message.channel.send(`**${message.author.username}, successfully changed the prefix for ${message.guild.name} to \`${newPrefix}\`**`) :
                    prefixRepo.update(serverPrefix, { prefix: newPrefix, guildID: message.guild.id }) && message.channel.send(`**${message.author.username}, successfully changed the prefix for ${message.guild.name} to \`${newPrefix}\`**`);
            };
        } catch (err) {
            return console.log(`[ MyClient ] ${err.stack}`);
        };
    };
};

module.exports = SetPrefixCommand;