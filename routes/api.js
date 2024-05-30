'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define book schema
const bookSchema = new Schema({
  title: { type: String, required: true },
  comments: [{ type: String }],
  commentcount: { type: Number, default: 0 } // Add commentcount property
});

// Create Book model without specifying the collection name
const Book = mongoose.model('Book', bookSchema);

module.exports = function (app) {
  // POST route to add a book
  app.post('/api/books', async function (req, res) {
    const { title } = req.body;
    if (!title) {
      return res.send('missing required field title');
    }
    try {
      const newBook = new Book({ title });
      const savedBook = await newBook.save();
      res.json({ title: savedBook.title, _id: savedBook._id });
    } catch (error) {
      res.status(500).send('Error adding book');
    }
  });

  // GET route to retrieve all books
  app.get('/api/books', async function (req, res) {
    try {
      const books = await Book.find({}, '_id title commentcount').exec();
      res.json(books);
    } catch (error) {
      res.status(500).send('Error fetching books');
    }
  });

  // GET route to retrieve a single book by ID
  app.get('/api/books/:_id', async function (req, res) {
    const { _id } = req.params;
    try {
      const book = await Book.findById(_id).exec();
      if (!book) {
        return res.send('no book exists');
      }
      res.json(book);
    } catch (error) {
      res.status(500).send('Error fetching book');
    }
  });

  // POST route to add a comment to a book
  app.post('/api/books/:_id', async function (req, res) {
    const { _id } = req.params;
    const { comment } = req.body;
    if (!comment) {
      return res.send('missing required field comment');
    }
    try {
      const book = await Book.findById(_id).exec();
      if (!book) {
        return res.send('no book exists');
      }
      const updatedBook = await Book.findByIdAndUpdate(
        _id,
        { $push: { comments: comment }, $inc: { commentcount: 1 } }, // Increment commentcount
        { new: true }
      ).exec();
      res.json(updatedBook);
    } catch (error) {
      res.status(500).send('Error adding comment');
    }
  });

  // DELETE route to delete a book by ID
  app.delete('/api/books/:_id', async function (req, res) {
    const { _id } = req.params;
    try {
      const book = await Book.findById(_id).exec();
      if (!book) {
        return res.send('no book exists');
      }
      const deletedBook = await Book.findByIdAndDelete(_id).exec();
      res.send('delete successful');
    } catch (error) {
      res.status(500).send('Error deleting book');
    }
  });

  // DELETE route to delete all books
  app.delete('/api/books', async function (req, res) {
    try {
      await Book.deleteMany({}).exec();
      res.send('complete delete successful');
    } catch (error) {
      res.status(500).send('Error deleting books');
    }
  });
};
