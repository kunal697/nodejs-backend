const { readBooks, writeBooks } = require('../utilis/fileUtilis');
const { validateBook } = require('../utilis/validators');
const { v4: uuidv4 } = require('uuid');

const getBooks = async (req, res) => {
    try {
      const { page = 1, limit = 10, genre, author, title } = req.query;
      
      let books = await readBooks();
  
      // Filter by search parameters
      if (genre) {
        books = books.filter(book => 
          book.genre.toLowerCase().includes(genre.toLowerCase())
        );
      }
  
      if (author) {
        books = books.filter(book => 
          book.author.toLowerCase().includes(author.toLowerCase())
        );
      }
  
      if (title) {
        books = books.filter(book => 
          book.title.toLowerCase().includes(title.toLowerCase())
        );
      }
  
      // Pagination
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // Max 50 per page
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
  
      const paginatedBooks = books.slice(startIndex, endIndex);
      const totalBooks = books.length;
      const totalPages = Math.ceil(totalBooks / limitNum);
  
      res.json({
        success: true,
        data: paginatedBooks,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalBooks,
          booksPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        },
        filters: {
          genre: genre || null,
          author: author || null,
          title: title || null
        }
      });
  
    } catch (error) {
      console.error('Get books error:', error);
      res.status(500).json({
        error: 'Internal server error while fetching books'
      });
    }
  }


const searchBooks = async (req, res) => {
    try {
      const { genre, author, title, year } = req.query;
  
      if (!genre && !author && !title && !year) {
        return res.status(400).json({
          error: 'At least one search parameter is required (genre, author, title, or year)'
        });
      }
  
      let books = await readBooks();
  
      // Apply filters
      if (genre) {
        books = books.filter(book => 
          book.genre.toLowerCase().includes(genre.toLowerCase())
        );
      }
  
      if (author) {
        books = books.filter(book => 
          book.author.toLowerCase().includes(author.toLowerCase())
        );
      }
  
      if (title) {
        books = books.filter(book => 
          book.title.toLowerCase().includes(title.toLowerCase())
        );
      }
  
      if (year) {
        books = books.filter(book => book.publishedYear === parseInt(year));
      }
  
      res.json({
        success: true,
        data: books,
        count: books.length,
        searchCriteria: { genre, author, title, year }
      });
  
    } catch (error) {
      console.error('Search books error:', error);
      res.status(500).json({
        error: 'Internal server error during book search'
      });
    }
  }

const getBookById =  async (req, res) => {
    try {
      const { id } = req.params;
      const books = await readBooks();
      const book = books.find(book => book.id === id);
  
      if (!book) {
        return res.status(404).json({
          error: 'Book not found'
        });
      }
  
      res.json({
        success: true,
        data: book
      });
  
    } catch (error) {
      console.error('Get book by ID error:', error);
      res.status(500).json({
        error: 'Internal server error while fetching book'
      });
    }
  }

 const addBook =  async (req, res) => {
    try {
      const { title, author, genre, publishedYear } = req.body;
  
      // Validation
      const validation = validateBook({ title, author, genre, publishedYear });
      if (!validation.isValid) {
        return res.status(400).json({
          error: validation.errors.join(', ')
        });
      }
  
      const books = await readBooks();
  
      // Check for duplicate books by same author
      const existingBook = books.find(book => 
        book.title.toLowerCase() === title.toLowerCase() && 
        book.author.toLowerCase() === author.toLowerCase()
      );
  
      if (existingBook) {
        return res.status(409).json({
          error: 'A book with this title by this author already exists'
        });
      }
  
      // Create new book
      const newBook = {
        id: uuidv4(),
        title: title.trim(),
        author: author.trim(),
        genre: genre.trim(),
        publishedYear: parseInt(publishedYear),
        userId: req.user.userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
  
      books.push(newBook);
      await writeBooks(books);
  
      res.status(201).json({
        success: true,
        message: 'Book created successfully',
        data: newBook
      });
  
    } catch (error) {
      console.error('Add book error:', error);
      res.status(500).json({
        error: 'Internal server error while adding book'
      });
    }
  }


 const updateBook =   async (req, res) => {
    try {
      const { id } = req.params;
      const { title, author, genre, publishedYear } = req.body;
  
      // Validation
      const validation = validateBook({ title, author, genre, publishedYear });
      if (!validation.isValid) {
        return res.status(400).json({
          error: validation.errors.join(', ')
        });
      }
  
      const books = await readBooks();
      const bookIndex = books.findIndex(book => book.id === id);
  
      if (bookIndex === -1) {
        return res.status(404).json({
          error: 'Book not found'
        });
      }
  
      const book = books[bookIndex];
  
      // Check ownership
      if (book.userId !== req.user.userId) {
        return res.status(403).json({
          error: 'You can only update books that you added'
        });
      }
  
      // Check for duplicate (excluding current book)
      const duplicateBook = books.find(b => 
        b.id !== id &&
        b.title.toLowerCase() === title.toLowerCase() && 
        b.author.toLowerCase() === author.toLowerCase()
      );
  
      if (duplicateBook) {
        return res.status(409).json({
          error: 'A book with this title by this author already exists'
        });
      }
  
      // Update book
      books[bookIndex] = {
        ...book,
        title: title.trim(),
        author: author.trim(),
        genre: genre.trim(),
        publishedYear: parseInt(publishedYear),
        updatedAt: new Date().toISOString()
      };
  
      await writeBooks(books);
  
      res.json({
        success: true,
        message: 'Book updated successfully',
        data: books[bookIndex]
      });
  
    } catch (error) {
      console.error('Update book error:', error);
      res.status(500).json({
        error: 'Internal server error while updating book'
      });
    }
  }


 const deleteBook =  async (req, res) => {
    try {
      const { id } = req.params;
      const books = await readBooks();
      const bookIndex = books.findIndex(book => book.id === id);
  
      if (bookIndex === -1) {
        return res.status(404).json({
          error: 'Book not found'
        });
      }
  
      const book = books[bookIndex];
  
      // Check ownership
      if (book.userId !== req.user.userId) {
        return res.status(403).json({
          error: 'You can only delete books that you added'
        });
      }
  
      // Remove book
      const deletedBook = books.splice(bookIndex, 1)[0];
      await writeBooks(books);
  
      res.json({
        success: true,
        message: 'Book deleted successfully',
        data: deletedBook
      });
  
    } catch (error) {
      console.error('Delete book error:', error);
      res.status(500).json({
        error: 'Internal server error while deleting book'
      });
    }
  }

 const getUserBooks =  async (req, res) => {
        try {
          const books = await readBooks();
          const userBooks = books.filter(book => book.userId === req.user.userId);
      
          res.json({
            success: true,
            data: userBooks,
            count: userBooks.length
          });
      
        } catch (error) {
          console.error('Get user books error:', error);
          res.status(500).json({
            error: 'Internal server error while fetching user books'
          });
        }
}

module.exports = {
    getBooks,
    searchBooks,
    getBookById,
    addBook,
    updateBook,
    deleteBook,
    getUserBooks
}