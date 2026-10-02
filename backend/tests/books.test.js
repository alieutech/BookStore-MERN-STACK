const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { api, connect, disconnect, createUser, createBook, auth } = require('./helpers');

describe('books', () => {
    let admin;
    let user;

    before(async () => {
        await connect('books');
        admin = await createUser({ email: 'admin@test.com' });
        user = await createUser();
    });
    after(disconnect);

    it('only lets admins create, edit and delete books', async () => {
        const book = { title: 'T', author: 'A', publishYear: 2000, price: 5, image: 'https://x/y.png' };
        assert.equal((await api.post('/books').send(book)).status, 401);
        assert.equal((await api.post('/books').set(auth(user.token)).send(book)).status, 403);

        const created = await createBook(admin.token);
        assert.equal((await api.put(`/books/${created._id}`).set(auth(user.token)).send({ price: 1 })).status, 403);
        assert.equal((await api.delete(`/books/${created._id}`).set(auth(user.token))).status, 403);
    });

    it('validates required fields and ids', async () => {
        const missing = await api.post('/books').set(auth(admin.token)).send({ title: 'Only a title' });
        assert.equal(missing.status, 400);
        assert.equal((await api.get('/books/not-an-id')).status, 400);
        assert.equal((await api.get('/books/507f1f77bcf86cd799439011')).status, 404);
    });

    it('updates only the fields sent and ignores rating fields', async () => {
        const book = await createBook(admin.token, { title: 'Before' });
        const res = await api
            .put(`/books/${book._id}`)
            .set(auth(admin.token))
            .send({ title: 'After', averageRating: 5, numReviews: 99 });
        assert.equal(res.status, 200);
        assert.equal(res.body.data.title, 'After');
        assert.equal(res.body.data.author, book.author);
        assert.equal(res.body.data.averageRating, 0);
        assert.equal(res.body.data.numReviews, 0);
    });

    it('deletes a book', async () => {
        const book = await createBook(admin.token);
        assert.equal((await api.delete(`/books/${book._id}`).set(auth(admin.token))).status, 200);
        assert.equal((await api.get(`/books/${book._id}`)).status, 404);
    });

    describe('search, filters and sorting', () => {
        before(async () => {
            await api.delete('/books'); // no-op; keeps the data set below predictable
            await createBook(admin.token, { title: 'Refactoring', author: 'Martin Fowler', price: 20, category: 'Programming' });
            await createBook(admin.token, { title: 'Dune', author: 'Frank Herbert', price: 9.99, category: 'Fiction' });
            await createBook(admin.token, { title: 'Sapiens', author: 'Yuval Harari', price: 15, category: 'History' });
        });

        const titles = (res) => res.body.data.map((book) => book.title);

        it('searches title and author, case-insensitively and literally', async () => {
            assert.deepEqual(titles(await api.get('/books?q=fowler')), ['Refactoring']);
            assert.deepEqual(titles(await api.get('/books?q=DUNE')), ['Dune']);
            assert.deepEqual(titles(await api.get('/books?q=.*')), []);
        });

        it('filters by category and price range', async () => {
            assert.deepEqual(titles(await api.get('/books?category=Fiction')), ['Dune']);
            assert.deepEqual(titles(await api.get('/books?minPrice=10&maxPrice=16&q=sapiens')), ['Sapiens']);
            assert.equal((await api.get('/books?minPrice=abc')).status, 400);
        });

        it('sorts by price and rejects unknown sorts', async () => {
            const res = await api.get('/books?sort=price_asc&q=e'); // Refactoring, Dune, Sapiens all contain "e"
            const prices = res.body.data.map((book) => book.price);
            assert.deepEqual(prices, [...prices].sort((a, b) => a - b));
            assert.equal((await api.get('/books?sort=constructor')).status, 400);
        });

        it('lists categories in use', async () => {
            const res = await api.get('/books/categories');
            assert.deepEqual(res.body.data, ['Fiction', 'History', 'Programming']);
        });
    });
});
