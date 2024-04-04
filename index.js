import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const PORT = 3000;
const API_URL = "http://localhost:5000";

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Show all records from books API
app.get("/", async (req, res) => {
    const response = await axios.get(`${API_URL}/books`);
    try {
        res.render("index.ejs", {
            mainTitle: "Book review blog",
            bookInfo: response.data
        });
        console.log("log: Fetching all records");
    } catch (error) {
        console.error(error);
        console.log("error: Unable to fetch all records")
    }
});

// Sort records using books API
app.get("/sort?", async (req, res) => {
    const sortBy = req.query.by;
    const response = await axios.get(`${API_URL}/books/sort?by=${sortBy}`);
    try {
        res.render("index.ejs", {
            mainTitle: "Book review blog",
            bookInfo: response.data
        });
        console.log("log: Sorting all records");
    } catch (error) {
        console.error(error);
        console.log("error: Unable to sort all records");
    }
});

// Add new record to books API
app.get("/new", async (req, res) => {
    res.render("new.ejs", { mainTitle: "New Book review" });
});
app.post("/new", async (req, res) => {
    try {
        const response = await axios.post(`${API_URL}/books/new`, req.body);
        res.redirect("/");
        console.log(req.body);
        console.log(response.data);
        console.log(`log: New record added at ${response.data.id}`);
    } catch (error) {
        console.error(error);
        console.log("error: Unable to add new record");
    }
});

// Update exsting records in books API
app.get("/review/:id", async (req, res) => {
    const response = await axios.get(`${API_URL}/books/${req.params.id}`);
    res.render("review.ejs", {
        mainTitle: "Book review",
        book: response.data[0],
    });
});
app.post("/update/:id", async (req, res) => {
    console.log(req.body);
    let response = await axios.patch(`${API_URL}/books/${req.params.id}`, req.body);
    response = response.data;
    try {
        res.render("review.ejs", {
        mainTitle: "Book review",
        book: response
        });
    } catch (error) {
        console.error(error);
        console.log("error: Unable to update record");
    }
});

// Delete existing record in book API
app.get("/delete/:id", async (req, res) => {
    const response = await axios.delete(`${API_URL}/books/${req.params.id}`);
    console.log(response.data);
    res.redirect("/");
})


app.listen(`${PORT}`, (req, res) => {
    console.log(`Server running on https://localhost:${PORT}`);
})