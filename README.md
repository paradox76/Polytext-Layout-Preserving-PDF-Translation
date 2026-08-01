# Polytext — Read Books in Any Language

Polytext is a full-stack web platform for reading and translating PDF books. Open a book in the flipbook reader, pick a language, and read the same page in the language of your choice, with the same layout and structure preserved. Works on both digital PDFs and scanned books.

**Live Demo:** [https://polytext.dev](https://polytext.dev)

---

## What It Does

- **Translates entire pages while preserving the original layout** — the translated page looks like the book was printed in that language, not like text pasted into a side panel
- **Handles scanned books** — image-based PDFs without any digital text layer are fully supported through a built-in OCR pipeline
- **Multi-script support** — translation into any language via the Gemini API, with dedicated font rendering for Punjabi, Hindi, Arabic, Urdu, Marathi, Nepali, and Sanskrit
- **Two translation engines** — choose between LLM translation (context-aware, preserves meaning across line breaks) or classic Google Translate
- **Interactive flipbook reader** — smooth page-turning reading experience with neighbouring pages pre-rendered for instant flips
- **Open access** — browse, read, and translate without an account
- **Personal library** — filter by language, sort by title or author, and search
- **Accounts and uploads** — secure signup/login, with a drag-and-drop upload system that automatically extracts book metadata, detects language, and generates cover thumbnails
- **Admin tools** — batch processing and book management

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite, Bootstrap, PDF.js, react-pageflip |
| Backend | Node.js, Express, PostgreSQL |
| Translation | Google Gemini API, Google Translate |
| Document Processing | Tesseract.js (OCR), pdf-lib, pdf-to-img, sharp, Python (pdf2image, PyPDF2, langdetect) |
| Infrastructure | Nginx, PM2, Azure VM, Let's Encrypt SSL |
| Security | bcrypt authentication, rate limiting, parameterized queries |

## Architecture Highlights

- **Dual processing pipelines** — one for text-based PDFs (PDF.js coordinate extraction), one for scanned documents (Tesseract OCR with pixel-to-point coordinate conversion) — unified behind a single translation flow
- **Coordinate-preserving translation** — original text is covered with rectangles colour-matched to the page background, and translated text is redrawn at the same coordinates with dynamic font scaling
- **Structured LLM translation** — each line is sent as a positioned object so translations map back to exact coordinates while retaining surrounding context for coherent, continuous output
- **Sliding-window canvas caching** — only pages near the current position are rendered and cached, bounding memory regardless of book length
- **Node.js and Python interoperability** — Python handles document analysis, language detection, and thumbnail generation via child processes
- **Dynamic multi-script font embedding** with automatic text scaling to fit original bounding boxes

## Running Locally

### Prerequisites

- Node.js 18+
- PostgreSQL
- Python 3.x
- Poppler — `apt install poppler-utils` (Linux) / `brew install poppler` (macOS) / binaries on Windows

### Setup

Clone and install frontend:

```bash
git clone https://github.com/paradox76/Polytext-Layout-Preserving-PDF-Translation.git
cd Polytext-Layout-Preserving-PDF-Translation
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
VITE_SERVER_ADDRESS=http://localhost:3001/
DB_HOST=localhost
DB_PORT=5432
DB_NAME=polytext
DB_USER=postgres
DB_PASSWORD=your_password
PYTHON_PATH=path/to/virtual_venv/python
GEMINI_API_KEY=your_key
```

Set up the database:

```bash
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

## Deployment

Deployed on an Azure VM running Ubuntu, with Nginx serving the production build and reverse-proxying API routes, PM2 managing the Node process, and PostgreSQL running locally. SSL provided by Let's Encrypt with automatic renewal.

---

© 2026 All rights reserved. This repository is available for viewing and evaluation purposes only.
