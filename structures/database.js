const { ConnectionManager } = require("typeorm"); 

const connectionManager = new ConnectionManager(); 
connectionManager.create({ 
    name: "MyDB",
    type: "sqlite", 
    database: "./db.sqlite", 
    entities: [
        require("./models/prefixModel").prefixModel
    ] 
});

module.exports.connectionManager = connectionManager; 