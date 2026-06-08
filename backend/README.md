# BhoomiChain Backend

Node.js + Express backend for India's blockchain-based land registry.

## Quick Start

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
npm run dev
```

Server starts at **http://localhost:3001**

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start with nodemon (hot-reload) |
| `npm start` | Production start |
| `npm run seed` | Reset and re-seed demo blockchain data |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Server health + chain validation |
| GET | `/api/dashboard/stats` | Full dashboard metrics |
| GET | `/api/properties` | List properties (filters: city, type, minArea, status) |
| GET | `/api/properties/search?q=` | Search by ID / name / survey no |
| POST | `/api/properties/register` | Register new property (fraud-checked) |
| GET | `/api/properties/:id` | Property details + history + QR |
| POST | `/api/properties/verify-integrity/:id` | Re-hash & verify property blocks |
| GET | `/api/ledger` | Full blockchain view |
| GET | `/api/ledger?export=true` | Download ledger as JSON |
| POST | `/api/transactions/add` | Add SALE / LIEN / MUTATION etc. |
| POST | `/api/fraud/analyze` | AI + rule-based fraud analysis |
| GET | `/api/fraud/alerts` | Rejected registration attempts |
| GET | `/api/fraud/analytics` | Circle rate violation stats |
| GET | `/api/reit/properties` | Investor-grade CLEAR properties |
| POST | `/api/reit/due-diligence` | AI due diligence report |

## Environment Variables

```
PORT=3001
ANTHROPIC_API_KEY=sk-ant-...
NODE_ENV=development
```

## Architecture

```
backend/
├── server.js           ← Express app + startup chain validation
├── routes/             ← Route handlers (thin controllers)
│   ├── properties.js   ← Registration, search, verify
│   ├── transactions.js ← Ledger view, add transaction
│   ├── fraud.js        ← AI + rule-based fraud analysis
│   └── reit.js         ← Investor portal + due diligence
├── services/
│   ├── blockchain.js   ← File-based blockchain (ledger.json)
│   ├── claude.js       ← Anthropic AI integration
│   ├── fraud.js        ← Local circle rate / Aadhaar checks
│   └── stampDuty.js    ← Stamp duty calculation
├── middleware/
│   ├── errorHandler.js ← Global error catcher
│   └── validateRequest.js ← express-validator rules
├── data/
│   ├── ledger.json     ← Persisted blockchain (auto-seeded)
│   ├── rejects.json    ← Rejected registrations log
│   └── seed.js         ← CLI seed script
└── constants/
    └── circleRates.js  ← Indian city circle rates
```
