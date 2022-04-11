const { ticketUtils } = require('../utils/ticketUtils');
let deleteTicket = new ticketUtils();
module.exports = async(client) => {
    /**
     * 
     * @param {deleteTicket} ticketUtils 
     * 
    */
    client.on('channelDelete', async(channel) => {
        deleteTicket.ticketDelete(channel);
    });
}