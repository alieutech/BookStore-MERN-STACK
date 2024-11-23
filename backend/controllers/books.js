const Books = require('../models/Books');


const getBooks = async (req, res) => {
    const books = await Books.find({});
    if(!books) {
        return res.status(401).json({'message': 'No books are found'})
    }
    res.status(200).json({'success': 'All books are found'})
   

};

const createNewBook = async (req, res) => {
    const { title, author, publishYear } = req.body;
    if(!title || !author || !publishYear) {
        return res.status(401).json({'message': "title, author and year publish are required."})
    }
    try {
        const book = await Books.create({
            title: req.body.title,
            author: req.body.author,
            publishYear: req.body.publishYear,
            price: req.body.price
        })
        res.status(201).json(book);
    } catch (err){
       console.log(err.message);
    }
}

const updateBooks = async (req, res) => {
    if(!req?.body?.id) {
        return res.status(400).json({'message': 'Books ID is required'})
    }
    const book = await Books.findOne({ _id: req.body.id }).exec()
    if(!book) {
     return res.status(204).json({"message": `No book matches ID ${req.body.id} `})
   }
   if(req.body?.title) book.title = req.body.title;
   if(req.body?.author) book.author = req.body.author;
   if(req.body?.publishYear) book.publishYear = req.body.publishYear;
   if(req.body?.price) book.price = req.body.price;
   
   const result = await book.save()
   res.json(result);
};

const getBook = async (req, res) => {
    if(!req?.params?.id) {
        return res.status(400).json({'message': 'Books ID is required'})
    }
    const book = await Books.findOne({ _id: req.params.id }).exec()
    if(!book) {
        return res.status(204).json({"message": `No book matches ID ${req.params.id}`})
    }
    res.json(book);

}


const deleteBook = async (req, res) => {
    if(!req?.body?.id) {
        return res.status(400).json({'message': 'Book ID is required'})
    }
    const book = await Books.findOne({ _id: req.body.id }).exec()
    if(!book) {
    return res.status(204).json({"message": `No book matches ID ${req.body.id}`})
   }
   const result = await book.deleteOne({ _id: req.body.id })
    res.json(result);

};




module.exports = { getBooks, createNewBook, updateBooks, getBook, deleteBook }