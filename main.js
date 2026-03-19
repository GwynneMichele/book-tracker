const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

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

  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})