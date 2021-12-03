class Configuration {
    constructor(client, {
        owners = [],
        defaultPrefix = "",
        version = "",
        databaseName = ""
    }) {
        this.client = client;
        this.token = "Your token here";
        this.owners = owners;
        this.defaultPrefix = defaultPrefix;
        this.version = version;
        this.databaseName = databaseName;
    };
};

module.exports.Configuration = Configuration;