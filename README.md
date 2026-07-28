# Polytext — Read Books in Any Language

Polytext is a full-stack web platform for reading and translating PDF books. Open a book in the flipbook reader, pick a language, and read the same page in the language of your choice, with the same layout and structure preserved. Works on both digital PDFs and scanned books.

**Live Demo:** [coming soon]

---

## What It Does

- **Translates entire pages while preserving the original layout** — the translated page looks like the book was printed in that language, not like text pasted into a side panel
- **Handles scanned books** — image-based PDFs without any digital text layer are fully supported through a built-in OCR pipeline
- **Multi-script support** — supports translation into any language via Gemini API, with dedicated font rendering for Punjabi, Hindi, Arabic, Urdu, Marathi, Nepali, and Sanskrit
- **Interactive flipbook reader** — smooth page-turning reading experience in the browser
- **Personal library** — browse the collection, filter by language, sort, and search
- **Accounts and uploads** — secure signup/login, with an upload system that automatically extracts book metadata and generates cover thumbnails

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite, Bootstrap, PDF.js, react-pageflip |
| Backend | Node.js, Express, PostgreSQL |
| Translation | Google Gemini API, Google Translate |
| Document Processing | Tesseract.js (OCR), pdf-lib, sharp, Python (pdf2image, PyPDF2, langdetect) |
| Infrastructure | REST API, bcrypt authentication, rate limiting |

## Architecture Highlights

- Dual processing pipelines — one for text-based PDFs, one for scanned documents — unified behind a single translation flow
- LLM translation with chunked processing designed for reliability on long documents
- Node.js and Python interoperability for document analysis and metadata extraction
- Dynamic multi-script font embedding and text scaling

## Running Locally

### Prerequisites

- Node.js 18+
- PostgreSQL
- Python 3.x
- Poppler — `apt install poppler-utils` (Linux) / `brew install poppler` (macOS) / binaries on Windows

### Setup

Clone and install frontend:

```bash
git clone https://github.com/paradox76/polytext.git
cd polytext
npm install
```

Install backend:

```bash
cd server
npm install
```

Set up Python environment:

```bash
cd utils
python -m venv virtual_venv
virtual_venv/Scripts/activate
pip install -r requirements.txt
```

Create a `.env` in the project root:

```env
VITE_SERVER_ADDRESS=http://localhost:3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=polytext
DB_USER=postgres
DB_PASSWORD=your_password
PYTHON_PATH=path/to/virtual_venv/python
GEMINI_API_KEY=your_key
```
```
psql -U postgres -c "CREATE DATABASE polytext"
psql -U postgres -d polytext -f schema.sql
```
Start the backend:

```bash
cd server
npx nodemon index.js
```

Start the frontend in a separate terminal:

```bash
npm run dev
```

---

© 2026 All rights reserved. This repository is available for viewing and evaluation purposes only.
