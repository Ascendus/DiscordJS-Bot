const { Client } = require("discord.js"); 
const { CommandHandler } = require("../handlers/commandHandler"); 
const { EventHandler } = require("../handlers/eventHandler"); 
const { Configuration } = require("./config"); 
const { Utilities } = require("./utilities");
const { connectionManager } = require("../structures/database"); 
const { prefixModel } = require("../structures/models/prefixModel");
const { join } = require("path"); 
const { version } = require("../package.json");

class MyClient extends Client { 
    constructor() {
        super({
            disableEveryone: true,
            fetchAllMembers: true,
            intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_BANS", "GUILD_EMOJIS", "GUILD_INTEGRATIONS", "GUILD_WEBHOOKS", "GUILD_INVITES", "GUILD_VOICE_STATES", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS", "GUILD_MESSAGE_TYPING", "DIRECT_MESSAGES", "DIRECT_MESSAGE_REACTIONS", "DIRECT_MESSAGE_TYPING"],
            ws: {
                properties: {
                    $browser: "discord.js"
                }
            }
        });

        this.config = new Configuration(this, {
            defaultPrefix: "!",
            version: version,
            owners: ["760995822120468511"],
            databaseName: "MyDB"
        });

        this.util = new Utilities(this, new Date());
        this.db = connectionManager.get(this.config.databaseName); 

        this.commandHandler = new CommandHandler(this, {
            directory: join(__dirname, "..", "commands"),
            prefix: async (msg) => {
                if (msg.guild) {
                    const prefixRepo = await this.db.getRepository(prefixModel);
                    if ((await prefixRepo.findOne({ guildID: msg.guild.id }))) {
                        const serverPrefix = await prefixRepo.findOne({ guildID: msg.guild.id });
                        return serverPrefix.prefix;
                    } else return this.config.defaultPrefix.toString().toLowerCase();
                } else {
                    return this.config.defaultPrefix.toString().toLowerCase();
                };
            },
            blockBots: true,
            allowMention: false,
            directMessageWarning: (msg) => `${msg.author}, you can only use this command in servers!`,
            guildOnlyWarning: (msg) => `${msg.author}, you can only use this command in dms!`,
            ownerOnlyWarning: (msg) => `${msg.author}, only owners can use this command!`,
            missingSendPermissions: (msg) => `${msg.author}, I am missing the following permission(s): \`SEND_MESSAGES\``,
            clientPermissionsMissing: (msg, permissions) => `${msg.author}, I am missing the following permissions(s): ${permissions}`,
            userPermissionsMissing: (msg, permissions) => `${msg.author}, I am missing the following permissions(s): ${permissions}`,
            cooldownMessage: (msg, remaining, command) => `${msg.author}, please wait **${remaining}** seconds before reusing the \`${command.id}\` command!`
        });

        this.eventHandler = new EventHandler(this, {
            directory: join(__dirname, "..", "listeners")
        });

        this.init = async () => {
            try {
                this.commandHandler.load();
                this.eventHandler.load(); 
                await this.db.connect(); 
                await this.db.synchronize(); 
            } catch (err) {
                return console.log(`[ MyClient ] ${err.stack}`);
            };
        };

        this.start = async () => {
            try {
                await this.init(); 
                return this.login(this.config.token).catch(error => console.error(error));
            } catch (err) {
                return console.log(`[ MyClient ] ${err.stack}`);
            };
        };
    };
};

module.exports.MyClient = MyClient;