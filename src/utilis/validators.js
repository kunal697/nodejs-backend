// Email validation
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Password validation
  const validatePassword = (password) => {
    return password && password.length >= 6;
  };
  
  // Book validation
  const validateBook = (book) => {
    const errors = [];
    
    if (!book.title || book.title.trim().length === 0) {
      errors.push('Title is required');
    } else if (book.title.trim().length > 200) {
      errors.push('Title must be less than 200 characters');
    }
    
    if (!book.author || book.author.trim().length === 0) {
      errors.push('Author is required');
    } else if (book.author.trim().length > 100) {
      errors.push('Author name must be less than 100 characters');
    }
    
    if (!book.genre || book.genre.trim().length === 0) {
      errors.push('Genre is required');
    } else if (book.genre.trim().length > 50) {
      errors.push('Genre must be less than 50 characters');
    }
    
    if (!book.publishedYear) {
      errors.push('Published year is required');
    } else {
      const year = parseInt(book.publishedYear);
      const currentYear = new Date().getFullYear();
      
      if (isNaN(year)) {
        errors.push('Published year must be a valid number');
      } else if (year < 1000 || year > currentYear) {
        errors.push(`Published year must be between 1000 and ${currentYear}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  
  // Sanitize input strings
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/[<>]/g, '');
  };
  
  // Validate pagination parameters
  const validatePagination = (page, limit) => {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    
    return {
      page: Math.max(1, pageNum),
      limit: Math.min(50, Math.max(1, limitNum)) // Max 50 per page
    };
  };
  
  // Validate search parameters
  const validateSearchParams = (params) => {
    const { genre, author, title, year } = params;
    const sanitized = {};
    
    if (genre) sanitized.genre = sanitizeString(genre);
    if (author) sanitized.author = sanitizeString(author);
    if (title) sanitized.title = sanitizeString(title);
    if (year) {
      const yearNum = parseInt(year);
      if (!isNaN(yearNum) && yearNum >= 1000 && yearNum <= new Date().getFullYear()) {
        sanitized.year = yearNum;
      }
    }
    
    return sanitized;
  };
  
  // Check if string contains potentially harmful content
  const containsHarmfulContent = (str) => {
    const harmfulPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi
    ];
    
    return harmfulPatterns.some(pattern => pattern.test(str));
  };
  
  module.exports = {
    validateEmail,
    validatePassword,
    validateBook,
    sanitizeString,
    validatePagination,
    validateSearchParams,
    containsHarmfulContent
  };