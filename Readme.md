
````
## Project Structure

bookstore-api/
├── src/
│   ├── middlewares/
│   │   ├── auth.js              # JWT authentication middleware
│   │   └── index.js             #(logging, error handling)
│   ├── routes/
│   │   ├── authRoutes.js        # Authentication endpoints
│   │   └── bookRoutes.js        # Book management endpoints
│   ├── utils/
│   │   ├── fileUtils.js         # File operations utilities
│   │   └── validators.js        # Input validation utilities
│   └── server.js                # Main server file
├── tests/
│   ├── auth.test.js             # Authentication tests
│  
├── data/                        # JSON data files (auto-created)
│   ├── users.json
│   ├── books.json
│   └── backups/
├── package.json
└── README.md
```
````

## Setup Instructions

1. Clone the repository:

```bash
git clone <repository-url>
cd bookstore-api
````

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file (optional):

```bash
JWT_SECRET=your-secret-key
PORT=3000
NODE_ENV=development
```

4. Start the server:

```bash
# Development mode
npm run dev

# Production mode
npm start
```

5. Run tests:

```bash
npm test
```

## API Documentation

### Base URL

```
http://localhost:3000/api
```

### Authentication

#### Register

**POST** `/api/auth/register`

```json
{
  "email": "kunal@gmail.com",
  "password": "password123",
  "name": "Kunal"
}
```

#### Login

**POST** `/api/auth/login`

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Profile

**GET** `/api/auth/profile`

Headers:

```
Authorization: Bearer <token>
```

---

### Book Endpoints

All book endpoints require authentication using a Bearer token.

#### Create Book

**POST** `/api/books`

```json
{
  "title": "Sample Book",
  "author": "Author Name",
  "genre": "Fiction",
  "publishedYear": 2023
}
```

#### Get All Books

**GET** `/api/books`

Query parameters:

* `page` (optional): page number (default: 1)
* `limit` (optional): number of items per page (default: 10)
* `genre`, `author` (optional): filters

Headers:

```
Authorization: Bearer <token>
```

#### Get Book by ID

**GET** `/api/books/:id`

#### Update Book

**PUT** `/api/books/:id`

```json
{
  "title": "Updated Book",
  "author": "Updated Author",
  "genre": "Updated Genre",
  "publishedYear": 2022
}
```

#### Delete Book

**DELETE** `/api/books/:id`

#### Search Books

**GET** `/api/books/search`

Query parameters (at least one required): `genre`, `author`, `title`, `year`

---

## How to Test API

You can test the API using Postman or cURL:

### Example with curl:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

### Example with Postman:

Import the following Postman collection:

**[Postman API Collection (postman-api.json)](./postman-api.json)**

This file contains all the endpoints and can be imported into Postman for testing.

---

```
```
