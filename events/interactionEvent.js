const { ticketUtils } = require('../utils/ticketUtils');

module.exports = async(client) => {
    client.on('interactionCreate', async(interaction) => {
        let ticketManager = new ticketUtils();
        if(interaction.customId === "ticket_create") {
            ticketManager.ticketCreate(interaction.member, interaction)
        }else if(interaction.customId === "category_1"){
            ticketManager.setTicketCategory("teknik-", interaction);
        }else if(interaction.customId === "category_2") {
            ticketManager.setTicketCategory("genel-", interaction)
        }else if(interaction.customId === "ticketClose") {
            interaction.deferUpdate()
            ticketManager.ticketDeleteButton(interaction.channel)
        }else{
            return;
        }
    })

    client.on("interactionCreate", async(interaction) => {
        if(interaction.isContextMenu()) {
            const command = client.interactionCommands.get(interaction.commandName);
            if(command) {
                command.run(interaction, client);
            }
        }
    });
}