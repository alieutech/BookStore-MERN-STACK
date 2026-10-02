require('dotenv').config();
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

        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB:', err.message);
        process.exit(1);
    });
