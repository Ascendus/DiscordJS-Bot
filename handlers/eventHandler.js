const { readdirSync } = require('fs');

class EventHandler {
    constructor(client, {
        directory
    }) {
        this.client = client;
        this.directory = directory;

        this.load = async () => {
            for (const events of readdirSync(this.directory)) {
                const event = require(`${this.directory}/${events}`);
                this.client.on(`${new event().name.toString().toLowerCase()}`, new event().exec.bind(null, this.client));
            };
        
            console.log(`${client.util.time()} | [ Event Handler ] Loaded ${readdirSync(this.directory).length} event(s)`);
        };
    };
};

module.exports.EventHandler = EventHandler;