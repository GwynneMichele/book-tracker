const Database = require('better-sqlite3')
const path = require('path')
const { app } = require('electron')

const dbPath = path.join(app.getPath('userData'), 'books.db')
const db = new Database(dbPath)

db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    cover_url TEXT,
    status TEXT DEFAULT 'want',
    format TEXT DEFAULT 'physical',
    genre TEXT,
    tags TEXT,
    series_name TEXT,
    series_order INTEGER,
    rating INTEGER,
    date_finished TEXT,
    notes TEXT,
    date_added TEXT DEFAULT (date('now'))
  )
`)

// Add new columns if they don't exist yet
const columns = db.prepare("PRAGMA table_info(books)").all().map(c => c.name)

if (!columns.includes('date_started')) {
  db.exec("ALTER TABLE books ADD COLUMN date_started TEXT")
}
if (!columns.includes('current_page')) {
  db.exec("ALTER TABLE books ADD COLUMN current_page INTEGER")
}
if (!columns.includes('total_pages')) {
  db.exec("ALTER TABLE books ADD COLUMN total_pages INTEGER")
}

module.exports = {
  addBook: (book) => {
    const stmt = db.prepare(`
      INSERT INTO books (title, author, cover_url, status, format, genre, tags,
        series_name, series_order, rating, date_started, date_finished,
        current_page, total_pages, notes)
      VALUES (@title, @author, @cover_url, @status, @format, @genre, @tags,
        @series_name, @series_order, @rating, @date_started, @date_finished,
        @current_page, @total_pages, @notes)
    `)
    return stmt.run(book)
  },

  getAllBooks: () => {
    return db.prepare('SELECT * FROM books ORDER BY date_added DESC').all()
  },

  updateBook: (id, book) => {
    const stmt = db.prepare(`
      UPDATE books SET
        title = @title,
        author = @author,
        cover_url = @cover_url,
        status = @status,
        format = @format,
        genre = @genre,
        tags = @tags,
        series_name = @series_name,
        series_order = @series_order,
        rating = @rating,
        date_started = @date_started,
        date_finished = @date_finished,
        current_page = @current_page,
        total_pages = @total_pages,
        notes = @notes
      WHERE id = @id
    `)
    return stmt.run({ ...book, id })
  },

  deleteBook: (id) => {
    return db.prepare('DELETE FROM books WHERE id = ?').run(id)
  },

  getBook: (id) => {
    return db.prepare('SELECT * FROM books WHERE id = ?').get(id)
  }
}