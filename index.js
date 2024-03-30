import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";

const db = new pg.Client({
    user: "postgres",
    database: "book_review",
    port: 5432,
    host: "localhost",
    password: "root"
})

db.connect();

const app = express();
const PORT = 3000;
const API_URL = "https://covers.openlibrary.org/b/isbn/";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

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
            "SELECT books.id, books.title, books.genre, books.description, books.isbn, reviews.note, reviews.rating, reviews.created_on FROM books JOIN reviews ON books.id = reviews.book_id ORDER BY $1 DESC;",
            [sort]
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
app.get("/", async (req, res) => {
    const data = await getBookInfo();
    try {
        res.render("index.ejs", {
            mainTitle: "Welcome to Book review blog",
            bookInfo: data
        });
    } catch (error) {
        console.error(error);
    }
});

// Sort all books
app.post("/ratings", async (req, res) => {
    const data = await getBookInfo('reviews.rating');
    try {
        res.render("index.ejs", {
            mainTitle: "Welcome to Book review blog",
            bookInfo: data
        });
    } catch (error) {
        console.error(error);
    }
});
app.post("/latest", async (req, res) => {
    const data = await getBookInfo('reviews.created_on');
    try {
        res.render("index.ejs", {
            mainTitle: "Welcome to Book review blog",
            bookInfo: data
        });
    } catch (error) {
        console.error(error);
    }
});

// Create new note for a book
// Get form to create a note
app.get("/new", async (req, res) => {
    try {
        res.render("new.ejs", {
            mainTitle: "New Book review",
        });
    } catch (error) {
        console.error(error);
    }
});

// Inserting values into database
app.post("/new", async (req, res) => {
    const result = req.body;
    const bookData = await getBookInfo();
    let newBookId = bookData[bookData.length-1].id+1;
    try {
        await db.query(
            "INSERT INTO books (title, description, genre, isbn) VALUES ($1, $2, $3, $4);",
            [result.title, result.description, result.genre, result.isbn]
        );
        await db.query(
            "INSERT INTO reviews (note, rating, book_id) VALUES ($1, $2, $3);",
            [result.note, result.rating, newBookId]
        );
        res.redirect("/");
    } catch (error) {
        console.error(error);
        res.status(201).redirect("/");     
    }
});

// Editing existing note and ratings with book information
app.post ("/review", async (req, res) => {
    const data = await getUpdatedBookInfo(req.body.noteId);
    res.render("review.ejs", {
        mainTitle: "Book review",
        book: data[0],
    });
});

// Updating database with updated values
app.post("/update", async (req, res) => {
    try {
        await db.query(
            "UPDATE books SET genre=$1, title=$2, description=$3 WHERE id = $4;",
            [req.body.genre, req.body.title, req.body.description, req.body.bookId]
        );
        await db.query(
            "UPDATE reviews SET note=$1, rating=$2, created_on=CURRENT_DATE WHERE book_id = $3;",
            [req.body.note, req.body.rating, req.body.bookId]
        );
        const data = await getUpdatedBookInfo(req.body.bookId);
        res.render("review.ejs", {
            mainTitle: "Book review",
            book: data[0]
        });
    } catch (error) {
        console.error(error);
        res.status(201).redirect("/");
    }
})

// Deleting existing book
app.delete("/delete", async (req, res) => {
    console.log(req.body);
    // try {
    //     await db.query("DELETE FROM reviews WHERE book_id = $1", [req.body.id]);
    //     res.redirect("/");
    // } catch (error) {
    //     console.log(error);
    //     res.status(201).redirect("/");
    // }
})


// Console log to check port on which server is running
app.listen(`${PORT}`, (req, res) => {
    console.log(`Server is running on http://localhost:${PORT}`);
})