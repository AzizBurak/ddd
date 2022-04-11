//import modules
const { Discord, Collection, Client } = require("discord.js");
const yaml = require('js-yaml');
const fs = require('fs');
//load config
const { configUtils } = require('./utils/configUtils');
const config = new configUtils();
//get token and prefix
var token = config.getToken();
var prefix = config.getPrefix();
//settings client
const client = new Client({
    shards: "auto",
    intents: [
        'GUILDS',
        'GUILD_MEMBERS',
        'GUILD_BANS',
        'GUILD_INTEGRATIONS',
        'GUILD_WEBHOOKS',
        'GUILD_INVITES',
        'GUILD_VOICE_STATES',
        'GUILD_PRESENCES',
        'GUILD_MESSAGES',
        'GUILD_MESSAGE_REACTIONS',
        'GUILD_MESSAGE_TYPING',
        'GUILD_EMOJIS_AND_STICKERS',
        'DIRECT_MESSAGES',
        'DIRECT_MESSAGE_REACTIONS',
        'DIRECT_MESSAGE_TYPING'
    ]
})

require('./events/commandsList.js')(client);
require('./events/interactionEvent.js')(client);
require('./events/deleteTicket.js')(client);
require('./events/messageCreate.js')(client);
require('./handlers/appsHandler.js')(client);
client.interactionCommands = new Collection();

client.on('ready', async() => {
    console.log(`Bot: ${client.user.tag} + Prefix: ${prefix}`) 
})

client.login(token);


