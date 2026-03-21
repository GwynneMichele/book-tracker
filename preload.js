const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  books: {
    getAll: () => ipcRenderer.invoke('books:getAll'),
    add: (book) => ipcRenderer.invoke('books:add', book),
    update: (id, book) => ipcRenderer.invoke('books:update', id, book),
    delete: (id) => ipcRenderer.invoke('books:delete', id),
    get: (id) => ipcRenderer.invoke('books:get', id),
    search: (query) => ipcRenderer.invoke('books:search', query),
  },
  io: {
    exportJson: (data) => ipcRenderer.invoke('export:json', data),
    exportCsv: (data) => ipcRenderer.invoke('export:csv', data),
    importJson: () => ipcRenderer.invoke('import:json')
  }
})