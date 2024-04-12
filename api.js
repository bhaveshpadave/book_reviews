import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";
import bcrypt from "bcrypt";

env.config();

const db = new pg.Client({
    user: process.env.DB_USER || process.env.POSTGRES_USER,
    database: process.env.DB_NAME || process.env.POSTGRES_NAME,
    port: process.env.PORT,
    host: process.env.DB_HOST || process.env.POSTGRES_HOST,
    password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD
})

db.connect();

const app = express();
const PORT = 5000;
const API_URL = "https://covers.openlibrary.org/b/isbn/";

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const bookReviews = [
    {
        genre: "Self-help",
        isbn: '0385472579',
        title: "Best book of millennial",
        created_on: `${new Date().getDate()}`,
        description: "This is a wider card with supporting text below as a natural lead-in to additional content.",
        ratings: 9,
        note: "This is a wider card with supporting text below as a natural lead-in to additional content. This is a wider card with supporting text below as a natural lead-in to additional content."
    },
    {
        genre: "Fictoional",
        isbn: '1442152656',
        title: "Sleeping beauty",
        created_on: `${new Date().getDate()}`,
        description: "This is a wider card with supporting text below as a natural lead-in to additional content.",
        rating: 2,
        note: "This is a wider card with supporting text below as a natural lead-in to additional content. This is a wider card with supporting text below as a natural lead-in to additional content."
    },
    {
        genre: "Non-Fiction",
        isbn: '038547257',
        title: "How earth was created",
        created_on: `${new Date().getDate()}`,
        description: "This is a wider card with supporting text below as a natural lead-in to additional content.",
        rating: 5,
        note: "This is a wider card with supporting text below as a natural lead-in to additional content. This is a wider card with supporting text below as a natural lead-in to additional content."
    }
];

// Function to get a sorted data from db
async function getBookInfo(sort) {
    let data;
    if(sort){
        data = await db.query(
            `SELECT books.id, books.title, books.genre, books.description, books.isbn, reviews.note, reviews.rating, reviews.created_on FROM books JOIN reviews ON books.id = reviews.book_id ORDER BY ${sort} DESC;`
        );
        } else {
        data = await db.query(
            "SELECT books.id, books.title, books.genre, books.description, books.isbn, reviews.note, reviews.rating, reviews.created_on FROM books JOIN reviews ON books.id = reviews.book_id;"
        );
    }
    return data.rows;
}

// Function to get a filtered data from db
async function getUpdatedBookInfo(id) {
    const data = await db.query(
        "SELECT books.id, books.title, books.genre, books.description, books.isbn, reviews.note, reviews.rating, reviews.created_on FROM books JOIN reviews ON books.id = reviews.book_id WHERE books.id = $1;",
        [id]
    );
    return data.rows;
}

// Show all books
app.get("/books", async (req, res) => {
    const data = await getBookInfo();
    res.json(data);
});

// Sort all books by ratings or latest
app.get("/books/sort?", async (req, res) => {
    let sortBy = req.query.by;
    if(sortBy === "ratings"){
        const data = await getBookInfo('reviews.rating');
        res.json(data);       
    } else if (sortBy === "latest"){
        const data = await getBookInfo('reviews.created_on');
        res.json(data);    
    }
});

// Create new note for a book
// Get a form to create a note from index.js poniting to new.ejs

// Inserting values into database
app.post("/books/new", async (req, res) => {
    const result = req.body;
    const bookData = await db.query("SELECT * FROM books ORDER BY id ASC;");
    const booksArray = bookData.rows;
    let newBookId = parseInt(booksArray[booksArray.length-1].id)+1;
    console.log(bookData.rows);
    try {
        if(result.title){
            await db.query(
                "INSERT INTO books (title, description, genre, isbn) VALUES ($1, $2, $3, $4);",
                [result.title, result.description, result.genre, result.isbn]
            );
            await db.query(
                "INSERT INTO reviews (note, rating, created_on, book_id) VALUES ($1, $2, $3, $4);",
                [result.note, result.rating, new Date(), newBookId]
            );
            res.status(201).json(result);
        }else {
            res.status(201).json(result);
        }
    } catch (error) {
        console.error(error);
        res.status(404);     
    }
});

// Editing existing note and ratings with book information
app.get("/books/:id", async (req, res) => {
    const data = await getUpdatedBookInfo(req.params.id);
    res.json(data);
});

// Updating database with updated values
app.patch("/books/:id", async (req, res) => {
    let bookId = parseInt(req.params.id);
    let existingBookData = await getUpdatedBookInfo(bookId);
    console.log(existingBookData);
    console.log(req.body);
    existingBookData = {
        id: bookId || existingBookData[0].id,
        title: req.body.title || existingBookData[0].title,
        genre: req.body.genre || existingBookData[0].genre,
        description: req.body.description || existingBookData[0].description,
        isbn: req.body.isbn || existingBookData[0].isbn,
        note: req.body.note || existingBookData[0].note,
        rating: req.body.rating || existingBookData[0].rating,
        created_on: new Date() || existingBookData[0].created_on
    }
    console.log(existingBookData);
    try {
        await db.query(
            "UPDATE books SET genre=$1, title=$2, description=$3 WHERE id = $4;",
            [existingBookData.genre, existingBookData.title, existingBookData.description, bookId]
        );
        await db.query(
            "UPDATE reviews SET note=$1, rating=$2, created_on=$3 WHERE book_id = $4;",
            [existingBookData.note, existingBookData.rating, new Date(), bookId]
        );  
        const data = await getUpdatedBookInfo(bookId);
        res.json(existingBookData);
    } catch (error) {
        console.error(error);
        res.status(201).redirect("/");
    }
})

// Deleting existing book
app.delete("/books/:id", async (req, res) => {
    let bookId = parseInt(req.params.id);
    try {
        await db.query("DELETE FROM reviews WHERE book_id = $1", [bookId]);
        await db.query("DELETE FROM books WHERE id = $1", [bookId]);
        const data = await getBookInfo();
        res.json(data);
    } catch (error) {
        console.log(error);
        res.status(201).redirect("/");
    }
})

// Console log to check port on which server is running
app.listen(`${PORT}`, (req, res) => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
})