const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fetch = require('node-fetch')

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('renderer/index.html')
}

app.whenReady().then(() => {
  const db = require('./database/db')

  ipcMain.handle('books:getAll', () => {
    return db.getAllBooks()
  })

  ipcMain.handle('books:add', (event, book) => {
    return db.addBook(book)
  })

  ipcMain.handle('books:update', (event, id, book) => {
    return db.updateBook(id, book)
  })

  ipcMain.handle('books:delete', (event, id) => {
    return db.deleteBook(id)
  })

  ipcMain.handle('books:get', (event, id) => {
    return db.getBook(id)
  })

  ipcMain.handle('books:search', async (event, query) => {
    const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(query)}&limit=8`
    const response = await fetch(url)
    const data = await response.json()

    return data.docs.map(book => ({
      title: book.title,
      author: book.author_name ? book.author_name[0] : 'Unknown',
      year: book.first_publish_year || null,
      cover_url: book.cover_i
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
        : null,
      olid: book.key
    }))
  })

  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})