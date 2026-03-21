const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fetch = require('node-fetch')
const fs = require('fs')

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

  ipcMain.handle('export:json', async (event, data) => {
    const { filePath, canceled } = await dialog.showSaveDialog({
      title: 'Export Library',
      defaultPath: 'book-tracker-export.json',
      filters: [{ name: 'JSON', extensions: ['json'] }]
    })

    if (canceled || !filePath) return { success: false }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    return { success: true, filePath }
  })

  ipcMain.handle('export:csv', async (event, data) => {
    const { filePath, canceled } = await dialog.showSaveDialog({
      title: 'Export Library as CSV',
      defaultPath: 'book-tracker-export.csv',
      filters: [{ name: 'CSV', extensions: ['csv'] }]
    })

    if (canceled || !filePath) return { success: false }

    const headers = [
      'title', 'author', 'status', 'format', 'genre', 'tags',
      'series_name', 'series_order', 'rating', 'date_started',
      'date_finished', 'current_page', 'total_pages', 'date_added', 'notes'
    ]

    const rows = data.map(book =>
      headers.map(h => {
        const val = book[h] || ''
        return `"${String(val).replace(/"/g, '""')}"`
      }).join(',')
    )

    const csv = [headers.join(','), ...rows].join('\n')
    fs.writeFileSync(filePath, csv)
    return { success: true, filePath }
  })

  ipcMain.handle('import:json', async () => {
    const { filePaths, canceled } = await dialog.showOpenDialog({
      title: 'Import Library',
      filters: [{ name: 'JSON', extensions: ['json'] }],
      properties: ['openFile']
    })

    if (canceled || !filePaths.length) return { success: false }

    const raw = fs.readFileSync(filePaths[0], 'utf-8')
    const books = JSON.parse(raw)
    return { success: true, books }
  })

  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})