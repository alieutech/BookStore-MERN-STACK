const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { api, connect, disconnect, createUser, createBook, auth, placeOrder } = require('./helpers');

describe('reviews', () => {
    let admin;
    let bob;
    let eve;
    let book;

    before(async () => {
        await connect('reviews');
        admin = await createUser({ email: 'admin@test.com' });
        bob = await createUser({ name: 'Bob' });
        eve = await createUser({ name: 'Eve' });
        book = await createBook(admin.token);
        await placeOrder(bob.token, [{ book: book._id, quantity: 1 }]);
    });
    after(disconnect);

    const review = (token, body) => api.post(`/books/${book._id}/reviews`).set(auth(token)).send(body);
    const stats = async () => {
        const { averageRating, numReviews } = (await api.get(`/books/${book._id}`)).body.data;
        return { averageRating, numReviews };
    };

    it('validates ratings and comments', async () => {
        assert.equal((await api.post(`/books/${book._id}/reviews`).send({ rating: 5 })).status, 401);
        assert.equal((await review(bob.token, { rating: 6 })).status, 400);
        assert.equal((await review(bob.token, { rating: 4.5 })).status, 400);
        assert.equal((await review(bob.token, { rating: 4, comment: 'x'.repeat(1001) })).status, 400);
    });

    it('keeps one review per user, marks buyers as verified and updates the average', async () => {
        const first = await review(bob.token, { rating: 5, comment: 'Great' });
        assert.equal(first.status, 201);
        assert.equal(first.body.data.verifiedPurchase, true);

        const updated = await review(bob.token, { rating: 4, comment: 'Good' });
        assert.equal(updated.status, 200);
        assert.equal(updated.body.data._id, first.body.data._id);

        const other = await review(eve.token, { rating: 2 });
        assert.equal(other.body.data.verifiedPurchase, false);

        assert.deepEqual(await stats(), { averageRating: 3, numReviews: 2 });
        const list = await api.get(`/books/${book._id}/reviews`);
        assert.deepEqual(list.body.data.map((r) => r.user.name).sort(), ['Bob', 'Eve']);
    });

    it('lets only the author or an admin delete a review', async () => {
        const list = (await api.get(`/books/${book._id}/reviews`)).body.data;
        const eves = list.find((r) => r.user.name === 'Eve');
        const bobs = list.find((r) => r.user.name === 'Bob');

        assert.equal((await api.delete(`/books/${book._id}/reviews/${eves._id}`).set(auth(bob.token))).status, 404);
        assert.equal((await api.delete(`/books/${book._id}/reviews/${eves._id}`).set(auth(admin.token))).status, 200);
        assert.deepEqual(await stats(), { averageRating: 4, numReviews: 1 });
        assert.equal((await api.delete(`/books/${book._id}/reviews/${bobs._id}`).set(auth(bob.token))).status, 200);
        assert.deepEqual(await stats(), { averageRating: 0, numReviews: 0 });
    });

    it('deletes reviews together with their book', async () => {
        await review(bob.token, { rating: 5 });
        await api.delete(`/books/${book._id}`).set(auth(admin.token));
        assert.equal(await mongoose.model('Review').countDocuments({ book: book._id }), 0);
    });
});
