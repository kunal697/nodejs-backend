const express = require('express');
const {
    getBooks,
    searchBooks,
    getBookById,
    addBook,
    updateBook,
    deleteBook,
    getUserBooks    
} = require('../controllers/bookController');
const {authenticateToken} = require('../middlewares/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/',getBooks);

router.get('/search', searchBooks);

router.get('/:id',getBookById);

router.post('/', addBook);

router.put('/:id',updateBook);

router.delete('/:id',deleteBook);

router.get('/user/my-books',getUserBooks);

module.exports = router;