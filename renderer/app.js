// NAVIGATION
const navButtons = document.querySelectorAll('.nav-btn')
const views = document.querySelectorAll('.view')

function navigateTo(viewName) {
  navButtons.forEach(b => b.classList.remove('active'))
  views.forEach(v => v.classList.remove('active'))
  document.getElementById(viewName).classList.add('active')

  const matchingBtn = document.querySelector(`[data-view="${viewName}"]`)
  if (matchingBtn) matchingBtn.classList.add('active')

  if (viewName === 'stats') renderStats()
}

navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    navigateTo(btn.dataset.view)
  })
})

// STATE
let currentBookId = null
let currentBook = null
let editingBookId = null
let allBooks = []

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
    date_started: document.getElementById('input-date-started').value || null,
    date_finished: document.getElementById('input-date-finished').value || null,
    current_page: document.getElementById('input-current-page').value || null,
    total_pages: document.getElementById('input-total-pages').value || null,
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

// LIBRARY
async function loadLibrary() {
  allBooks = await window.api.books.getAll()
  applyFiltersAndSearch()
}

function applyFiltersAndSearch() {
  const query = document.getElementById('library-search').value.toLowerCase().trim()
  const statusFilter = document.getElementById('filter-status').value
  const formatFilter = document.getElementById('filter-format').value
  const genreFilter = document.getElementById('filter-genre').value.toLowerCase().trim()
  const tagsFilter = document.getElementById('filter-tags').value.toLowerCase().trim()
  const ratingFilter = document.getElementById('filter-rating').value
  const sortValue = document.getElementById('sort-select').value

  let filtered = allBooks

  if (query) {
    filtered = filtered.filter(b =>
      b.title.toLowerCase().includes(query) ||
      b.author.toLowerCase().includes(query)
    )
  }

  if (statusFilter) {
    filtered = filtered.filter(b => b.status === statusFilter)
  }

  if (formatFilter) {
    filtered = filtered.filter(b => b.format === formatFilter)
  }

  if (genreFilter) {
    filtered = filtered.filter(b =>
      b.genre && b.genre.toLowerCase().includes(genreFilter)
    )
  }

  if (tagsFilter) {
    filtered = filtered.filter(b =>
      b.tags && b.tags.toLowerCase().includes(tagsFilter)
    )
  }

  if (ratingFilter) {
    filtered = filtered.filter(b => b.rating >= parseInt(ratingFilter))
  }

  filtered.sort((a, b) => {
    switch (sortValue) {
      case 'date_added_asc':
        return (a.date_added || '').localeCompare(b.date_added || '')
      case 'title_asc':
        return a.title.localeCompare(b.title)
      case 'author_asc':
        return a.author.localeCompare(b.author)
      case 'rating_desc':
        return (b.rating || 0) - (a.rating || 0)
      case 'date_added_desc':
      default:
        return (b.date_added || '').localeCompare(a.date_added || '')
    }
  })

  renderLibrary(filtered)
}

