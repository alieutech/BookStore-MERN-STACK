const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { api, connect, disconnect, createUser, createBook, auth } = require('./helpers');

// A tiny valid PNG
const crc32 = (buffer) => {
    let crc = ~0;
    for (const byte of buffer) {
        crc ^= byte;
        for (let k = 0; k < 8; k++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
    return ~crc >>> 0;
};
const chunk = (type, data) => {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body));
    return Buffer.concat([length, body, crc]);
};
const png = () => {
    const header = Buffer.alloc(13);
    header.writeUInt32BE(1, 0);
    header.writeUInt32BE(1, 4);
    header[8] = 8;
    header[9] = 2;
    return Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        chunk('IHDR', header),
        chunk('IDAT', zlib.deflateSync(Buffer.from([0, 255, 0, 0]))),
        chunk('IEND', Buffer.alloc(0)),
    ]);
};

describe('cover uploads', () => {
    let admin;
    let user;

    before(async () => {
        await connect('uploads');
        admin = await createUser({ email: 'admin@test.com' });
        user = await createUser();
    });
    after(async () => {
        await disconnect();
        fs.rmSync(process.env.UPLOAD_DIR, { recursive: true, force: true });
    });

    const upload = (token, buffer, filename, contentType) =>
        api.post('/uploads').set(auth(token)).attach('image', buffer, { filename, contentType });
    const fileFor = (url) => path.join(process.env.UPLOAD_DIR, path.basename(url));

    it('accepts real images from admins and serves them safely', async () => {
        assert.equal((await upload(user.token, png(), 'a.png', 'image/png')).status, 403);
        const res = await upload(admin.token, png(), 'cover.png', 'image/png');
        assert.equal(res.status, 201);
        assert.match(res.body.data.url, /^\/uploads\/[0-9a-f]{32}\.png$/);

        const served = await api.get(res.body.data.url);
        assert.equal(served.status, 200);
        assert.equal(served.headers['content-type'], 'image/png');
        assert.equal(served.headers['x-content-type-options'], 'nosniff');
    });

    it('rejects files that are not images, SVGs and large files', async () => {
        assert.equal((await upload(admin.token, Buffer.from('<script>alert(1)</script>'), 'fake.png', 'image/png')).status, 400);
        assert.equal((await upload(admin.token, Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'), 'x.svg', 'image/svg+xml')).status, 400);
        const big = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff]), Buffer.alloc(3 * 1024 * 1024)]);
        assert.equal((await upload(admin.token, big, 'big.jpg', 'image/jpeg')).status, 400);
    });

    it('removes old covers when they are replaced or the book is deleted', async () => {
        const first = (await upload(admin.token, png(), 'a.png', 'image/png')).body.data.url;
        const second = (await upload(admin.token, png(), 'b.png', 'image/png')).body.data.url;
        const book = await createBook(admin.token, { image: first });

        await api.put(`/books/${book._id}`).set(auth(admin.token)).send({ image: second });
        assert.equal(fs.existsSync(fileFor(first)), false);
        assert.equal(fs.existsSync(fileFor(second)), true);

        await api.delete(`/books/${book._id}`).set(auth(admin.token));
        assert.equal(fs.existsSync(fileFor(second)), false);
    });
});
