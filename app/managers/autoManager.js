const config = require('config'),
      request = require('request-promise'),
      searchUrl = config.ria.api.searchUrl;

module.exports = {
    getSearchData: async function (searchParams) {
        let ids = {};
        let data = await request({
            uri: `${searchUrl}?${searchParams}&top=1&api_key=${config.ria.api.key}`,
            json: true
        });
        return data;
    }
};