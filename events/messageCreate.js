const fs = require('fs');
const { configUtils } = require('../utils/configUtils');
let config = new configUtils();

module.exports = async(client) => {
    client.on('messageCreate', async(message) => {
        
        if(!message.guild) return;
        
        if(message.channel.parent.id === `${config.getTicketCategory()}`) {
            fs.appendFileSync(`./logs/${message.channel.id}.txt`, `\n[${new Date(message.createdAt).toLocaleString('tr-TR')}] (${message.author.tag}): ${message.attachments.size > 0 ? message.attachments.first().proxyURL : message.content}`, {"encoding": "utf-8"}, (err) => console.error);
        }else{
            return;
        }

    }) 
}