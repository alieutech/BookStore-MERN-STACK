// A low login limit for this file only (each test file runs in its own process)
process.env.AUTH_RATE_LIMIT = '3';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { api, connect, disconnect, createUser } = require('./helpers');

describe('security', () => {
    before(() => connect('security'));
    after(disconnect);

    it('sends security headers', async () => {
        const res = await api.get('/books');
        assert.match(res.headers['content-security-policy'], /script-src 'self'/);
        assert.equal(res.headers['x-content-type-options'], 'nosniff');
        assert.equal(res.headers['x-powered-by'], undefined);
    });

    it('rejects malformed and oversized bodies', async () => {
        const bad = await api.post('/auth/login').set('Content-Type', 'application/json').send('{bad');
        assert.equal(bad.status, 400);
        const huge = await api.post('/books').send({ title: 'x'.repeat(200 * 1024) });
        assert.equal(huge.status, 413);
    });

    it('limits failed logins but not successful ones', async () => {
        await createUser({ email: 'limit@test.com' });
        const login = (password) => api.post('/auth/login').send({ email: 'limit@test.com', password });

        assert.equal((await login('password123')).status, 200);
        const failures = [];
        for (let i = 0; i < 4; i++) failures.push((await login('wrongpass1')).status);
        assert.deepEqual(failures, [401, 401, 401, 429]); // limit is 3 failures
        assert.equal((await login('password123')).status, 429);
    });
});
