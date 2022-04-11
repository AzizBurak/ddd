const { configUtils } = require('../utils/configUtils');
const { ticketUtils } = require('../utils/ticketUtils');
let ticketManager = new ticketUtils();
let config = new configUtils();

module.exports = {
    name: "Talep Kapat",
    type: "USER",
    run: async (interaction, client) => {    
        //if(interaction.channel.parent.id === `${config.getTicketCategory()}`) {
            if(!interaction.member.roles.cache.has(`${config.getStaffRole()}`)) return interaction.channel.send(`> ${interaction.member}, yeterli yetkin yok. (Erişim sağlanmak istenen sistem: '**Talep Kapatma**')`)     
            await interaction.deferReply({ ephemeral: true })
            let member = interaction.guild.members.cache.get(interaction.targetId);
            const control = await ticketManager.checkDatabase(member)
            if(control === true) {
                const getChannelID = await ticketManager.getChannel(member)
                const getChannel = await interaction.guild.channels.cache.get(getChannelID)
                getChannel.delete();
                ticketManager.ticketDelete(getChannel)
            }else{
                interaction.channel.send({ content: `> ${interaction.member}, bu üyenin bir talebi yok. ` })
            }
        
        
            //}
    }    
};