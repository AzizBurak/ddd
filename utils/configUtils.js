const fs = require('fs');
const yaml = require('js-yaml');
const config = yaml.load(fs.readFileSync('./config.yml', 'utf8'));

class configUtils {
    constructor(guild) {
        this.guild = guild;
    }

    getPrefix() {
        return config['settings']['prefix'];
    }

    getToken() {
        return config['settings']['token'];
    }

    boolCategory() {
        return config['settings']['category'];
    }

    boolButtonClose() {
        return config['settings']['buttonClose'];
    }

    getTitle() {
        return config['embed']['title'];
    }

    getColor() {
        return config['embed']['color'];
    }

    getFooter() {
        return config['embed']['footer'];
    }
    
    getImage() {
        return config['embed']['image'];
    }

    getTicketCategory() {
        return config['settings']['ticketCategory'];
    }

    getLogChannel() {
        return config['settings']['logChannelID'];
    }

    getLogActive() {
        return config['settings']['log'];
    }

    getActiveAnnouncer() {
        return config['settings']['staffAnnouncer'];
    }

    getStaffRole() {
        return config['settings']['staffRoleID'];
    }

    getName() {
        return config['settings']['botName'];
    }
}

module.exports = { configUtils };
