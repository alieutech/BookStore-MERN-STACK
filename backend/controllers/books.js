const Books = require('../models/Books');

// Fetch all Books
const getBooks = async (req, res) => {
    const books = await Books.find();
    if(!books) {
        return res.status(401).json({'message': 'No books are found' })
    }
    res.status(200).json({'success': 'All books are found', data: books})
   

};

// Create new Book
const createNewBook = async (req, res) => {
    const { title, author, publishYear, price, image } = req.body;
    if(!title || !author || !publishYear || !price || !image) {
        return res.status(401).json({'message': "title, author and year publish are required."})
    }
    try {
        const book = await Books.create({
            title: req.body.title,
            author: req.body.author,
            publishYear: req.body.publishYear,
            price: req.body.price,
            image: req.body.price
        })
        res.status(201).json(book);
    } catch (err){
       console.log(err.message);
    }
}

// UPdate Book by ID
const updateBooks = async (req, res) => {
    try {  
      if (!req.body.id) {
        return res.status(400).json({ message: 'Book ID is required.' });
      }
  
      const book = await Books.findById({ _id: req.body.id })
      if (!book) {
        return res.status(404).json({ message: `No book matches ID ${req.body.id}.` });
      }
      
      const result = await book.save();
  
      res.status(200).json({success: true, message: "Book updated successfully.", data: result,});
    } catch (err) {
      console.error("Error updating book:", err);
    }
  };
  
// Get Book by ID
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

// Delete Book by ID
const deleteBook = async (req, res) => {
    try {
        const { id } = req.params; 
        if (!id) {
            return res.status(400).json({ message: 'Book ID is required' });
        }
        const book = await Books.findById({_id: req.params.id});
        if (!book) {
            return res.status(404).json({ message: `No book matches ID ${req.params.id}` });
        }

        const result = await book.deleteOne(); 
        return res.status(200).json({
            success: true,
            message: `Book with ID ${req.params.id} deleted successfully`,
            data: result,
        });
    } catch (err) {
        console.error('Error deleting book:', err);
        return res.status(500).json({ success: false, message: 'Server error while deleting book' });
    }
};






module.exports = { getBooks, createNewBook, updateBooks, getBook, deleteBook }