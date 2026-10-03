require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/config');
const Books = require('./models/Books');
const { checkJwtSecret } = require('./middleware/security');

const secretProblem = checkJwtSecret();
if (secretProblem) {
    console.error(secretProblem);
    process.exit(1);
}

const app = require('./app');
const PORT = process.env.PORT || 3333;

connectDB()
    .then(async () => {
        // Books created before stock tracking existed start with 0 copies until an admin sets their stock
        const { modifiedCount } = await Books.updateMany({ stock: { $exists: false } }, { $set: { stock: 0 } });
        if (modifiedCount > 0) console.log(`Set stock to 0 for ${modifiedCount} existing book(s); update their stock in the admin UI.`);

        const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

        // Hosts like Render stop the old server with SIGTERM on every deploy:
        // finish the requests in progress, close the database, then exit
        const shutDown = (signal) => {
            console.log(`${signal} received, shutting down`);
            server.close(async () => {
                await mongoose.disconnect();
                process.exit(0);
            });
            setTimeout(() => process.exit(1), 10000).unref(); // don't wait forever
        };
        process.on('SIGTERM', () => shutDown('SIGTERM'));
        process.on('SIGINT', () => shutDown('SIGINT'));
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB:', err.message);
        process.exit(1);
    });
