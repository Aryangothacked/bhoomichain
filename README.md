# 🏛️ BhoomiChain — Blockchain Land Registry of India

> Transparent. Tamper-proof. Trusted.

A production-ready blockchain-based land registry system for India, built to eliminate property fraud, enforce circle rates, and bring transparency to land records across 10 major cities.

---

## 🚀 Live Demo
- Frontend: [Deploy link here]
- Backend API: [Deploy link here]

---

## 🎯 Problem Statement

India loses thousands of crores annually due to:
- **Circle rate evasion** — properties sold below government rates in cash
- **Duplicate title fraud** — same property sold to multiple buyers
- **Benami transactions** — properties registered under fake identities
- **Civil court overload** — 66% of civil cases are property disputes
- **Manual record tampering** — physical records altered by corrupt officials

---

## ✅ Solution — BhoomiChain

Every property transaction is recorded as an **immutable block** on a cryptographic chain. Once written, it cannot be altered, deleted, or tampered with.

### Core Features
| Feature | Description |
|---------|-------------|
| 🔗 Blockchain Ledger | Every sale, mutation, inheritance, lien recorded as tamper-proof block |
| 🚨 Circle Rate Enforcement | Smart validation rejects transactions below government circle rate |
| 🤖 AI Fraud Detection | Groq-powered AI analyses transactions for PMLA violations and benami ownership |
| 🔍 Instant Title Verification | Search any property, verify chain integrity in real-time |
| 📊 REIT Portal | Blockchain-verified properties for institutional investors |
| 📱 WhatsApp + Telegram Alerts | Instant notifications on every registration or fraud attempt |
| 🗺️ Map View | Visual property tracking across 10 cities |
| 📄 PDF Reports | Downloadable due diligence reports |

---

## 🏙️ Phase 1 Cities
Mumbai • Delhi • Bengaluru • Hyderabad • Pune • Chennai • Ahmedabad • Kolkata • Jaipur • Surat

---

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript + Vite
- Recharts (data visualization)
- React Leaflet (map view)
- jsPDF (PDF export)
- React Hot Toast (notifications)

### Backend
- Node.js + Express
- PostgreSQL (Supabase)
- SHA-256 cryptographic hashing
- Groq AI API (Llama 3.3 70B)

### Notifications
- CallMeBot (WhatsApp — free)
- Telegram Bot API (free)

---

## 📁 Project Structure

```
Bhoomichain/
├── frontend/                 # React + Vite frontend
│   └── src/
│       ├── pages/           # Dashboard, Register, Search, Ledger, Fraud, REIT
│       ├── components/      # Layout, UI, Charts, Property components
│       ├── hooks/           # useChain, useProperty, useFraud
│       └── utils/           # Formatters, PDF generator
│
├── backend/                  # Node.js + Express API
│   ├── routes/              # properties, transactions, fraud, reit
│   ├── services/            # blockchain, claude, fraud, notifications
│   ├── database/            # PostgreSQL schema, init, db connection
│   └── server.js
│
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL database (Supabase free tier recommended)
- Groq API key (free at console.groq.com)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/bhoomichain.git
cd bhoomichain
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your DATABASE_URL and GROQ_API_KEY in .env
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Open browser
```
Frontend: http://localhost:5173
Backend:  http://localhost:3001
```

---

## 🔑 Environment Variables

### backend/.env
```env
PORT=3001
DATABASE_URL=postgresql://...your_supabase_url...
GROQ_API_KEY=gsk_...
CALLMEBOT_PHONE=91XXXXXXXXXX
CALLMEBOT_API_KEY=your_key
TELEGRAM_BOT_TOKEN=your_token
TELEGRAM_CHAT_ID=your_chat_id
```

---

## 📊 Impact Potential

| Metric | Current (Manual) | With BhoomiChain |
|--------|-----------------|-----------------|
| Title verification time | 3-7 days | Instant |
| Property dispute rate | High | Drastically reduced |
| Circle rate compliance | ~40% | ~100% enforced |
| Due diligence cost (REIT) | ₹50,000+ | Near zero |
| Stamp duty leakage | Massive | Eliminated |

---

## 🔮 Roadmap

- [ ] Aadhaar eKYC integration
- [ ] State government node integration (MeitY)
- [ ] Mobile app (React Native)
- [ ] RERA integration for commercial projects
- [ ] AI-powered property valuation
- [ ] Multi-language support (Hindi, Gujarati, Tamil, Telugu)

---

## 👨‍💻 Built With

Built as a proof-of-concept to demonstrate how blockchain technology can solve India's land registry crisis.

> ⚠️ This is a simulated demo. Not connected to any real government system.

---

## 📄 License
MIT License
