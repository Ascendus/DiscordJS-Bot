const { EntitySchema } = require("typeorm");

module.exports.prefixModel = new EntitySchema({
    name: "prefix",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        prefix: {
            type: "varchar",
            length: 22
        },
        guildID: {
            type: "varchar",
            length: 22
        }
    }
});