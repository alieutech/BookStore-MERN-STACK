const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { api, connect, disconnect, createUser, createBook, auth, placeOrder } = require('./helpers');

describe('sales report', () => {
    let admin;
    let bob;

    before(async () => {
        await connect('reports');
        admin = await createUser({ email: 'admin@test.com' });
        bob = await createUser();
        const dune = await createBook(admin.token, { title: 'Dune', price: 10, stock: 3 });
        const code = await createBook(admin.token, { title: 'Clean Code', price: 20, stock: 50 });
        await placeOrder(bob.token, [{ book: dune._id, quantity: 2 }]);
        await placeOrder(bob.token, [{ book: code._id, quantity: 1 }]);
        const cancelled = (await placeOrder(bob.token, [{ book: code._id, quantity: 5 }])).body.data;
        await api.put(`/orders/${cancelled._id}/cancel`).set(auth(bob.token));
    });
    after(disconnect);

    it('is admin-only', async () => {
        assert.equal((await api.get('/reports/sales')).status, 401);
        assert.equal((await api.get('/reports/sales').set(auth(bob.token))).status, 403);
    });

    it('counts sales without cancelled orders', async () => {
        const { data } = (await api.get('/reports/sales').set(auth(admin.token))).body;
        assert.deepEqual(data.totals, { revenue: 40, orders: 2, itemsSold: 3, averageOrderValue: 20, customers: 1 });
        assert.deepEqual(data.ordersByStatus, { pending: 2, cancelled: 1 });
        assert.equal(data.salesByDay.length, 30);
        assert.equal(data.salesByDay.at(-1).revenue, 40);
        assert.deepEqual(data.topBooks.map((book) => [book.title, book.quantity, book.revenue]), [
            ['Dune', 2, 20],
            ['Clean Code', 1, 20],
        ]);
        assert.deepEqual(data.lowStock.map((book) => [book.title, book.stock]), [['Dune', 1]]);
    });
});
