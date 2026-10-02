const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { api, connect, disconnect, createUser, auth } = require('./helpers');

describe('auth', () => {
    before(() => connect('auth'));
    after(disconnect);

    it('registers a user without returning the password', async () => {
        const res = await api.post('/auth/register').send({ name: 'Bob', email: 'Bob@Test.com', password: 'password123' });
        assert.equal(res.status, 201);
        assert.equal(res.body.data.user.email, 'bob@test.com');
        assert.equal(res.body.data.user.role, 'user');
        assert.equal(res.body.data.user.password, undefined);
        assert.ok(res.body.data.token);
    });

    it('gives the admin role to ADMIN_EMAILS', async () => {
        const { user } = await createUser({ email: 'admin@test.com' });
        assert.equal(user.role, 'admin');
    });

    it('rejects duplicate emails, short passwords and bad input', async () => {
        await createUser({ email: 'dup@test.com' });
        const dup = await api.post('/auth/register').send({ name: 'X', email: 'DUP@test.com', password: 'password123' });
        assert.equal(dup.status, 409);

        const short = await api.post('/auth/register').send({ name: 'X', email: 'x@test.com', password: 'short' });
        assert.equal(short.status, 400);

        const long = await api.post('/auth/register').send({ name: 'X', email: 'x@test.com', password: 'a'.repeat(73) });
        assert.equal(long.status, 400);

        const badEmail = await api.post('/auth/register').send({ name: 'X', email: 'not-an-email', password: 'password123' });
        assert.equal(badEmail.status, 400);
    });

    it('logs in with the right password only', async () => {
        await createUser({ email: 'login@test.com' });
        const ok = await api.post('/auth/login').send({ email: 'login@test.com', password: 'password123' });
        assert.equal(ok.status, 200);
        assert.ok(ok.body.data.token);

        const wrong = await api.post('/auth/login').send({ email: 'login@test.com', password: 'wrongpass1' });
        assert.equal(wrong.status, 401);

        const unknown = await api.post('/auth/login').send({ email: 'nobody@test.com', password: 'password123' });
        assert.equal(unknown.status, 401);
    });

    it('ignores query operators sent instead of an email', async () => {
        const res = await api.post('/auth/login').send({ email: { $gt: '' }, password: 'password123' });
        assert.equal(res.status, 400);
    });

    it('returns the current user for a valid token only', async () => {
        const { token, user } = await createUser();
        const me = await api.get('/auth/me').set(auth(token));
        assert.equal(me.status, 200);
        assert.equal(me.body.data._id, user._id);

        assert.equal((await api.get('/auth/me')).status, 401);
        assert.equal((await api.get('/auth/me').set(auth('not-a-token'))).status, 401);
    });
});
