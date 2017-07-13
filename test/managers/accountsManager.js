const assert = require('assert');
const accountsManager = require('../../app/managers/accountsManager');

describe('Account manager test', function () {
    it('concurrency collision', async function () {
        await Promise.all([
            accountsManager.makeUser(0, '0'),
            accountsManager.makeUser(1, '1'),
        ]);

        // wait for the stream to finish writing
        await new Promise(function (resolve) {
            setTimeout(function () {
                resolve();
            }, 100)
        });

        let user0 = accountsManager.getUser(0);
        assert.equal('0', user0.query);

        let user1 = accountsManager.getUser(1);
        assert.equal('1', user1.query);
    });
});