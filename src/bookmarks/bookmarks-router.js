const express = require('express')
const uuid = require('uuid/v4')
const logger = require('../logger')
const { bookmark } = require('../store')
const BookmarksService = require('./bookmarks-service')

const bookmarksRouter = express.Router()
const bodyParser = express.json()

const serializeBookmark = bookmark => ({
  
  id: bookmark.id,
  title: bookmark.title,
  url: bookmark.url,
  description: bookmark.description,
  rating: Number(bookmark.rating),
})



bookmarksRouter
  .route('/bookmarks')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    BookmarksService.getAllBookmarks(knexInstance)
      .then(bookmarks => {
        res.json(bookmarks.map(bookmark => ({
          id: bookmark.id,
          title: bookmark.title,
          url: bookmark.url,
          description: bookmark.description,
          rating: bookmark.rating
        })))
      })
      .catch(next)
  })
  .post(bodyParser, (req, res, next) => {
    console.log('A')
    const { title, description, url, rating } = req.body
    const newBookmark = { title, description, url, rating }
    BookmarksService.insertBookmark(
      
      req.app.get('db'),
      newBookmark
    )
      .then(bookmark => {
        console.log('B')
        res
          .status(201)
          .location(`/bookmarks/${bookmark.id}`)
          .json(serializeBookmark(bookmark))
      })
      .catch(next)
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
  .get((req, res, next) => {
    const { id } = req.params;
    const bookmarks = bookmark.find(b => b.id == id)
  
    if (!bookmarks) {
      logger.error(`Bookmark with id ${id} not found`)
      return res
        .status(404)
        .send('Bookmark not found')
    }
  
    res.json(bookmarks)
    .catch(next)
  })

  .delete((req, res, next) => {
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
