# 🌿 FarmFlow — Animal Farm Business Management Dashboard

A complete, production-ready livestock farming management dashboard built with Next.js, PostgreSQL, and Claude AI.

## ✨ Features

- **Authentication** — Secure register/login with bcrypt + JWT cookies
- **Animals** — Full CRUD with photo upload, type, weight, color, price tracking
- **Feed** — Inventory management with quantity, unit, and pricing
- **Budget & Expenses** — P&L tracking, categorized expenses, ROI calculation
- **Business Cycles** — Monthly cycle management with auto profit calculation
- **AI Recommendations** — Claude AI analyzes your data for actionable insights
- **Excel Export** — Beautiful multi-sheet workbook download

---

## 🚀 Deploy to Vercel in 5 Minutes

### Step 1: Create a PostgreSQL database

Use **[Neon.tech](https://neon.tech)** (recommended — free tier, Vercel native):
1. Sign up at neon.tech
2. Create a new project
3. Copy the connection string: `postgresql://user:pass@host/db?sslmode=require`

### Step 2: Get your API keys

- **Anthropic API Key**: [console.anthropic.com](https://console.anthropic.com) → API Keys → Create Key
- **JWT Secret**: Run `openssl rand -hex 32` in your terminal

### Step 3: Deploy to Vercel

```bash
# Option A: Vercel CLI
npm install -g vercel
cd farm-dashboard
vercel --prod

# Option B: GitHub
# Push to GitHub → import at vercel.com/new → auto-deploy
```

### Step 4: Set Environment Variables in Vercel Dashboard

Go to your Vercel project → Settings → Environment Variables, and add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your PostgreSQL connection string |
| `JWT_SECRET` | Random 32+ character string |
| `ANTHROPIC_API_KEY` | Your Claude API key (sk-ant-...) |

### Step 5: Redeploy

After setting env vars, trigger a new deployment from the Vercel dashboard.

**That's it!** Database tables are created automatically on first request.

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Copy env file and fill in your values
cp .env.example .env.local

# Run development server
npm run dev

# Open http://localhost:3000
```

---

## 📁 Project Structure

```
farm-dashboard/
├── pages/
│   ├── index.js                    # Login / Register
│   ├── _app.js                     # App wrapper
│   ├── dashboard/
│   │   ├── index.js                # Overview
│   │   ├── animals.js              # Animals CRUD
│   │   ├── feed.js                 # Feed CRUD
│   │   ├── budget.js               # Budget & Expenses
│   │   ├── cycles.js               # Business Cycles
│   │   └── ai.js                   # AI Recommendations
│   └── api/
│       ├── auth/
│       │   ├── index.js            # Login/Register
│       │   └── me.js               # Session/Logout
│       ├── animals/index.js        # Animals API
│       ├── feed/index.js           # Feed API
│       ├── expenses/index.js       # Expenses API
│       ├── budget/index.js         # Budget API
│       ├── cycles/index.js         # Cycles API
│       ├── ai/recommendations.js   # Claude AI API
│       └── export.js               # Excel export
├── components/
│   ├── Layout.js                   # Auth + layout wrapper
│   └── Sidebar.js                  # Navigation sidebar
├── lib/
│   ├── db.js                       # PostgreSQL pool + schema init
│   └── auth.js                     # JWT sign/verify
├── styles/
│   └── globals.css                 # Full design system
├── vercel.json                     # Vercel config
├── .env.example                    # Environment variables template
└── package.json
```

---

## 🗄️ Database Schema

Tables auto-created on first API request:

- **users** — username, password_hash
- **animals** — name, type, weight, color, price, photo_url
- **feed** — name, quantity, unit, price, animal_type
- **budget** — total_investment, total_profit (per user)
- **expenses** — description, amount, category, date
- **cycles** — name, month, year, status, revenue, expenses, profit

---

## 🔐 Security

- Passwords hashed with **bcrypt** (12 rounds)
- Sessions via **HTTP-only JWT cookies** (7 day expiry)
- All API routes verify user identity before database access
- Row-level isolation: each user only sees their own data

---

## 📊 Excel Export

Click **Export to Excel** in the sidebar to download a workbook with:
- 🐾 Animals sheet
- 🌾 Feed inventory sheet
- 💰 Expenses tracker sheet
- 📊 Budget summary with ROI
- 🔄 Business cycles sheet

---

## 🤖 AI Integration

The AI Recommendations page uses **Claude claude-opus-4-5** to analyze:
- Your animal portfolio composition
- Historical cycle profitability
- Expense patterns by category
- Feed cost efficiency

And returns structured recommendations for:
- Which animals to buy and when
- Feed optimization strategies
- Cycle duration recommendations
- Financial risk insights

If no API key is set, sensible fallback recommendations are shown.

---

## 📱 Responsive Design

- Full desktop sidebar navigation
- Mobile-friendly with slide-out sidebar
- Touch-optimized buttons and inputs
- Works on all modern browsers

---

Built with ❤️ using Next.js, PostgreSQL, and Claude AI
