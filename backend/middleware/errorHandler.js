
const errorHandler = ((err, req, res, next) => {
   console.log(err.message);
   res.status(404).send('Sorry something when wrong');
});

module.exports = errorHandler;


// const errorHandler = (err, req, res, next) => {
//     (`${err.name}: ${err.message}`, 'errLog.txt');
//     console.error(err.stack)
//     res.status(500).send(err.message);
// }