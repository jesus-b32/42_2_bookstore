require('@dotenvx/dotenvx').config();
process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");
const Book = require("../models/book");

let bookIsbn;

describe("book Routes Test", function () {

    beforeEach(async function () {
        await db.query("DELETE FROM books");
    
        const book = await Book.create({
            isbn: '0691161518',
            amazon_url: 'http://a.co/eobPtX2',
            author: 'Matthew Lane',
            language: 'english',
            pages: 264,
            publisher: 'Princeton University Press',
            title: 'Power-Up: Unlocking the Hidden Mathematics in Video Games',
            year: 2017
        });
        bookIsbn = book.isbn;
    });

    /** GET / => {books: [book, ...]}  */
    describe("GET /books/", function () {
        test(" Responds with a list of all the books", async function () {
            const response = await request(app).get("/books/");
            expect(response.statusCode).toEqual(200);
            expect(response.body).toEqual({
                "books": [
                    {
                        "isbn": "0691161518",
                        "amazon_url": "http://a.co/eobPtX2",
                        "author": "Matthew Lane",
                        "language": "english",
                        "pages": 264,
                        "publisher": "Princeton University Press",
                        "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
                        "year": 2017
                    }
                ]
            });
        });
    });

    /** GET /[id]  => {book: book} */
    describe("GET /books/:id", function () {
        test("Responds with a single book found by its isbn", async function () {
            const response = await request(app).get(`/books/${bookIsbn}`);
            expect(response.statusCode).toEqual(200);
            expect(response.body).toEqual({
                "book": {
                    "isbn": "0691161518",
                    "amazon_url": "http://a.co/eobPtX2",
                    "author": "Matthew Lane",
                    "language": "english",
                    "pages": 264,
                    "publisher": "Princeton University Press",
                    "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
                    "year": 2017
                    }
            });
        });
        test("Responds with a 404 error code when invalid isbn entered", async function () {
            const response = await request(app).get(`/books/:0`);
            expect(response.statusCode).toEqual(404);
        });
    });    

    /** POST /   bookData => {book: newBook}  */
    describe("POST /books", function() {
        test("Creates a book and responds with the newly created book", async function() {
            const response = await request(app)
                .post(`/books`)
                .send({
                    "isbn": "1338878921",
                    "amazon_url": "https://www.amazon.com/Harry-Potter-Sorcerers-Stone-Rowling/dp/059035342X",
                    "author": "J.K. Rowling",
                    "language": "english",
                    "pages": 309,
                    "publisher": "Scholastic",
                    "title": "Harry Potter and the Sorcerer's Stone",
                    "year": 1998
                });
            expect(response.statusCode).toEqual(201);
            expect(response.body).toEqual({
                "book": {
                    "isbn": "1338878921",
                    "amazon_url": "https://www.amazon.com/Harry-Potter-Sorcerers-Stone-Rowling/dp/059035342X",
                    "author": "J.K. Rowling",
                    "language": "english",
                    "pages": 309,
                    "publisher": "Scholastic",
                    "title": "Harry Potter and the Sorcerer's Stone",
                    "year": 1998
                }
            });
        });
        test("Prevents creating book without required title", async function () {
            const response = await request(app)
                .post(`/books`)
                .send({"isbn": '1338878921'});
            expect(response.statusCode).toBe(400);
        });
    });


    /** PUT /[isbn]   bookData => {book: updatedBook}  */
    describe("PUT /books/:isbn", function() {
        test("Updates a book and responds with the updated book", async function() {
            const response = await request(app)
                .put(`/books/${bookIsbn}`)
                .send({
                    "isbn": "0691161518",
                    "amazon_url": "https://www.amazon.com/Power-Up-Unlocking-Hidden-Mathematics-Video/dp/0691161518",
                    "author": "Matthew Lane",
                    "language": "english",
                    "pages": 264,
                    "publisher": "Princeton University Press",
                    "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
                    "year": 2024
                });
            expect(response.statusCode).toEqual(200);
            expect(response.body).toEqual({
                "book": {
                    "isbn": "0691161518",
                    "amazon_url": "https://www.amazon.com/Power-Up-Unlocking-Hidden-Mathematics-Video/dp/0691161518",
                    "author": "Matthew Lane",
                    "language": "english",
                    "pages": 264,
                    "publisher": "Princeton University Press",
                    "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
                    "year": 2024
                }
            });
        });

        test("Responds with a 404 error code when invalid isbn entered", async function() {
            const response = await request(app).put(`/companies/0`);
            expect(response.statusCode).toEqual(404);
        });
    });

    /** DELETE /[isbn]   => {message: "Book deleted"} */
    describe("DELETE /books/:isbn", function() {
        test("Deletes a book and responds with a message of “Book deleted”", async function() {
            const response = await request(app).delete(`/books/${bookIsbn}`);
            expect(response.statusCode).toEqual(200);
            expect(response.body).toEqual({
                "message": "Book deleted"
            });
        });

        test("Responds with a 404 error code when invalid isbn entered", async function() {
            const response = await request(app).delete(`/books/0`);
            expect(response.statusCode).toEqual(404);
        });
    });
});

afterAll(async function () {
    await db.end();
});