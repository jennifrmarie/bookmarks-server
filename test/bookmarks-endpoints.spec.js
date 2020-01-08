const knex = require('knex')
const app = require('../src/app')
const store = require('../src/store')
const fixtures = require('./bookmarks-fixtures')

describe('Bookmarks Endpoints', () => {
    let bookmarksTest, db

    before('knex instance', () => {
			db = knex({
				client: 'pg',
				connection: process.env.TEST_DB_URL,
			})
			app.set('db', db)
    })


    after('disconnect from db', () => db.destroy())

    before('cleanup', () => db('bookmarks').truncate())

    afterEach('cleanup', () => db('bookmarks').truncate())

    describe('GET /bookmarks', () => {
			context('Given no bookmarks', () => {
					it('responds with 200 and an empty list', () => {
							return supertest(app)
								.get('/bookmarks')
								.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
								.expect(200, [])
            })
        })

			context('given there are bookmarks in the database', () => {
				const testBookmarks = fixtures.makeBookmarksArray()

					beforeEach('insert bookmarks', () => {
						return db
							.into('bookmarks')
							.insert(testBookmarks)
					})

					it('gets bookmarks from the store', () => {
						return supertest(app)
							.get('/bookmarks')
							.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
							.expect(200, testBookmarks)
					})
			})
		})
	
		describe('POST /bookmarks', () => {
			it(`responds with 400 missing 'title' if not supplied`, () => {
				const newBookmarkMissingTitle = {
					// title: 'test-title',
					url: 'https://test.com',
					rating: 1,
				}
				return supertest(app)
					.post(`/bookmarks`)
					.send(newBookmarkMissingTitle)
					.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
					.expect(400, {
						error: { message: `'title' is required` }
					})
			})
	
			it(`responds with 400 missing 'url' if not supplied`, () => {
				const newBookmarkMissingUrl = {
					title: 'test-title',
					// url: 'https://test.com',
					rating: 1,
				}
				return supertest(app)
					.post(`/bookmarks`)
					.send(newBookmarkMissingUrl)
					.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
					.expect(400, {
						error: { message: `'url' is required` }
					})
			})
	
			it(`responds with 400 missing 'rating' if not supplied`, () => {
				const newBookmarkMissingRating = {
					title: 'test-title',
					url: 'https://test.com',
					// rating: 1,
				}
				return supertest(app)
					.post(`/bookmarks`)
					.send(newBookmarkMissingRating)
					.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
					.expect(400, {
						error: { message: `'rating' is required` }
					})
			})
	
			it(`responds with 400 invalid 'rating' if not between 0 and 5`, () => {
				const newBookmarkInvalidRating = {
					title: 'test-title',
					url: 'https://test.com',
					rating: 'invalid',
				}
				return supertest(app)
					.post(`/bookmarks`)
					.send(newBookmarkInvalidRating)
					.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
					.expect(400, {
						error: { message: `'rating' must be a number between 0 and 5` }
					})
			})
	
			it(`responds with 400 invalid 'url' if not a valid URL`, () => {
				const newBookmarkInvalidUrl = {
					title: 'test-title',
					url: 'htp://invalid-url',
					rating: 1,
				}
				return supertest(app)
					.post(`/bookmarks`)
					.send(newBookmarkInvalidUrl)
					.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
					.expect(400, {
						error: { message: `'url' must be a valid URL` }
					})
			})
	
			it('adds a new bookmark to the store', () => {
				const newBookmark = {
					title: 'test-title',
					url: 'https://test.com',
					description: 'test description',
					rating: 1,
				}
				return supertest(app)
					.post(`/bookmarks`)
					.send(newBookmark)
					.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
					.expect(201)
					.expect(res => {
						expect(res.body.title).to.eql(newBookmark.title)
						expect(res.body.url).to.eql(newBookmark.url)
						expect(res.body.description).to.eql(newBookmark.description)
						expect(res.body.rating).to.eql(newBookmark.rating)
						expect(res.body).to.have.property('id')
						expect(res.headers.location).to.eql(`/bookmarks/${res.body.id}`)
					})
					.then(res =>
						supertest(app)
							.get(`/bookmarks/${res.body.id}`)
							.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
							.expect(res.body)
					)
			})
		})
})





