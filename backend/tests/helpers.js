// Shared setup for the API tests. Each test file runs in its own process and database.
const os = require('os');
const path = require('path');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.ADMIN_EMAILS = 'admin@test.com';
process.env.AUTH_RATE_LIMIT = process.env.AUTH_RATE_LIMIT || '1000';
process.env.API_RATE_LIMIT = process.env.API_RATE_LIMIT || '100000';
process.env.UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(os.tmpdir(), `bookstore-test-uploads-${process.pid}`);

const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');

const api = request(app);
const BASE_URI = process.env.TEST_DATABASE_URI || 'mongodb://localhost:27017';

// Connect to a fresh database named after the test file
const connect = async (name) => {
    await mongoose.connect(`${BASE_URI}/bookstore-test-${name}`);
    await mongoose.connection.dropDatabase();
    // Recreate unique indexes (e.g. one account per email, one review per user per book)
    await Promise.all(mongoose.modelNames().map((model) => mongoose.model(model).syncIndexes()));
};

const disconnect = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
};

let userCount = 0;

// Register a user and return { token, user }. Use email admin@test.com for an admin.
const createUser = async ({ name = 'Test User', email, password = 'password123' } = {}) => {
    userCount += 1;
    const res = await api
        .post('/auth/register')
        .send({ name, email: email || `user${userCount}@test.com`, password });
    if (res.status !== 201) throw new Error(`register failed: ${res.status} ${JSON.stringify(res.body)}`);
    return res.body.data;
};

const auth = (token) => ({ Authorization: `Bearer ${token}` });

const createBook = async (adminToken, overrides = {}) => {
    const res = await api
        .post('/books')
        .set(auth(adminToken))
        .send({
            title: 'Clean Code',
            author: 'Robert Martin',
            publishYear: 2008,
            price: 12.5,
            image: 'https://example.com/clean-code.png',
            category: 'Programming',
            stock: 10,
            ...overrides,
        });
    if (res.status !== 201) throw new Error(`create book failed: ${res.status} ${JSON.stringify(res.body)}`);
    return res.body.data;
};

const ADDRESS = { fullName: 'Test User', phone: '+220 1234567', address: '1 Main St', city: 'Banjul', country: 'Gambia' };

const placeOrder = (token, items) => api.post('/orders').set(auth(token)).send({ items, shippingAddress: ADDRESS });

module.exports = { api, connect, disconnect, createUser, createBook, auth, placeOrder, ADDRESS };
