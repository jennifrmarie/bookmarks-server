const express = require('express')
const uuid = require('uuid/v4')
const logger = require('../logger')
const { bookmark } = require('../store')

const bookmarksRouter = express.Router()
const bodyParser = express.json()

bookmarksRouter
  .route('/bookmarks')
  .get((req, res) => {
    res
    .json(bookmark)
  })
  .post(bodyParser, (req, res) => {
    const { title, description, rating } = req.body;
    if (!title) {
      logger.error('Title is required')
      return res
        .status(400)
        .send('Invalid data')
    }
    if (!description) {
      logger.error('Description is required')
      return res
        .status(400)
        .send('Invalid data')
    }
    if (!rating) {
      logger.error('Rating is required')
      return res
        .status(400)
        .send('Invalid data')
    }
  
    const id = uuid();
    const bookmarks = {
      id,
      title,
      description,
      rating
    }
    bookmark.push(bookmarks)
  
    logger.info(`Card with id ${id} created`)
  
    res
      .status(201)
      .location(`http://localhost:8000/card/${id}`)
      .json(bookmarks)
  })

bookmarksRouter
  .route('/bookmarks/:id')
  .get((req, res) => {
    const { id } = req.params;
    const bookmarks = bookmark.find(b => b.id == id)
  
    if (!bookmarks) {
      logger.error(`Bookmark with id ${id} not found`)
      return res
        .status(404)
        .send('Card not found')
    }
  
    res.json(bookmarks)
  })

  .delete((req, res) => {
    const { id } = req.params
    const bookmarkIndex = bookmark.findIndex(b => b.id == id)
  
    if (bookmarkIndex === -1) {
      logger.error(`Bookmark with id ${id} not found`)
      return res
        .status(404)
        .send('Not found')
    }
    bookmark.splice(bookmarkIndex, 1)
  
    logger.info(`Bookmark with id ${id} deleted`)
    res
      .status(204)
      .end()
  })

module.exports = bookmarksRouter
