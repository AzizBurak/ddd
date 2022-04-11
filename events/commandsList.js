const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const moment = require('moment');
const { configUtils } = require('../utils/configUtils');
const { ticketUtils } = require('../utils/ticketUtils');
let ticketManager = new ticketUtils();

module.exports = async(client) => {
    /**
     * 
     * @param {configUtils} configUtils 
     * 
    */
    async function userCheck(message) {
        var check = message.author.bot ? true : false; 
        return check;
    }

    var config = await new configUtils();
    var prefix = await config.getPrefix();

    client.on('messageCreate', async(message) => {
        if(!message.content.startsWith(prefix) || message.author.bot) return;
        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();
        const memberBot = await userCheck(message)
        if(memberBot === false) {
            if(command === "talep") {
                if(args[0]) {
                    if(args[0] === "ekle") {
                        var member = message.guild.members.cache.get(args[1])
                        if(member) {
                            ticketManager.ticketAddMember(message, member, message.channel)
                        }else{
                            message.reply("> Bir üye belirt. (ID)")
                        }
                    }else if(args[0] === "çıkar") {
                        var member = message.guild.members.cache.get(args[1])
                        if(member) {
                            ticketManager.ticketRemoveMember(message, member, message.channel)
                        }else{
                            message.reply("> Bir üye belirt. (ID)")
                        }
                    }else{
                        message.reply("> Bir seçenek belirt.")
                    }
                }else{
                    message.reply("> Bir seçenek belirt.")
                }
            }
            if(command === "yardım") {
                const embed = new MessageEmbed()
                    .setDescription(`Genel komutlar ve kullanımları:`)
                    .addFields(
                        { name: `(${prefix}yardım)`, value: "Kullanılabilecek komutları görüntüler." },
                        { name: `(${prefix}anamesaj)`, value: "Talep oluşturma mesajını gönderir."}
                    )
                //message.reply({embeds: [embed]})
            } 
            if(command === "anamesaj") {
                if(!message.member.permissions.has(['ADMINISTATOR'])) return;
                const messageRow = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('ticket_create')
                        .setLabel('📩 Talep Oluştur')
                        .setStyle('PRIMARY'),
                );

                const embed = new MessageEmbed()
                    .setAuthor({name: `${config.getTitle()}`})
                    .setDescription(`Yardıma ihtiyacın mı var? Bir sorunu çözemiyor musun? \n> Talep açarak sorunlarına çözüm bulabilirsin.`)
                    .addFields(
                        { name: ":envelope_with_arrow: Talep Oluştur", value: "Butonuna tıklayarak talebini oluşturabilirsin." }
                    )
                    .setColor(`${config.getColor()}`)
                    .setThumbnail(client.user.displayAvatarURL())
                    .setFooter({text: `${config.getFooter()}`})
                    .setImage(`${config.getImage()}`)
                message.channel.send({embeds: [embed], components: [messageRow]})    
            } 
            if(command === "profil") {
                const member = message.member || message.author;
    
                const filterRole = member.roles.cache.filter(r => r.id !== message.guild.roles.everyone.id);
                const listRole = filterRole.sort((a,b) => b.position - a.position).map(r => r.toString()).join(', ');
                
                const ticketMember = await ticketManager.checkDatabase(member)
                const memberTicket = []
                if(ticketMember === true) {
                    const ticketChannel = await ticketManager.getChannel(member);
                    memberTicket.push(member.guild.channels.cache.get(ticketChannel))
                }else{
                    memberTicket.push("Aktif talebi yok.")
                }

                const memberNickname = member.nickname;
                const nickname = []
                if(memberNickname) {
                    nickname.push(`${memberNickname}`)
                }else{
                    nickname.push(`Sunucuda ismi yok.`)
                }
                const embed = new MessageEmbed()
                    .setAuthor({name: `${config.getTitle()}`, iconURL: member.displayAvatarURL({dynamic: true})})
                    .setDescription(`${message.author}#${message.author.discriminator} kullanıcısı için bilgiler.`)
                    .addFields(
                        { name: "\u200B", value: `> **Kullanıcı**:`, inline: false},
                        { name: "ID:", value: `${message.member.id}`, inline: true },
                        { name: "Hesap Kuruluş:", value: `${moment(message.author.createdAt).format('DD/MM/YYYY (hh:mm:ss)')}`, inline: true },
                        { name: `Rolleri: (${filterRole.size})`, value: `${listRole}`, inline: true },
                        { name: "\u200B", value: `> **Sunucu**:`, inline: false},
                        { name: "Katılma Tarihi:", value: `${moment(member.joinedAt).format('DD/MM/YYYY (hh:mm:ss)')}`, inline: true },
                        { name: "Destek Talebi:", value: `${memberTicket}`, inline: true },
                        { name: "Sunucu daki Adı:", value: `${nickname}`, inline: true }
                    )
                    .setColor(`${config.getColor()}`)
                    .setThumbnail(member.displayAvatarURL({dynamic: true}))
                    .setFooter({text: `${config.getFooter()}`, iconURL: member.displayAvatarURL()})
                message.reply({embeds: [embed]})    
            }
        }
        
    })
}