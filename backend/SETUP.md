# Database Setup

## Option A — Supabase (Recommended, Free)
1. Go to supabase.com, create account, new project
2. Go to Settings > Database > Connection string > URI
3. Copy the connection string
4. Add to backend/.env: DATABASE_URL=your_connection_string
5. Run: node database/init.js

## Option B — Neon (Also Free)
1. Go to neon.tech, create account, new project
2. Copy the connection string from dashboard
3. Add to backend/.env: DATABASE_URL=your_connection_string
4. Run: node database/init.js

## Option C — Local PostgreSQL
1. Install PostgreSQL locally
2. Create database: createdb bhoomichain
3. DATABASE_URL=postgresql://localhost:5432/bhoomichain
4. Run: node database/init.js
