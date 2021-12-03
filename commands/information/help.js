const { Command } = require("../../structures/command");

class HelpCommand extends Command {
    constructor(client) {
        super("help", {
            id: "help",
            aliases: ["h"],
            channel: "any",
            ownerOnly: false,
            category: "Information",
            cooldown: 3,
            description: "Get help on a list of modules or commands.",
            usage: "help [module | command]",
            examples: ["help information", "help ping"],
            clientPermissions: ["SEND_MESSAGES"],
            userPermissions: ["SEND_MESSAGES"],
            ignorePermissions: client.config.owners,
            ignoreCooldown: client.config.owners
        });
    };

    async exec(client, message, args, module) {
        try {
            if (!args[0]) {
                return message.channel.send(new module.MessageEmbed()
                    .setColor(0x2F3136)
                    .setAuthor(`${client.user.username} - Command & Module Help/General Information`, client.user.displayAvatarURL({ dynamic: true }))
                    .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                    .setDescription(`Welcome to the module/command help centre documentation for **${client.user.username}**, where you can view the full directory of modules and commands.`)
                    .addField(`**Command/Argument Structures**`, `Command Structure\n\`\`\`<prefix><command name> [optional argument] <required argument>\`\`\`\n\nArgument Parameters\n\`\`\`<> = Required Argument\n[] = Optional Argument\n | = Argument Divider`)
                );
            } else if (args[0]) {
                if ([...new Set(client.commandHandler.commands.map((c) => new c(client).categoryID.toLowerCase()))].includes(args[0])) {
                    for (const category of client.commandHandler.categories.values()) {
                        if (args[0].toLowerCase() === (await category.id).toLowerCase()) return message.channel.send(new module.MessageEmbed()
                            .setColor(0x2f3136)
                            .setAuthor(`${client.user.username} - ${args[0]} Module (${category.commands.size} commands)`)
                            .setDescription(`${category.commands.map(cmd => `\`${new cmd(client).id}\``).join(", ")}`)
                        );
                    };

                    [...new Set(client.commandHandler.commands.map((c) => new c(client).categoryID.toLowerCase()))].includes(args[0]) ? message.channel.send(new module.MessageEmbed().setColor(0x2F3136).setAuthor(`${client.user.username} Module Help Centre | ${client.util.capitalize(args[0])} Module (${client.commandHandler.commands.filter(cmd => new cmd().category.includes(args[0][0].toUpperCase() + args[0].slice(1))).size})`, client.user.displayAvatarURL({ dynamic: true })).setThumbnail(client.user.displayAvatarURL({ dynamic: true })).setDescription(`${client.commands.filter((c) => new c().category.toLowerCase() === args[0].toLowerCase()).map((c) => `\`${new c().id}\``).join(", ")}`)) : message.channel.send(new module.MessageEmbed().setColor(0x2F3136).setAuthor(`This help module was not found in the directory.`, message.author.displayAvatarURL({ dynamic: true })).setDescription(`${message.author}, the module you are looking for was not found in the directory. To view the list of modules, use the \`${await client.util.getPrefix(message)}help\` command without any arguments. To view the list of commands for each module, use \`${await client.util.getPrefix(message)}help <module>\`.\n\n**Usage:** \`${await client.util.getPrefix(message)}help [module | command]\`\n**Example:** \`${await client.util.getPrefix(message)}help information\``));
                } else if (![...new Set(client.commandHandler.commands.map((c) => console.log(new c(client)) && new c(client).category.toLowerCase()))].includes(args[0])) {
                    let command = client.commands.get(args[0].toLowerCase());
                    if (!command) command = client.aliases.get(args[0].toLowerCase());
                    const cmd = new command(client);

                    if (!cmd && ![...new Set(client.commandHandler.commands.map((c) => new c(client).categoryID.toLowerCase()))].includes(args[0])) {
                        return message.channel.send(new module.MessageEmbed().setColor(0x2F3136).setAuthor(`This help command was not found in the directory.`, message.author.displayAvatarURL({ dynamic: true })).setDescription(`${message.author}, the command you are looking for was not found in the directory. To view the list of commands, use the \`${await client.util.getPrefix(message)}help\` command without any arguments. To view the list of commands for each module, use \`${await client.util.getPrefix(message)}help <module>\`.\n\n**Usage:** \`${await client.util.getPrefix(message)}help [module | command]\`\n**Example:** \`${await client.util.getPrefix(message)}help information\``));
                    } else if (cmd && ![...new Set(client.commandHandler.commands.map((c) => new c(client).categoryID.toLowerCase()))].includes(args[0].toLowerCase())) return message.channel.send(new module.MessageEmbed()
                        .setColor(0x2F3136)
                        .setAuthor(`${client.user.username} Command Help Centre | ${await client.util.capitalize(new cmd(client).id)} Command`, client.user.displayAvatarURL({ dynamic: true }))
                        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                        .setDescription(`**Name:** \`${cmd.help.name}\`\n**Description:** \`${new cmd().description}\`\n**Module:** \`${new cmd().category}\` | **Usage:** \`${await client.util.getPrefix(message)}${new cmd(client).usage}\` | **Cooldown:** \`${new cmd(client).cooldown}\`\n**Command Aliases:** ${new cmd(client).aliases.length ? new cmd(client).aliases.map(name => `\`${name}\``).join(", ") : "`None`"}\n**User Permissions:** ${new cmd(client).userPermissions.map(req => `\`${req}\``).join(", ")}\n**Bot Permissions:** ${new cmd(client).clientPermissions.map(creq => `\`${creq}\``).join(", ")}`)
                        .setFooter(`[] = Optional Arguments | <> = Compulsory Arguments`));
                };
            };
        } catch (err) {
            return console.log(`[ MyClient ] ${err.stack}`);
        };
    };
};

module.exports = HelpCommand;