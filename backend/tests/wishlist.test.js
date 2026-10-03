const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { api, connect, disconnect, createUser, createBook, auth } = require('./helpers');
const { MAX_WISHLIST } = require('../controllers/wishlist');

describe('wishlist', () => {
    let admin;
    let bob;
    let eve;
    let dune;
    let code;

    before(async () => {
        await connect('wishlist');
        admin = await createUser({ email: 'admin@test.com' });
        bob = await createUser();
        eve = await createUser();
        dune = await createBook(admin.token, { title: 'Dune' });
        code = await createBook(admin.token, { title: 'Clean Code' });
    });
    after(disconnect);

    const save = (token, id) => api.put(`/me/wishlist/${id}`).set(auth(token));
    const remove = (token, id) => api.delete(`/me/wishlist/${id}`).set(auth(token));
    const list = (token) => api.get('/me/wishlist').set(auth(token));

    it('requires login', async () => {
        assert.equal((await api.get('/me/wishlist')).status, 401);
        assert.equal((await api.put(`/me/wishlist/${dune._id}`)).status, 401);
    });

    it('saves books once each, most recent first', async () => {
        assert.deepEqual((await save(bob.token, dune._id)).body.data, [dune._id]);
        const again = await save(bob.token, dune._id);
        assert.equal(again.status, 200);
        assert.deepEqual(again.body.data, [dune._id]);
        await save(bob.token, code._id);

        const res = await list(bob.token);
        assert.equal(res.status, 200);
        assert.deepEqual(res.body.data.map((book) => book.title), ['Clean Code', 'Dune']);
    });

    it('keeps each user’s wishlist private', async () => {
        assert.deepEqual((await list(eve.token)).body.data, []);
    });

    it('validates the book', async () => {
        assert.equal((await save(bob.token, 'nope')).status, 400);
        assert.equal((await save(bob.token, new mongoose.Types.ObjectId())).status, 404);
        assert.equal((await remove(bob.token, 'nope')).status, 400);
    });

    it('removes books, and removing twice is harmless', async () => {
        assert.deepEqual((await remove(bob.token, dune._id)).body.data, [code._id]);
        assert.equal((await remove(bob.token, dune._id)).status, 200);
        assert.deepEqual((await list(bob.token)).body.data.map((book) => book.title), ['Clean Code']);
    });

    it('does not include the wishlist in the user profile', async () => {
        const me = await api.get('/auth/me').set(auth(bob.token));
        assert.equal(me.body.data.wishlist, undefined);
    });

    it('drops a deleted book from every wishlist', async () => {
        await save(eve.token, code._id);
        await api.delete(`/books/${code._id}`).set(auth(admin.token));
        assert.deepEqual((await list(bob.token)).body.data, []);
        assert.deepEqual((await list(eve.token)).body.data, []);
        const stored = await mongoose.model('User').find({ wishlist: code._id });
        assert.equal(stored.length, 0);
    });

    it(`stops at ${MAX_WISHLIST} books`, async () => {
        const ids = Array.from({ length: MAX_WISHLIST }, () => new mongoose.Types.ObjectId());
        await mongoose.model('User').updateOne({ _id: eve.user._id }, { $set: { wishlist: ids } });
        const res = await save(eve.token, dune._id);
        assert.equal(res.status, 409);
        // Saving a book that is already there still works when full
        await mongoose.model('User').updateOne({ _id: eve.user._id }, { $set: { [`wishlist.0`]: dune._id } });
        assert.equal((await save(eve.token, dune._id)).status, 200);
    });
});
