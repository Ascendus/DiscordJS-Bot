const { prefixModel } = require("../structures/models/prefixModel");

class Utilities {
    constructor(client, date) {
        this.client = client;
        this.day = () => date;
        this.date = () => `${date.getUTCDay()} ${date.getUTCDay()}${this.getDateSuffix(date.getUTCDay())} of ${date.getUTCMonth()} ${date.getUTCFullYear()}`;
        this.time = () => date.toLocaleTimeString();
        this.capitalize = async (string) => {
            return string.charAt(0).toUpperCase() + string.slice(1);
        };
        this.getDateSuffix = async (dayOfWeek) => {
            if (dayOfWeek > 3 && dayOfWeek < 21) return 'th';
            switch (dayOfWeek % 10) {
                case 1: return "st";
                case 2: return "nd";
                case 3: return "rd";
                default: return "th";
            };
        };
        this.getPrefix = async (message) => {
            const prefixRepo = await client.db.getRepository(prefixModel);
            const serverPrefix = await prefixRepo.findOne({ guildID: message.guild.id });

            return message.guild && serverPrefix ? `${serverPrefix.prefix.toString()}` : client.config.defaultPrefix;
        };
    };
};

module.exports.Utilities = Utilities;