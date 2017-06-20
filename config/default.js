module.exports = {
    app: require('../package.json'),
    ria: {
        api: {
            queryTranslateFromNew: 'https://auto.ria.com/demo/bu/searchPage/v2/query/new',
            queryTranslateFromOld: 'https://auto.ria.com/demo/bu/searchPage/v2/query/old',
            searchUrl: 'https://developers.ria.com/auto/search/',
            key: process.env.NODE_RIA_API_KEY || 'place_your_api_key_here'
        }
    },
    bot: {
        token : process.env.NODE_BOT_TOKEN || 'place_your_token_here'
    }
};