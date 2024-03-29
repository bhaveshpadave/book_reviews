import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

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
        timestamp: `${new Date().getDate()}`,
        description: "This is a wider card with supporting text below as a natural lead-in to additional content.",
        ratings: 9,
        review: "This is a wider card with supporting text below as a natural lead-in to additional content. This is a wider card with supporting text below as a natural lead-in to additional content."
    },
    {
        genre: "Fictoional",
        isbn: '1442152656',
        title: "Sleeping beauty",
        timestamp: `${new Date().getDate()}`,
        description: "This is a wider card with supporting text below as a natural lead-in to additional content.",
        ratings: 2,
        review: "This is a wider card with supporting text below as a natural lead-in to additional content. This is a wider card with supporting text below as a natural lead-in to additional content."
    },
    {
        genre: "Non-Fiction",
        isbn: '038547257',
        title: "How earth was created",
        timestamp: `${new Date().getDate()}`,
        description: "This is a wider card with supporting text below as a natural lead-in to additional content.",
        ratings: 5,
        review: "This is a wider card with supporting text below as a natural lead-in to additional content. This is a wider card with supporting text below as a natural lead-in to additional content."
    }
];

app.get("/", (req, res) => {
    try {
        res.render("index.ejs", {
            mainTitle: "Welcome to Book review blog",
            bookInfo: bookReviews
        });
    } catch (error) {
        console.error(error);
    }
});

app.get("/new", (req, res) => {
    try {
        res.render("new.ejs", {
            mainTitle: "New Book review"
        });
    } catch (error) {
        console.error(error);
    }
})


app.post("/review", async (req, res) => {
    console.log(req.body);
    console.log(req.body.reviewId);
    res.render("review.ejs", {
        mainTitle: "Book review",
        genre: "Self-help",
        bookTitle: "Best book of millennial",
        timestamp: "Nov 12",
        bookDescription: "This is a wider card with supporting text below as a natural lead-in to additional content.",
        bookRatings: "9",
        bookReview: "It is self help book talks pretty much about how to live a life happily."
    });
    // res.redirect("/");
});


app.listen(`${PORT}`, (req, res) => {
    console.log(`Server is running on http://localhost:${PORT}`);
})