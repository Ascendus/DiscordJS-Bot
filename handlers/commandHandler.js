const Discord = require('discord.js');
const { readdirSync } = require('fs');
const { Category } = require('../structures/category');

class CommandHandler {
    constructor(client, {
        directory = "", // The directory of commands to save to the command Collection and execute.
        prefix = "", // The prefix for all commands executed.
        blockBots = true, // Determines whether to block bots from using commands.
        allowDirectMessages = true, // Determines whether to allow commands run in direct messages with the bot.
        allowMention = false, // Determines whether the client's user mention can be used as a prefix.
        directMessageWarning = "", // The message to send upon a user running commands in direct messages if disabled.
        guildOnlyWarning = "", // A message to warn a user when a command only meant to be used in servers is run in a dm.
        ownerOnlyWarning = "", // A message to warn a non-owner running a owner only command.
        missingSendPermissions = "", // Sends a warning message to the dm of the user who runs a command but the client is missing the SEND_MESSAGES permission.
        clientPermissionsMissing = "", // Sends a message to the user if the client is missing permissions for a command.
        userPermissionsMissing = "", // Sends a message to the user if the user is missing permissions for a command.
        cooldownMessage = "" // Warns a user when the person executing the command exceeds the cooldown limit.
    }) {
        this.client = client;
        this.directory = directory;
        this.prefix = prefix;
        this.blockBots = blockBots || true;
        this.allowDirectMessages = allowDirectMessages || true;
        this.allowMention = allowMention || true;
        this.directMessageWarning = directMessageWarning;
        this.guildOnlyWarning = guildOnlyWarning;
        this.ownerOnlyWarning = ownerOnlyWarning;
        this.missingSendPermissions = missingSendPermissions;
        this.clientPermissionsMissing = clientPermissionsMissing;
        this.userPermissionsMissing = userPermissionsMissing;
        this.cooldownMessage = cooldownMessage;
        this.commands = new Discord.Collection();
        this.aliases = new Discord.Collection();
        this.commandCooldown = new Discord.Collection();
        this.categories = new Discord.Collection();

        this.load = async () => {
            try {
                const categories = ["configuration", "information"];
                categories.forEach(async category => {
                    this.categories.set(await this.client.util.capitalize(category), new Category(await this.client.util.capitalize(category), null)); 
                });

                for (const category of categories.values()) {
                    for (const command of readdirSync(`${this.directory}/${category.toLowerCase()}`).filter(fileName => fileName.endsWith(".js"))) { 
                        const commandFile = require(`${this.directory}/${category.toLowerCase()}/${command}`);
                        this.commands.set(new commandFile(this.client).id.toLowerCase(), commandFile);

                        if (new commandFile(this.client).aliases) {
                            for (const alias of new commandFile(this.client).aliases) {
                                this.aliases.set(alias, commandFile); 
                            };
                        };
                    };

                    this.categories.set(await this.client.util.capitalize(category), new Category(await this.client.util.capitalize(category), this.commands.filter(async cmd => new cmd(this.client).categoryID.toLowerCase() === category.toLowerCase()))); // Sets the commands with matching categories to each category in the category collection.
                    console.log(`${await this.client.util.time()} | [ ${await this.client.util.capitalize(category)} Module ] Loaded ${readdirSync(`${this.directory}/${category}`).length} command(s)`); // Logs successful message to the console.
                };

                this.client.on("message", async (message) => {
                    if (message.author.bot && this.blockBots === true) return; 
                    const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
                    const prefixRegex = new RegExp(`^(<@!?${this.client.user.id}>|${escapeRegex(typeof this.prefix === "function" ? (await this.prefix(message)) : this.prefix)})\\s*`); 
                    if (!prefixRegex.test(message.content)) return; 

                    const [, matchedPrefix] = message.content.match(prefixRegex); 
                    const args = message.content.slice(matchedPrefix.length).trim().split(/ +/g); 
                    const commandName = args.shift().toLowerCase(); 
                    const command = this.commands.get(commandName) || this.aliases.get(commandName); 
                    if (!command) return; 
                    const cmd = new command(this.client); 

                    if (message.channel.type === "dm" && !this.allowDirectMessages === false && cmd.channel === "guild") return message.channel.send(typeof this.directMessageWarning === 'function' ? this.directMessageWarning(message) : this.directMessageWarning);
                    if (message.channel.type === "text" && cmd.channel === "dm") return message.channel.send(typeof this.guildOnlyWarning === 'function' ? this.guildOnlyWarning(message) : this.guildOnlyWarning);
                    if (cmd.ownerOnly && !this.client.config.owners.includes(message.author.id)) return message.channel.send(typeof this.ownerOnlyWarning === 'function' ? this.ownerOnlyWarning(message) : this.ownerOnlyWarning);
                    if (message.guild && !message.channel.permissionsFor(message.guild.me).toArray().includes("SEND_MESSAGES")) return message.author.send(typeof this.missingSendPermissions === 'function' ? this.missingSendPermissions(message) : this.missingSendPermissions);
                    if (message.guild && cmd.clientPermissions && !message.guild.me.permissions.has(cmd.clientPermissions)) return message.channel.send(typeof this.clientPermissionsMissing === 'function' ? this.clientPermissionsMissing(message, message.guild.me.permissions.missing(cmd.clientPermissions).length > 1 ? `${message.guild.me.permissions.missing(cmd.clientPermissions).slice(0, -1).map(perm => `\`${perm}\``).join(', ')} and \`${message.guild.me.permissions.missing(cmd.clientPermissions).slice(-1)[0]}\`` : `\`${message.guild.me.permissions.missing(cmd.clientPermissions)[0]}\``) : this.clientPermissionsMissing);
                    if (message.guild && cmd.userPermissions && !message.member.permissions.has(cmd.userPermissions) && !cmd.ignorePermissions.includes(message.author.id)) return message.channel.send(typeof this.userPermissionsMissing === 'function' ? this.userPermissionsMissing(message, message.member.permissions.missing(cmd.userPermissions).length > 1 ? `${message.member.permissions.missing(cmd.userPermissions).slice(0, -1).map(perm => `\`${perm}\``).join(', ')} and \`${message.member.permissions.missing(cmd.userPermissions).slice(-1)[0]}\`` : `\`${message.member.permissions.missing(cmd.userPermissions)[0]}\``) : this.userPermissionsMissing);


                    if (message.guild) {
                        if (!this.commandCooldown.has(cmd.id)) this.commandCooldown.set(cmd.id, new Discord.Collection());
                        const now = Date.now();
                        const timestamps = this.commandCooldown.get(cmd.id);
                        const cooldownAmount = (cmd.cooldown || 3) * 1000;
                        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
                        const timeLeft = (expirationTime - now) / 1000;

                        if (timestamps.has(message.author.id) && !this.client.config.owners.includes(message.author.id) && (now < expirationTime) && !cmd.ignoreCooldown.includes(message.author.id)) return message.channel.send(typeof this.cooldownMessage === "function" ? this.cooldownMessage(message, timeLeft.toFixed(1), cmd) : this.cooldownMessage);
                        timestamps.set(message.author.id, now);
                        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
                    };

                    return cmd.exec(this.client, message, args, Discord); 
                });

                this.client.on("error", (err) => console.log(`[ MyClient ] ${err}`)); 
                process.on("unhandledRejection", async (err) => console.error('Unhandled Rejection:', err)); 
            } catch (err) {
                return console.log(`[ MyClient ] ${err.stack}`); 
            };
        };

        this.reloadCommand = async (commandName) => {
            const commandFile = require(`${this.directory}/${commandName}.js`); 
            this.commands.set(new commandFile(this.client).id, commandFile); 
            
            if (new commandFile(this.client).aliases) for (const alias of new commandFile(this.client).aliases) {
                this.aliases.set(alias, commandFile); 
            };
        };

        this.reloadAll = async () => {
            for (const command of readdirSync(this.directory).filter(fileName => fileName.endsWith(".js"))) {
                const commandFile = require(`${this.directory}/${command}`);
                this.commands.set(new commandFile(this.client).id, commandFile);

                if (new commandFile(this.client).aliases) for (const alias of new commandFile(this.client).aliases) {
                    this.aliases.set(alias, commandFile);
                };
            };
        };

        this.fetchCommand = async (searchQuery) => {
            const command = this.commands.get(searchQuery.toLowerCase()) || this.aliases.get(searchQuery.toLowerCase());
            return new command();
        };
    };
};

module.exports.CommandHandler = CommandHandler; 