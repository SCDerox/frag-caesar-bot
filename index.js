const Discord = require('discord.js');
const config = require('./config.json');
const {getWordInformation} = require('frag-caesar');
const translate = require('@postor/google-translate-api');
const fs = require('fs');
const client = new Discord.Client();

client.on('ready', async () => {
    await client.user.setActivity('Simon ist hobbylos.');
    console.log(`I'm ready. Logged in as ${client.user.tag}.`);
});

client.on('message', async (msg) => {
    if (msg.author.bot) return;
    if (msg.channel.id !== config.channel) return;
    if (msg.content.startsWith('$')) return;
    let content = `\`${msg.content}\`\n\n`;
    let translation = 'Lange Übersetzungen sind nicht verfügbar.'
    const message = await msg.channel.send('<a:loading:801405072537157653> Wird geladen... Dies kann je nach Länge deines Satzes etwas dauern... <a:loading:801405072537157653>');
    if (msg.content.split(',').join('').split('.').join('').split(' ').length > 40) message.edit('<a:loading:801405072537157653> Das wird etwas dauern... Ich pinge dich, wenn es fertig ist... <a:loading:801405072537157653>');
    else translation = await translate(msg.content, {to: 'de', from: 'la'});
    for (const w of msg.content.split(',').join('').split('.').join('').split(' ')) {
        const wordInfo = await getWordInformation(w.toLowerCase());
        let wordString = '';
        if (!wordInfo) wordString = 'Nicht gefunden.';
        else wordString = `${wordInfo.form ? `${wordInfo.form} ` : ''}(${wordInfo.type}${wordInfo.flexion_type ? `- ${wordInfo.flexion_type}` : ''}): ${wordInfo.german.split('|').splice(0, 3).join(', ')}`;
        content = content + `**${w.toLowerCase()}**: ${wordString}\n`;
    }
    await message.edit(`${content}\nGoogle-Translate: \`${translation.text}\``).catch(async () => {
        await fs.writeFileSync('./message.txt', `${content}\nGoogle-Translate: \`${translation.text}\``);
        await msg.channel.send({
            content: `Ergebniss für <@${msg.author.id}>`,
            files: [{attachment: `${__dirname}/message.txt`, name: 'fick_dich.txt'}]
        });
        message.edit(`Wer das liest ist dumm`)
    });
});

client.login(config.token);