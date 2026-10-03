const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { api, connect, disconnect } = require('./helpers');

describe('health check and unknown routes', () => {
    before(() => connect('health'));
    after(disconnect);

    it('reports a connected database', async () => {
        const res = await api.get('/health');
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { status: 'ok', database: 'connected' });
    });

    it('answers unknown API addresses and missing uploads with a JSON 404', async () => {
        for (const path of ['/auth/nope', '/books/categories/extra', '/uploads/missing.png']) {
            const res = await api.get(path);
            assert.equal(res.status, 404, path);
            assert.equal(res.body.success, false, path);
        }
    });

    it('asks for login before revealing anything under logged-in-only areas', async () => {
        for (const path of ['/orders/mine/extra', '/me/nothing']) {
            assert.equal((await api.get(path)).status, 401, path);
        }
    });
});
