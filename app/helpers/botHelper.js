const URL = require('url').URL,
      fs = require('fs'),
      accountsManager = require('../managers/accountsManager');



module.exports = {
    getHelp () {
        return 'Я экспериментальный робот AUTO.RIA. Готов помочь Вам отслеживать любой поисковый запрос с сайта AUTO.RIA.com. ' + "\n" +
            'Роз в час я буду просматривать Ваш поиск и присылать новые предложения из базы AUTO.RIA (если они для Вас появяться). ' + "\n\n" +
            'Я понимаю следующие команды: ' + "\n" +
            '  /start - Пришлю этот документ ' + "\n" +
            '  /set [autoria search url] - запомню Ваш поисковый запрос, например /set https://auto.ria.com/uk/search/?category_id=1&type[5]=6 ' + "\n" +
            '  /get   - напомню Вам поисковый запрос, который отслеживаю для Вас ' + "\n" +
            '  /on    - возобновлю отправку для Вас новых предложений из базы AUTO.RIA' + "\n" +
            '  /off   - перестану присылать Вам новые предложения по Вашему поисковому запросу';
            //'  /stat  - статистика по отслеживанию вашего поиска';
    },

    makeReply (ids) {
        let links = [];
        for (let id of ids) {
            links.push(`https://auto.ria.com/auto___${id}.html`);
        };
        return 'Я нашел для Вас:' + "\n" +
            links.join("\n") + "\n\n" +
            '* чтобы меня остановить, дайте команду /off';
    },

    setCommand(msg, match) {
        if (match[1] == undefined) {
            return "Дайте мне команду /set [поисковый запрос с AUTO.RIA.com] , где  \"поисковый запрос с AUTO.RIA.com\" это скопированная строка браузера в поиске AUTO.RIA.com, например /set https://auto.ria.com/uk/search/?category_id=1&type[5]=6"
        }
        let url = match[1]; // the captured "whatever"
        let myURL = new URL(url);
        console.log(myURL);

        if (!myURL.hostname.match(/auto.ria.com$/)) {
            return `Я в замешательстве :(, Вы указали неизвестный мне хост ${myURL.hostname}`;
        }

        if (!myURL.pathname.match(/search\/$/)) {
            return `Я в замешательстве :(, поисковая строка должна быть скопирована со страницы поиска б/у авто https://auto.ria.com/search/?... , а у Вас другой адрес: "${myURL.hostname}"`;
        }

        let query = myURL.search || '';
        let hash = myURL.hash;
        console.log(`query=${query}`);
        console.log(`hash=${hash}`);

        if (query == '') {
            query = hash.substr(1);
        } else {
            query = query.substr(1);
        }

        accountsManager.makeUser(msg.chat.id, query);

        return `С этого момента я буду отслеживать все новые объявления по поиску ${url}`;
    },

    getCommand(msg, match) {
        let userConfig = accountsManager.getUser(msg.chat.id);
        if(userConfig.query != undefined) {
            return `Отслеживаю поиск: https://auto.ria.com/search/?${userConfig.query}`;
        }
        return 'Я в замешательстве :(, поисковая строка не задана: Установите поисковую строку с помощью команды /set'
    },

    offCommand(msg, match) {
        accountsManager.switchWatchingUser(msg.chat.id,false);
        return 'Я приостановил отслеживать поиск для Вас'
    },

    onCommand(msg, match) {
        let result = accountsManager.switchWatchingUser(msg.chat.id,true);
        if(!result) {
            return 'Я в замешательстве :(, не могу выполнить эту команду: вы не указали поисковую строку с помощью команды /set'
        }
        return 'Я опять, с радостью, буду присылать Вам новые предложения по Вашему поиску'
    },
    unknownCommand(msg) {
        return 'Я экспериментальный робот и, к сожалению, Вашу команду не понимаю. Напишите мне /start, чтоб узнать команды, которые я уже выучил.'
    }
};