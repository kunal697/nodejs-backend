const fs = require('fs').promises;
const path = require('path');

// File paths
const DATA_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const BOOKS_FILE = path.join(DATA_DIR, 'books.json');

// Ensure data directory exists
const ensureDataDirectory = async () => {
  try {
    await fs.access(DATA_DIR);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(DATA_DIR, { recursive: true });
      console.log('Data directory created');
    } else {
      throw new Error(`Failed to ensure data directory: ${error.message}`);
    }
  }
};

// Initialize data files with empty arrays if they don't exist
const initializeDataFiles = async () => {
  await ensureDataDirectory();

  try {
    await fs.access(USERS_FILE);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(USERS_FILE, JSON.stringify([], null, 2));
      console.log('Users file initialized');
    }
  }

  try {
    await fs.access(BOOKS_FILE);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(BOOKS_FILE, JSON.stringify([], null, 2));
      console.log('Books file initialized');
    }
  }
};

// Read users from file
const readUsers = async () => {
  try {
    await initializeDataFiles();
    const data = await fs.readFile(USERS_FILE, 'utf8');
    const users = JSON.parse(data);
    return Array.isArray(users) ? users : [];
  } catch (error) {
    console.error('Error reading users file:', error);
    if (error.code === 'ENOENT') {
      return [];
    }
    throw new Error(`Failed to read users data: ${error.message}`);
  }
};

// Write users to file
const writeUsers = async (users) => {
  try {
    await ensureDataDirectory();

    if (!Array.isArray(users)) {
      throw new Error('Users data must be an array');
    }

    const jsonData = JSON.stringify(users, null, 2);
    await fs.writeFile(USERS_FILE, jsonData, 'utf8');
    console.log(`Users data saved (${users.length} users)`);
  } catch (error) {
    console.error('Error writing users file:', error);
    throw new Error(`Failed to save users data: ${error.message}`);
  }
};

// Read books from file
const readBooks = async () => {
  try {
    await initializeDataFiles();
    const data = await fs.readFile(BOOKS_FILE, 'utf8');
    const books = JSON.parse(data);
    return Array.isArray(books) ? books : [];
  } catch (error) {
    console.error('Error reading books file:', error);
    if (error.code === 'ENOENT') {
      return [];
    }
    throw new Error(`Failed to read books data: ${error.message}`);
  }
};

// Write books to file
const writeBooks = async (books) => {
  try {
    await ensureDataDirectory();

    if (!Array.isArray(books)) {
      throw new Error('Books data must be an array');
    }

    const jsonData = JSON.stringify(books, null, 2);
    await fs.writeFile(BOOKS_FILE, jsonData, 'utf8');
    console.log(`Books data saved (${books.length} books)`);
  } catch (error) {
    console.error('Error writing books file:', error);
    throw new Error(`Failed to save books data: ${error.message}`);
  }
};

// Backup data files
const backupData = async () => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(DATA_DIR, 'backups');

    await fs.mkdir(backupDir, { recursive: true });

    // Backup users
    try {
      const usersData = await fs.readFile(USERS_FILE, 'utf8');
      await fs.writeFile(
        path.join(backupDir, `users-${timestamp}.json`),
        usersData
      );
    } catch (error) {
      console.log('No users file to backup');
    }

    // Backup books
    try {
      const booksData = await fs.readFile(BOOKS_FILE, 'utf8');
      await fs.writeFile(
        path.join(backupDir, `books-${timestamp}.json`),
        booksData
      );
    } catch (error) {
      console.log('No books file to backup');
    }

    console.log(`Data backed up at ${timestamp}`);
  } catch (error) {
    console.error('Backup failed:', error);
  }
};

// Get data statistics
const getDataStats = async () => {
  try {
    const users = await readUsers();
    const books = await readBooks();

    return {
      users: {
        total: users.length,
        lastRegistered: users.length > 0 ? users[users.length - 1].createdAt : null
      },
      books: {
        total: books.length,
        byGenre: books.reduce((acc, book) => {
          acc[book.genre] = (acc[book.genre] || 0) + 1;
          return acc;
        }, {}),
        lastAdded: books.length > 0 ? books[books.length - 1].createdAt : null
      }
    };
  } catch (error) {
    console.error('Error getting data stats:', error);
    return null;
  }
};

module.exports = {
  readUsers,
  writeUsers,
  readBooks,
  writeBooks,
  backupData,
  getDataStats,
  initializeDataFiles
};
