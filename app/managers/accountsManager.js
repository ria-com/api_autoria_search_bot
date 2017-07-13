const config = require('config'),
      users = {},
      fs = require('fs'),
      readdir = require('fs-readdir-promise'),
      request = require('request-promise'),
      dbDir = `${process.cwd()}/data/`,
      userFilePattern = /(\d+)\.json/;

function getUserFilename (userId) {
    return `${dbDir}${userId}.json`;
}

function writeUser (userId, userConfig) {
    var stream = fs.createWriteStream(getUserFilename(userId));
    stream.once('open', function(fd) {
        stream.write(JSON.stringify(userConfig,null,2));
        stream.end();
    });
}


module.exports = {
    getUsers: async function () {
        let users = {};
        //console.log(dbDir);
        let files = await readdir(dbDir);
        for(let file of files) {
            //console.log(file);
            let res;
            if (res = userFilePattern.exec(file)) {
                let user = require(getUserFilename(res[1]));
                if (user.watchStatus) {
                    users[res[1]] = user;
                }
            }
        }
        return users;
    },

    makeUser: function (userId, query) {
        let userConfig = module.exports.getUser(userId);
        userConfig.query = query;
        userConfig.setDate = new Date().getTime();
        userConfig.watchStatus = true;

        console.log(`Create settings for user: ${userId} ...`);
        return request({
            uri: config.ria.api.queryTranslateFromNew+'?'+query,
            json: true
        })
            .then(function (data) {
                userConfig.queryOld = decodeURIComponent(data.string);
                writeUser(userId, userConfig);
            })
            .catch(function (err) {
                // API call failed...
            });
    },

    switchWatchingUser: function (userId, watchStatus) {
        try {
            let userConfig = require(getUserFilename(userId));
            userConfig.setDate = new Date().getTime();
            userConfig.watchStatus = watchStatus;
            writeUser(userId, userConfig);
            return true;
        } catch (e) {
            return false;
        }
    },

    getUser: function (userId) {
        let userConfig = {};
        try {
            userConfig = require(getUserFilename(userId));
        } catch (e) {
        }
        return userConfig;
    }
};