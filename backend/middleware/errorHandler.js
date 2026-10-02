const errorHandler = (err, req, res, next) => {
    console.error(`${err.name}: ${err.message}`);

    // Mongoose schema validation / bad casts are client errors
    if (err.name === 'ValidationError' || err.name === 'CastError') {
        return res.status(400).json({ success: false, message: err.message });
    }

    res.status(err.status || 500).json({ success: false, message: 'Something went wrong on the server.' });
};

module.exports = errorHandler;
