const { client, Interaction, User, MessageEmbed, MessageActionRow, MessageButton, MessageAttachment } = require('discord.js');
const fs = require('fs');
const yaml = require('js-yaml');
const { JsonDatabase } = require('wio.db')
const db = new JsonDatabase('./database/ticket') 
const { configUtils } = require('../utils/configUtils');
let config = new configUtils();

class ticketUtils {
    constructor(guild) {
        this.guild = guild;
    }
    /**
     * 
     * @param {Interaction} interaction 
     * @param {User} user, member
     * 
    */

    async sendMessage(user, channel) {
        let boolCategory = await config.boolCategory();
        let boolButton = await config.boolButtonClose()
        if(boolCategory === true) {
            var announcer = await config.getActiveAnnouncer();
            var staffRole = await config.getStaffRole();
            const embed = new MessageEmbed() 
                .setAuthor({name: `${config.getTitle()}`, iconURL: user.displayAvatarURL()})
                .setDescription(`Merhaba ${user}!
                > Talebini oluşturmanın ilk aşamasına geldin! Aşağıdaki butonlardan almak istediğin desteğin kategorisini belirt.
                `)
                .setColor(`${config.getColor()}`)
                .addFields(
                    { name: "\u200B", value: `📚 Kategoriler:` },
                    { name: "🔧 Teknik Destek:", value: `Teknik bir hatayla mı karşılaştın? O zaman bu kategoriyi seç!`, inline: true},
                    { name: "🔮 Genel Destek:", value: `Bilmediğin bir şey ile mi karşılaştın? Bu kategori senin için!`, inline: true}
                )
                .setFooter({text:`${config.getFooter()}`, iconURL: user.displayAvatarURL()})
                .setThumbnail(user.displayAvatarURL({dynamic: true}))
                .setImage(`${config.getImage()}`)
            const messageRow = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('category_1')
                    .setLabel('🔧 Teknik Destek')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('category_2')
                    .setLabel('🔮 Genel Destek')
                    .setStyle('PRIMARY'),  
            );
            channel.send({embeds: [embed], components: [messageRow]})  
        }else{
            if(boolCategory === true) {
                const embed = new MessageEmbed() 
                    .setAuthor({name: `${config.getTitle()}`, iconURL: user.displayAvatarURL({dynamic: true})})
                    .setDescription(`Merhaba ${user}!
                    Talebini oluşturdum, artık senin yapman gereken sadece beklemek!
                    `)
                    .setColor(`${config.getColor()}`)
                    .addFields(
                        { name: "Üye:", value: `${user}` },
                    )
                    .setImage(`${config.getImage()}`)
                    .setThumbnail(user.displayAvatarURL())
                    .setFooter({text: `${config.getFooter()}`, iconURL: user.displayAvatarURL()})
                    const messageRow = new MessageActionRow()
                    .addComponents( 
                        new MessageButton()
                            .setCustomId('ticketClose')
                            .setLabel('🔒 Talebi Kapat')
                            .setStyle('DANGER'), 
                    );
                channel.send({embeds: [embed], components: [messageRow]})   
            }else{
                const embed = new MessageEmbed() 
                    .setAuthor({name: `${config.getTitle()}`, iconURL: user.displayAvatarURL({dynamic: true})})
                    .setDescription(`Merhaba ${user}!
                    Talebini oluşturdum, artık senin yapman gereken sadece beklemek!
                    `)
                    .setColor(`${config.getColor()}`)
                    .addFields(
                    { name: "Üye:", value: `${user}` },
                    )
                    .setImage(`${config.getImage()}`)
                    .setThumbnail(user.displayAvatarURL())
                    .setFooter({text: `${config.getFooter()}`, iconURL: user.displayAvatarURL()})
                channel.send({embeds: [embed]})  
            }
            const embed2 = new MessageEmbed()
                .setAuthor({ name: `${config.getTitle()}`, iconURL: user.displayAvatarURL({dynamic: true})})
                .setDescription(`Sana yardımcı olacak yetkililer:`)
                .addFields(
                    {name: "\u200B", value: `${channel.guild.roles.cache.get(`${config.getStaffRole()}`).members.map(m=>m.user).join(', ')}`}
                )
                .setFooter({text: `Yetkili sayısı: ${channel.guild.roles.cache.get(`${config.getStaffRole()}`).members.size}`})
                .setThumbnail(user.displayAvatarURL())
                .setColor(`${config.getColor()}`)
            channel.send({embeds: [embed2]})   
            if(announcer === true) {
                channel.send({content: `<@&${staffRole}>`})
            }          
        }
    }

    async checkDatabase(user) {
        let checkResult = db.fetch(`${user.guild.id}.ticket.users.${user.id}.channel`) ? true : false
        return checkResult;
    }

    async getChannel(user) {
        let channel = await db.fetch(`${user.guild.id}.ticket.users.${user.id}.channel`)
        return channel;
    }

    async ticketCreate(user, interaction) {
        let control = await this.checkDatabase(user)
        await interaction.deferUpdate().catch(err => {});
        let category = await config.boolCategory()
        if(control === false) {
            interaction.guild.channels.create(`vin-${interaction.member.user.tag}`, {
                parent: `${config.getTicketCategory()}`} ).then(c => {
                    c.permissionOverwrites.create(interaction.guild.roles.everyone.id, { VIEW_CHANNEL: false });
                    if(category === true) {
                        c.permissionOverwrites.edit(interaction.member.id, { VIEW_CHANNEL: true, SEND_MESSAGES: false });
                    }else{
                        c.permissionOverwrites.edit(interaction.member.id, { VIEW_CHANNEL: true, SEND_MESSAGES: true });
                    }
                    
                    c.setTopic(user.id)
                    db.set(`${interaction.guild.id}.ticket.users.${user.id}.channel`, c.id)
                    this.sendMessage(user, c)
                })  
        }else{
            var channel = await this.getChannel(user)
            var getChannel = await interaction.guild.channels.cache.get(channel)
            await getChannel.send({content: `> ${user}, destek talebin burada! Yeni bir talep oluşturamazsın.`})
        }  
    }

    async ticketDelete(channel) {
        let ticketOwner = channel.guild.members.cache.get(channel.topic);
        let control = await this.checkDatabase(ticketOwner)
        if(control === true) {
            db.delete(`${channel.guild.id}.ticket.users.${ticketOwner.id}`)
            this.sendLog("ticketDelete", channel)
        }
    }

    async ticketDeleteButton(channel) {
        let ticketOwner = channel.guild.members.cache.get(channel.topic);
        let control = await this.checkDatabase(ticketOwner)
        if(channel.parent.id === `${config.getTicketCategory()}`) {
            if(control === true) {
                db.delete(`${channel.guild.id}.ticket.users.${ticketOwner.id}`)
                channel.send({content: "> Bu talep (**5**) saniye içerisinde silinecektir."}).then(() => {
                    setTimeout(() => {
                        channel.delete()
                    }, 5000)
                })
                this.sendLog("ticketDelete", channel)
            } 
        }
    }

    async getCategory(data) {
        if(data === "teknik-") {
            return "Teknik Destek";
        }else if(data === "genel-") {
            return "Genel Destek";
        }
    }

    async setTicketCategory(category, interaction) {
        await interaction.deferUpdate().catch(err => {});
        interaction.channel.bulkDelete(100)
        var ticketCategory = await this.getCategory(category);
        var announcer = await config.getActiveAnnouncer();
        var staffRole = await config.getStaffRole();
        await interaction.channel.setName(category + interaction.member.user.tag)
        await interaction.channel.permissionOverwrites.edit(interaction.member.id, { SEND_MESSAGES: true });
        await interaction.channel.permissionOverwrites.edit(staffRole, { SEND_MESSAGES: true });
        const embed = new MessageEmbed()
            .setAuthor({name: `${config.getTitle()}`, iconURL: interaction.member.displayAvatarURL({dynamic: true})})
            .setDescription(`Tekrardan merhaba ${interaction.member}!
            > Talebinin oluşturma süreci tamamlandı! Artık sadece bizi beklemek kalıyor.
            `)
            .addFields(
                {name: "\u200B", value: "- Talep hakkında:", inline: false},
                {name: "Talep Sahibi:", value: `${interaction.member}`, inline: true},
                {name: "Kategori:", value: `\`${ticketCategory}\``, inline: true}
            )
            .setColor(`${config.getColor()}`)
            .setThumbnail(interaction.member.displayAvatarURL({dynamic: true}))
            .setImage(`${config.getImage()}`)
            .setFooter({text: `${config.getFooter()}`, iconURL: interaction.member.displayAvatarURL()})
            const messageRow = new MessageActionRow()
            .addComponents( 
                new MessageButton()
                    .setCustomId('ticketClose')
                    .setLabel('🔒 Talebi Kapat')
                    .setStyle('DANGER'), 
            );
        interaction.channel.send({embeds: [embed], components: [messageRow]})
        if(announcer === true) {
            interaction.channel.send({content: `<@&${staffRole}>`})
        }
    }

    async sendLog(logType, data) {
        var logChannelID = config.getLogChannel()
        var logActive = config.getLogActive()
        var logChannel = data.guild.channels.cache.get(logChannelID)
        if(logActive === true) {
            if(logType === "memberAdd") {
                logChannel.send(`> ${data.author}, bir talebe üye ekledi. Kanal: ${data.channel}`)
            }else if(logType === "memberRemove") {
                logChannel.send(`> ${data.author}, bir talepten üye çıkardı. Kanal: ${data.channel}`)
            }else if(logType === "ticketDelete") {
                const file = new MessageAttachment(`./logs/${data.id}.txt`);
                var ownerTicket = data.guild.members.cache.get(data.topic)
                const embed = new MessageEmbed()
                    .setAuthor({name: `${config.getTitle()}`, iconURL: ownerTicket.displayAvatarURL({dynamic: true})})
                    .setDescription(`Bir talep kapatıldı.`)
                    .addFields(
                        { name: "Kapatılan Destek Kanalı:", value: `\`${data.name}\` - \`${data.id}\``},
                        { name: "Talep Sahibi:", value: `${ownerTicket}`, inline: true}
                    )
                    .setColor(`${config.getColor()}`)
                    .setThumbnail(ownerTicket.displayAvatarURL({dynamic: true}))
                    .setFooter({text: `${config.getFooter()}`, iconURL: ownerTicket.displayAvatarURL({dynamic: true})})
                logChannel.send({embeds: [embed], files: [file]})    

            }
        }else{
            return;
        }
    }

    async ticketAddMember(message, member, channel) {
        var ticketCategory = await config.getTicketCategory()
        if(channel.parent.id === ticketCategory) {
            await channel.permissionOverwrites.edit(member.id, { VIEW_CHANNEL: true, SEND_MESSAGES: true });
            const embed = new MessageEmbed()
                .setAuthor({name: `${config.getTitle()}`, iconURL: member.displayAvatarURL({dynamic: true})})
                .setDescription(`Belirttiğin üye talebe eklendi.`)
                .addFields(
                    { name: "Eklenen Üye:", value: `${member}`, inline: true },
                    { name: "Ekleyen Üye", value: `${message.author}`, inline: true },
                    { name: "Kanal:", value: `${channel} - \`${channel.id}\`` }
                )
                .setColor(`${config.getColor()}`)
                .setFooter({text: `${config.getFooter()}`, iconURL: member.displayAvatarURL({dynamic: true})})
                .setThumbnail(member.displayAvatarURL({dynamic: true}))
            channel.send({embeds: [embed]})   
            this.sendLog("memberAdd", message)     
        }else{
            channel.send("> Burası bir talep değil.")
        }    
    }

    async ticketRemoveMember(message, member, channel) {
        var ticketCategory = await config.getTicketCategory()
        if(channel.parent.id === ticketCategory) {
            await channel.permissionOverwrites.edit(member.id, { VIEW_CHANNEL: false });
            const embed = new MessageEmbed()
                .setAuthor({name: `${config.getTitle()}`, iconURL: member.displayAvatarURL({dynamic: true})})
                .setDescription(`Belirttiğin üye talepten çıkarıldı.`)
                .addFields(
                    { name: "Çıkarılan Üye:", value: `${member}`, inline: true },
                    { name: "Çıkaran Üye", value: `${message.author}`, inline: true },
                    { name: "Kanal:", value: `${channel} - \`${channel.id}\`` }
                )
                .setColor(`${config.getColor()}`)
                .setFooter({text: `${config.getFooter()}`, iconURL: member.displayAvatarURL({dynamic: true})})
                .setThumbnail(member.displayAvatarURL({dynamic: true}))
            channel.send({embeds: [embed]})        
            this.sendLog("memberRemove", message)  
        }else{
            channel.send("> Burası bir talep değil.")
        }   
    }
}

module.exports = { ticketUtils };
