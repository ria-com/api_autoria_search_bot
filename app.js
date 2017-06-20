const config = require('config'),
    TelegramBot = require('node-telegram-bot-api'),
    token = config.bot.token,
    botHelper = require('./app/helpers/botHelper'),
    bot = new TelegramBot(token, {polling:true} )
    accountsManager = require('./app/managers/accountsManager'),
    autoManager = require('./app/managers/autoManager'),
    schedule = require('node-schedule');

bot.onText(/\/start/, (msg) => {
    msg.processed = true;
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, botHelper.getHelp());
});

bot.onText(/\/set\s?(.+)?/, (msg, match) => {
    msg.processed = true;
    bot.sendMessage(msg.chat.id, botHelper.setCommand(msg,match));
});

bot.onText(/\/get(.+)?/, (msg, match) => {
    msg.processed = true;
    bot.sendMessage(msg.chat.id, botHelper.getCommand(msg,match));
});

bot.onText(/\/on(.+)?/, (msg, match) => {
    msg.processed = true;
    bot.sendMessage(msg.chat.id, botHelper.onCommand(msg,match));
});

bot.onText(/\/off(.+)?/, (msg, match) => {
    msg.processed = true;
    bot.sendMessage(msg.chat.id, botHelper.offCommand(msg,match));
});

bot.onText(/\/echo (.+)/, (msg, match) => {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    msg.processed = true;
    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"

    // send back the matched "whatever" to the chat
    bot.sendMessage(chatId, resp);
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
    // Debug inbound message
    console.log(msg);
    setTimeout(function () {
        if (!msg.processed) {
            bot.sendMessage(msg.chat.id, botHelper.unknownCommand(msg));
        }
    },1000)
});

var j = schedule.scheduleJob('53 * * * *', function(){
    console.log('Обработка всех подписок!');
    (async function () {
        //await sleep(1000);
        users = await accountsManager.getUsers();
        for (let key of Object.keys(users)) {
            console.log(`Проверяем подписку пользователя №${key}`);
            let data = await autoManager.getSearchData(users[key].queryOld);
            if (data.result.search_result.ids.length) {
                console.log(data.result.search_result.ids);
                for (let id of data.result.search_result.ids) {
                    bot.sendMessage(key, botHelper.makeReply([id]));
                }
            }
        }

    })();
});

