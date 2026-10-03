const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { api, connect, disconnect, createUser, createBook } = require('./helpers');

describe('book list pagination', () => {
    let books;

    before(async () => {
        await connect('pagination');
        const admin = await createUser({ email: 'admin@test.com' });
        books = [];
        // 30 books, several with the same price so the sort needs a tie-breaker
        for (let i = 1; i <= 30; i++) {
            books.push(await createBook(admin.token, { title: `Book ${String(i).padStart(2, '0')}`, price: 10 + (i % 3), category: i <= 10 ? 'Short' : 'Long' }));
        }
    });
    after(disconnect);

    it('returns 24 books per page by default, with page info', async () => {
        const res = await api.get('/books');
        assert.equal(res.status, 200);
        assert.equal(res.body.data.length, 24);
        assert.deepEqual(res.body.pagination, { page: 1, limit: 24, total: 30, totalPages: 2 });

        const second = await api.get('/books?page=2');
        assert.equal(second.body.data.length, 6);
        assert.equal(second.body.pagination.page, 2);
    });

    it('never repeats or skips a book across pages, even with ties', async () => {
        for (const sort of ['price_asc', 'newest', 'rating']) {
            const seen = [];
            for (let page = 1; page <= 4; page++) {
                const res = await api.get(`/books?sort=${sort}&limit=8&page=${page}`);
                seen.push(...res.body.data.map((book) => book._id));
            }
            assert.equal(seen.length, 30, sort);
            assert.equal(new Set(seen).size, 30, sort);
        }
    });

    it('counts only the filtered books', async () => {
        const res = await api.get('/books?category=Short&limit=4&page=3');
        assert.equal(res.body.data.length, 2);
        assert.deepEqual(res.body.pagination, { page: 3, limit: 4, total: 10, totalPages: 3 });
    });

    it('returns an empty page past the end', async () => {
        const res = await api.get('/books?page=99');
        assert.equal(res.status, 200);
        assert.deepEqual(res.body.data, []);
        assert.equal(res.body.pagination.totalPages, 2);
    });

    it('rejects bad page and limit values', async () => {
        for (const query of ['page=0', 'page=-1', 'page=1.5', 'page=abc', 'limit=0', 'limit=101', 'limit=abc']) {
            assert.equal((await api.get(`/books?${query}`)).status, 400, query);
        }
    });

    it('fetches specific books by id', async () => {
        const wanted = [books[0]._id, books[29]._id];
        const res = await api.get(`/books?ids=${wanted.join(',')}`);
        assert.deepEqual(res.body.data.map((book) => book._id).sort(), [...wanted].sort());

        assert.equal((await api.get('/books?ids=not-an-id')).status, 400);
        const tooMany = Array.from({ length: 101 }, () => new mongoose.Types.ObjectId().toString());
        assert.equal((await api.get(`/books?ids=${tooMany.join(',')}`)).status, 400);
    });
});