function renderLibrary(books) {
  const grid = document.getElementById('book-grid')
  grid.innerHTML = ''

  if (books.length === 0) {
    grid.innerHTML = '<p style="color: var(--text-muted)">No books match your search.</p>'
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

// FILTER CONTROLS
document.getElementById('library-search').addEventListener('input', () => {
  applyFiltersAndSearch()
})

document.getElementById('sort-select').addEventListener('change', () => {
  applyFiltersAndSearch()
})

document.getElementById('btn-apply-filters').addEventListener('click', () => {
  navigateTo('library')
  applyFiltersAndSearch()
})

document.getElementById('btn-clear-filters').addEventListener('click', () => {
  document.getElementById('filter-status').value = ''
  document.getElementById('filter-format').value = ''
  document.getElementById('filter-genre').value = ''
  document.getElementById('filter-tags').value = ''
  document.getElementById('filter-rating').value = ''
  document.getElementById('library-search').value = ''
  navigateTo('library')
  applyFiltersAndSearch()
})

// DETAIL VIEW
function showDetail(book) {
  currentBookId = book.id
  currentBook = book

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
        ${book.date_started ? `<span class="meta-badge">Started: ${book.date_started}</span>` : ''}
        ${book.date_finished ? `<span class="meta-badge">Finished: ${book.date_finished}</span>` : ''}
      </div>
      <div class="meta-row">
        ${book.genre ? `<span class="meta-badge">${book.genre}</span>` : ''}
        ${tagsHTML}
      </div>
      <div class="meta-row">
        ${seriesHTML}
      </div>
      ${book.status === 'reading' && book.current_page ? `
        <div class="progress-container">
          <div class="progress-bar" style="width: ${book.total_pages ? Math.round((book.current_page / book.total_pages) * 100) : 0}%"></div>
        </div>
        <div style="font-size: 0.8rem; color: var(--text-muted)">
          Page ${book.current_page}${book.total_pages ? ` of ${book.total_pages} (${Math.round((book.current_page / book.total_pages) * 100)}%)` : ''}
        </div>
      ` : ''}
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
  document.getElementById('input-date-started').value = book.date_started || ''
  document.getElementById('input-date-finished').value = book.date_finished || ''
  document.getElementById('input-current-page').value = book.current_page || ''
  document.getElementById('input-total-pages').value = book.total_pages || ''
  document.getElementById('input-notes').value = book.notes || ''

  document.getElementById('btn-add-book').textContent = 'Save Changes'
  document.getElementById('add-book').querySelector('h2').textContent = 'Edit Book'

  navigateTo('add-book')
}

document.getElementById('btn-back').addEventListener('click', () => {
  navigateTo('library')
})

// STATS
function renderStats() {
  const total = allBooks.length
  const finished = allBooks.filter(b => b.status === 'finished').length
  const reading = allBooks.filter(b => b.status === 'reading').length
  const want = allBooks.filter(b => b.status === 'want').length

  const physical = allBooks.filter(b => b.format === 'physical').length
  const digital = allBooks.filter(b => b.format === 'digital').length
  const both = allBooks.filter(b => b.format === 'both').length

  const thisYear = new Date().getFullYear().toString()
  const finishedThisYear = allBooks.filter(b =>
    b.status === 'finished' && b.date_finished && b.date_finished.startsWith(thisYear)
  ).length

  const totalPages = allBooks
    .filter(b => b.status === 'finished' && b.total_pages)
    .reduce((sum, b) => sum + parseInt(b.total_pages), 0)

  const ratedBooks = allBooks.filter(b => b.rating)
  const avgRating = ratedBooks.length
    ? (ratedBooks.reduce((sum, b) => sum + parseInt(b.rating), 0) / ratedBooks.length).toFixed(1)
    : 'N/A'

  const genreCounts = {}
  allBooks.forEach(b => {
    if (b.genre) {
      const g = b.genre.trim()
      genreCounts[g] = (genreCounts[g] || 0) + 1
    }
  })
  const topGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const tagCounts = {}
  allBooks.forEach(b => {
    if (b.tags) {
      b.tags.split(',').forEach(t => {
        const tag = t.trim()
        if (tag) tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    }
  })
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  document.getElementById('stats-content').innerHTML = `
    <div class="stats-card">
      <h3>Library Overview</h3>
      <div style="text-align: center; padding: 8px 0 16px;">
        <div class="big-number">${total}</div>
        <div class="big-number-label">Total Books</div>
      </div>
      <div class="stat-row">
        <span class="stat-label">Finished</span>
        <span class="stat-value accent">${finished}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Currently Reading</span>
        <span class="stat-value">${reading}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Want to Read</span>
        <span class="stat-value">${want}</span>
      </div>
    </div>

    <div class="stats-card">
      <h3>Reading Activity</h3>
      <div class="stat-row">
        <span class="stat-label">Finished This Year</span>
        <span class="stat-value accent">${finishedThisYear}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Total Pages Read</span>
        <span class="stat-value">${totalPages.toLocaleString()}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Average Rating</span>
        <span class="stat-value">${avgRating} ${avgRating !== 'N/A' ? '★' : ''}</span>
      </div>
    </div>

    <div class="stats-card">
      <h3>Format Breakdown</h3>
      <div class="stat-row">
        <span class="stat-label">Physical</span>
        <span class="stat-value">${physical}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Digital</span>
        <span class="stat-value">${digital}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Both</span>
        <span class="stat-value">${both}</span>
      </div>
    </div>

    <div class="stats-card">
      <h3>Top Genres</h3>
      ${topGenres.length ? topGenres.map(([genre, count]) => `
        <div class="stat-row">
          <span class="stat-label">${genre}</span>
          <span class="stat-value">${count}</span>
        </div>
      `).join('') : '<p style="color: var(--text-muted); font-size: 0.9rem;">No genres recorded yet.</p>'}
    </div>

    <div class="stats-card">
      <h3>Top Tags</h3>
      ${topTags.length ? `
        <div class="tag-cloud">
          ${topTags.map(([tag, count]) => `
            <span class="meta-badge">${tag} (${count})</span>
          `).join('')}
        </div>
      ` : '<p style="color: var(--text-muted); font-size: 0.9rem;">No tags recorded yet.</p>'}
    </div>
  `
}

// IMPORT / EXPORT
document.getElementById('btn-export-json').addEventListener('click', async () => {
  const status = document.getElementById('export-status')
  const result = await window.api.io.exportJson(allBooks)
  if (result.success) {
    status.textContent = `Exported successfully to ${result.filePath}`
    status.style.color = 'var(--accent)'
  } else {
    status.textContent = 'Export cancelled.'
    status.style.color = 'var(--text-muted)'
  }
})

document.getElementById('btn-export-csv').addEventListener('click', async () => {
  const status = document.getElementById('export-status')
  const result = await window.api.io.exportCsv(allBooks)
  if (result.success) {
    status.textContent = `Exported successfully to ${result.filePath}`
    status.style.color = 'var(--accent)'
  } else {
    status.textContent = 'Export cancelled.'
    status.style.color = 'var(--text-muted)'
  }
})

document.getElementById('btn-import-json').addEventListener('click', async () => {
  const status = document.getElementById('import-status')
  const result = await window.api.io.importJson()

  if (!result.success) {
    status.textContent = 'Import cancelled.'
    status.style.color = 'var(--text-muted)'
    return
  }

  const books = result.books
  let imported = 0
  let skipped = 0

  for (const book of books) {
    if (!book.title || !book.author) {
      skipped++
      continue
    }
    const { id, date_added, ...bookData } = book
    await window.api.books.add(bookData)
    imported++
  }

  await loadLibrary()
  status.textContent = `Imported ${imported} books.${skipped ? ` Skipped ${skipped} invalid entries.` : ''}`
  status.style.color = 'var(--accent)'
})

// KEYBOARD SHORTCUTS
document.addEventListener('keydown', (e) => {
  const activeElement = document.activeElement
  const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName)

  if (e.key === 'Escape') {
    if (editingBookId) {
      editingBookId = null
      document.querySelectorAll('#add-book input, #add-book textarea').forEach(el => el.value = '')
      document.getElementById('input-status').value = 'want'
      document.getElementById('input-format').value = 'physical'
      document.getElementById('btn-add-book').textContent = 'Add Book'
      document.getElementById('add-book').querySelector('h2').textContent = 'Add a Book'
      if (currentBook) showDetail(currentBook)
    } else {
      navigateTo('library')
    }
    return
  }

  if (isTyping) return

  if (e.ctrlKey && e.key === 'l') {
    e.preventDefault()
    navigateTo('library')
  }

  if (e.ctrlKey && e.key === 'n') {
    e.preventDefault()
    navigateTo('add-book')
  }

  if (e.ctrlKey && e.key === 'f') {
    e.preventDefault()
    navigateTo('library')
    document.getElementById('library-search').focus()
  }

  if (e.ctrlKey && e.key === ',') {
    e.preventDefault()
    navigateTo('filter')
  }
})

// INITIAL LOAD
loadLibrary()