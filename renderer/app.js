// NAVIGATION
const navButtons = document.querySelectorAll('.nav-btn')
const views = document.querySelectorAll('.view')

navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.view

    navButtons.forEach(b => b.classList.remove('active'))
    views.forEach(v => v.classList.remove('active'))

    btn.classList.add('active')
    document.getElementById(target).classList.add('active')
  })
})

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

// Also allow pressing Enter in the search box
document.getElementById('api-search-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('btn-api-search').click()
})

// ADD BOOK
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

  await window.api.books.add(book)
  loadLibrary()

  // Clear the form
  document.querySelectorAll('#add-book input, #add-book textarea').forEach(el => el.value = '')
  document.getElementById('input-status').value = 'want'
  document.getElementById('input-format').value = 'physical'

  // Switch to library view
  navButtons.forEach(b => b.classList.remove('active'))
  views.forEach(v => v.classList.remove('active'))
  document.querySelector('[data-view="library"]').classList.add('active')
  document.getElementById('library').classList.add('active')
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
    grid.appendChild(card)
  })
}

// Initial load
loadLibrary()