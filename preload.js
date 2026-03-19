const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  books: {
    getAll: () => ipcRenderer.invoke('books:getAll'),
    add: (book) => ipcRenderer.invoke('books:add', book),
    update: (id, book) => ipcRenderer.invoke('books:update', id, book),
    delete: (id) => ipcRenderer.invoke('books:delete', id),
    get: (id) => ipcRenderer.invoke('books:get', id),
  }
})