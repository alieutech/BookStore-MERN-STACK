const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { api, connect, disconnect, createUser, createBook, auth, placeOrder } = require('./helpers');

const stockOf = async (id) => (await api.get(`/books/${id}`)).body.data.stock;

describe('orders and stock', () => {
    let admin;
    let bob;
    let eve;

    before(async () => {
        await connect('orders');
        admin = await createUser({ email: 'admin@test.com' });
        bob = await createUser();
        eve = await createUser();
    });
    after(disconnect);

    it('requires login and a valid cart and address', async () => {
        const book = await createBook(admin.token);
        assert.equal((await api.post('/orders').send({})).status, 401);
        assert.equal((await placeOrder(bob.token, [])).status, 400);
        assert.equal((await placeOrder(bob.token, [{ book: book._id, quantity: 0 }])).status, 400);
        const noAddress = await api.post('/orders').set(auth(bob.token)).send({ items: [{ book: book._id, quantity: 1 }] });
        assert.equal(noAddress.status, 400);
        assert.equal((await placeOrder(bob.token, [{ book: '507f1f77bcf86cd799439011', quantity: 1 }])).status, 400);
    });

    it('uses database prices, merges duplicate lines and takes stock', async () => {
        const a = await createBook(admin.token, { price: 12.5, stock: 10 });
        const b = await createBook(admin.token, { price: 20, stock: 10 });
        const res = await placeOrder(bob.token, [
            { book: a._id, quantity: 2, price: 0.01 },
            { book: b._id, quantity: 1 },
            { book: a._id, quantity: 1 },
        ]);
        assert.equal(res.status, 201);
        assert.equal(res.body.data.totalPrice, 57.5);
        assert.equal(res.body.data.items.find((item) => item.book === a._id).quantity, 3);
        assert.equal(await stockOf(a._id), 7);
        assert.equal(await stockOf(b._id), 9);
    });

    it('refuses orders larger than the stock and releases partial reservations', async () => {
        const plenty = await createBook(admin.token, { stock: 10 });
        const scarce = await createBook(admin.token, { stock: 2 });
        const res = await placeOrder(bob.token, [
            { book: plenty._id, quantity: 2 },
            { book: scarce._id, quantity: 3 },
        ]);
        assert.equal(res.status, 409);
        assert.equal(await stockOf(plenty._id), 10);
        assert.equal(await stockOf(scarce._id), 2);
    });

    it('never sells the last copies twice', async () => {
        const book = await createBook(admin.token, { stock: 2 });
        const results = await Promise.all([
            placeOrder(bob.token, [{ book: book._id, quantity: 2 }]),
            placeOrder(eve.token, [{ book: book._id, quantity: 2 }]),
            placeOrder(eve.token, [{ book: book._id, quantity: 1 }]),
        ]);
        const placed = results.filter((res) => res.status === 201);
        const sold = placed.reduce((sum, res) => sum + res.body.data.items[0].quantity, 0);
        assert.equal(sold, 2);
        assert.equal(await stockOf(book._id), 0);
    });

    it('keeps orders private to their owner and admins', async () => {
        const book = await createBook(admin.token);
        const order = (await placeOrder(bob.token, [{ book: book._id, quantity: 1 }])).body.data;

        assert.equal((await api.get(`/orders/${order._id}`).set(auth(eve.token))).status, 404);
        assert.equal((await api.get(`/orders/${order._id}`).set(auth(bob.token))).status, 200);
        assert.equal((await api.get(`/orders/${order._id}`).set(auth(admin.token))).status, 200);

        const mine = await api.get('/orders/mine').set(auth(eve.token));
        assert.ok(mine.body.data.every((o) => o.user === eve.user._id));
        assert.equal((await api.get('/orders').set(auth(bob.token))).status, 403);
    });

    it('restores stock once when a customer cancels a pending order', async () => {
        const book = await createBook(admin.token, { stock: 5 });
        const order = (await placeOrder(bob.token, [{ book: book._id, quantity: 2 }])).body.data;
        assert.equal(await stockOf(book._id), 3);

        const [first, second] = await Promise.all([
            api.put(`/orders/${order._id}/cancel`).set(auth(bob.token)),
            api.put(`/orders/${order._id}/cancel`).set(auth(bob.token)),
        ]);
        assert.deepEqual([first.status, second.status].sort(), [200, 409]);
        assert.equal(await stockOf(book._id), 5);
        assert.equal((await api.put(`/orders/${order._id}/cancel`).set(auth(eve.token))).status, 404);
    });

    it('lets admins move orders along, restocking on cancel and locking cancelled orders', async () => {
        const book = await createBook(admin.token, { stock: 5 });
        const order = (await placeOrder(bob.token, [{ book: book._id, quantity: 4 }])).body.data;
        const setStatus = (status, token = admin.token) => api.put(`/orders/${order._id}/status`).set(auth(token)).send({ status });

        assert.equal((await setStatus('shipped', bob.token)).status, 403);
        assert.equal((await setStatus('lost')).status, 400);
        assert.equal((await setStatus('shipped')).status, 200);
        assert.equal((await api.put(`/orders/${order._id}/cancel`).set(auth(bob.token))).status, 409);
        assert.equal((await setStatus('cancelled')).status, 200);
        assert.equal(await stockOf(book._id), 5);
        assert.equal((await setStatus('pending')).status, 409);
    });
});
