// NAVIGATION
const navButtons = document.querySelectorAll('.nav-btn')
const views = document.querySelectorAll('.view')

function navigateTo(viewName) {
  navButtons.forEach(b => b.classList.remove('active'))
  views.forEach(v => v.classList.remove('active'))
  document.getElementById(viewName).classList.add('active')

  const matchingBtn = document.querySelector(`[data-view="${viewName}"]`)
  if (matchingBtn) matchingBtn.classList.add('active')
}

navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    navigateTo(btn.dataset.view)
  })
})

// STATE
let currentBookId = null
let editingBookId = null

// API SEARCH
document.getElementById('btn-api-search').addEventListener('click', async () => {
  const query = document.getElementById('api-search-input').value.trim()
  if (!query) return

  const resultsDiv = document.getElementById('search-results')
  resultsDiv.innerHTML = '<p style="color: var(--text-muted)">Searching...</p>'

  const results = await window.api.books.search(query)

  if (!results || results.length === 0) {
    resultsDiv.innerHTML = '<p style="color: var(--text-muted)">No results found.</p>'
    return
  }

  resultsDiv.innerHTML = ''

  results.forEach(result => {
    const card = document.createElement('div')
    card.className = 'search-result-card'

    const coverHTML = result.cover_url
      ? `<img src="${result.cover_url}" alt="${result.title}">`
      : `<div class="no-cover">${result.title}</div>`

    card.innerHTML = `
      ${coverHTML}
      <div class="result-title">${result.title}</div>
      <div class="result-author">${result.author}</div>
    `

    card.addEventListener('click', () => {
      document.getElementById('input-title').value = result.title
      document.getElementById('input-author').value = result.author
      document.getElementById('input-cover-url').value = result.cover_url || ''
      resultsDiv.innerHTML = ''
      document.getElementById('api-search-input').value = ''
    })

    resultsDiv.appendChild(card)
  })
})

document.getElementById('api-search-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('btn-api-search').click()
})

// ADD / EDIT BOOK
document.getElementById('btn-add-book').addEventListener('click', async () => {
  const book = {
    title: document.getElementById('input-title').value,
    author: document.getElementById('input-author').value,
    cover_url: document.getElementById('input-cover-url').value || null,
    status: document.getElementById('input-status').value,
    format: document.getElementById('input-format').value,
    genre: document.getElementById('input-genre').value,
    tags: document.getElementById('input-tags').value,
    series_name: document.getElementById('input-series-name').value || null,
    series_order: document.getElementById('input-series-order').value || null,
    rating: document.getElementById('input-rating').value || null,
    date_finished: null,
    notes: document.getElementById('input-notes').value
  }

  if (!book.title || !book.author) {
    alert('Title and author are required.')
    return
  }

  if (editingBookId) {
    await window.api.books.update(editingBookId, book)
    const updatedBook = await window.api.books.get(editingBookId)
    editingBookId = null
    loadLibrary()
    showDetail(updatedBook)
  } else {
    await window.api.books.add(book)
    loadLibrary()
    navigateTo('library')
  }

  document.querySelectorAll('#add-book input, #add-book textarea').forEach(el => el.value = '')
  document.getElementById('input-status').value = 'want'
  document.getElementById('input-format').value = 'physical'
  document.getElementById('btn-add-book').textContent = 'Add Book'
  document.getElementById('add-book').querySelector('h2').textContent = 'Add a Book'
})

// LOAD LIBRARY
async function loadLibrary() {
  const books = await window.api.books.getAll()
  const grid = document.getElementById('book-grid')
  grid.innerHTML = ''

  if (books.length === 0) {
    grid.innerHTML = '<p style="color: var(--text-muted)">No books yet. Add one!</p>'
    return
  }

  books.forEach(book => {
    const card = document.createElement('div')
    card.className = 'book-card'
    card.innerHTML = `
      <img src="${book.cover_url || ''}" 
        onerror="this.style.display='none'"
        alt="${book.title}">
      <div class="book-title">${book.title}</div>
      <div class="book-author">${book.author}</div>
    `
    card.addEventListener('click', () => {
      showDetail(book)
    })
    grid.appendChild(card)
  })
}

// DETAIL VIEW
function showDetail(book) {
  currentBookId = book.id

  const coverHTML = book.cover_url
    ? `<img id="detail-cover" src="${book.cover_url}" alt="${book.title}">`
    : `<div id="detail-cover-placeholder">No Cover</div>`

  const seriesHTML = book.series_name
    ? `<span class="meta-badge">${book.series_name} #${book.series_order || '?'}</span>`
    : ''

  const tagsHTML = book.tags
    ? book.tags.split(',').map(t =>
        `<span class="meta-badge">${t.trim()}</span>`
      ).join('')
    : ''

  const starsHTML = book.rating
    ? '★'.repeat(book.rating) + '☆'.repeat(5 - book.rating)
    : 'Not rated'

  const notesHTML = book.notes
    ? marked.parse(book.notes)
    : '<p style="color: var(--text-muted)">No notes yet.</p>'

  document.getElementById('detail-content').innerHTML = `
    ${coverHTML}
    <div id="detail-meta">
      <h2>${book.title}</h2>
      <div class="author">${book.author}</div>
      <div class="meta-row">
        <span class="meta-badge accent">${book.status}</span>
        <span class="meta-badge">${book.format}</span>
        <span class="meta-badge">${starsHTML}</span>
      </div>
      <div class="meta-row">
        ${book.genre ? `<span class="meta-badge">${book.genre}</span>` : ''}
        ${tagsHTML}
      </div>
      <div class="meta-row">
        ${seriesHTML}
      </div>
      <div class="detail-actions">
        <button class="btn-primary" id="btn-edit">Edit Book</button>
        <button class="btn-danger" id="btn-delete">Delete Book</button>
      </div>
    </div>
    <div id="detail-notes">
      <h3>Notes</h3>
      <div id="detail-notes-content">${notesHTML}</div>
    </div>
  `

  document.getElementById('btn-edit').addEventListener('click', () => {
    populateEditForm(book)
  })

  document.getElementById('btn-delete').addEventListener('click', async () => {
    if (confirm(`Delete "${book.title}"? This cannot be undone.`)) {
      await window.api.books.delete(book.id)
      navigateTo('library')
      loadLibrary()
    }
  })

  navigateTo('detail')
}

// EDIT FORM
function populateEditForm(book) {
  editingBookId = book.id

  document.getElementById('input-title').value = book.title || ''
  document.getElementById('input-author').value = book.author || ''
  document.getElementById('input-cover-url').value = book.cover_url || ''
  document.getElementById('input-genre').value = book.genre || ''
  document.getElementById('input-tags').value = book.tags || ''
  document.getElementById('input-series-name').value = book.series_name || ''
  document.getElementById('input-series-order').value = book.series_order || ''
  document.getElementById('input-status').value = book.status || 'want'
  document.getElementById('input-format').value = book.format || 'physical'
  document.getElementById('input-rating').value = book.rating || ''
  document.getElementById('input-notes').value = book.notes || ''

  document.getElementById('btn-add-book').textContent = 'Save Changes'
  document.getElementById('add-book').querySelector('h2').textContent = 'Edit Book'

  navigateTo('add-book')
}

document.getElementById('btn-back').addEventListener('click', () => {
  navigateTo('library')
})

// INITIAL LOAD
loadLibrary()