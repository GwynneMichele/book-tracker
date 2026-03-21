# 📚 Book Tracker

A personal desktop app for tracking your reading life. Search for books, import covers automatically, write notes in Markdown, and keep tabs on what you're reading, what you've finished, and what's on your list.

Built with Electron, SQLite, and vanilla JavaScript. No subscriptions, no cloud, no accounts — just your books, on your machine.

![Book Tracker Library View](screenshots/library.png)

---

## Features

- **Book search** — search Open Library to auto-fill title, author, and cover art
- **Library grid** — visual card layout with cover images
- **Detail view** — full book info with Markdown-rendered notes
- **Reading progress** — track current page and total pages with a progress bar
- **Status tracking** — Want to Read, Currently Reading, Finished
- **Format tracking** — Physical, Digital, or Both
- **Series tracking** — series name and order number
- **Genre and tags** — flexible categorization
- **Date tracking** — date started and date finished
- **Search and filter** — live search by title or author, filter by status, format, genre, tags, and rating
- **Sort options** — by date added, title, author, or rating
- **Stats page** — reading activity, format breakdown, top genres and tags
- **Import / Export** — back up your library to JSON or CSV
- **Keyboard shortcuts** — navigate without touching the mouse
- **Offline** — fully local, no internet required (except for cover image search)

![Book Detail View](screenshots/detail.png)

---

## Installation

### For end users

1. Go to the [Releases](../../releases) page
2. Download `Book Tracker Setup x.x.x.exe`
3. Run the installer
4. Launch Book Tracker from the Start Menu

> **Note:** Windows may show a SmartScreen warning since the app isn't commercially code-signed. Click **More info → Run anyway** to proceed. This is normal for independent apps.

Your library is stored locally in `%AppData%\Book Tracker\books.db` — it's just a SQLite file you own completely.

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+L` | Go to Library |
| `Ctrl+N` | Add New Book |
| `Ctrl+F` | Focus search bar |
| `Ctrl+,` | Go to Filter |
| `Escape` | Back / Cancel edit |

---

## Developer Setup

Want to run it from source or contribute? Here's how to get going.

**Prerequisites**
- [Node.js](https://nodejs.org/) v18 or higher
- Windows (Linux/Mac support untested but may work)

**Clone and install**

```bash
git clone https://github.com/yourusername/book-tracker.git
cd book-tracker
npm install
npm rebuild better-sqlite3 --runtime=electron --target=41.0.3 --dist-url=https://electronjs.org/headers --build-from-source
```

**Run in development**

```bash
npm start
```

Dev mode uses a separate `books-dev.db` database so your real library stays safe.

**Build the installer**

```bash
$env:CSC_IDENTITY_AUTO_DISCOVERY="false"
npm run build
```

The installer will be output to `dist/Book Tracker Setup x.x.x.exe`.

---

## Roadmap

Things I'm planning to add when the mood strikes:

- [ ] Cover image caching for offline use
- [ ] Reading goals (e.g. 50 books this year)
- [ ] Loan tracking — who borrowed your books
- [ ] Multiple shelves / collections beyond status
- [ ] Auto-backup on app launch
- [ ] Theme switcher for sharing as a public release
- [ ] More stats — reading streaks, books per month

---

## Contributing

This started as a personal project but I'm happy to accept contributions. If you want to add a feature or fix something:

1. Fork the repo
2. Create a branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Open a pull request with a clear description of what you changed and why

For bigger changes, open an issue first so we can talk through the approach before you spend time on it.

Bug reports and feature requests are welcome as GitHub Issues.

---

## License

MIT License — do whatever you want with it, just don't claim you wrote it from scratch.

---

*Built by Gwynne. Powered by [Electron](https://electronjs.org), [SQLite](https://sqlite.org), and the [Open Library API](https://openlibrary.org/developers/api).*