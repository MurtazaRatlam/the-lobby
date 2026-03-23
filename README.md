# The Lobby - Gaming Cafe Management App

Production-ready full-stack web app for managing 15 gaming PCs, customer sessions, billing, and reports.

## Tech Stack

- Frontend: React (Vite, hooks, functional components)
- Backend: Node.js + Express (MVC + REST)
- Database: PostgreSQL
- ORM: Sequelize

## Project Structure

```text
the-lobby/
  backend/
  frontend/
```

## Quick Start

### 1) Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Update `.env` with your PostgreSQL credentials.

Run backend:

```bash
npm run dev
```

Backend runs on `http://localhost:5000`.

### 2) Frontend setup

```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## API Base

- Frontend uses `VITE_API_URL` (default: `http://localhost:5000/api`)

## Core Features

- Visual PC dashboard (Left room + Right room layout)
- Start session from available PC
- Normal and custom logout flows
- Hour rounding and billing logic
- Customers CRUD with analytics
- Products CRUD (name, price)
- Add products to **active sessions**; charges roll into session total at logout (`POST /api/sessions/:sessionId/products`)
- Reports with date range filter and CSV export
- Live timers for active sessions

