# MazdoorMitra (मजदूरमित्र)

**Friend of the Laborer** - Empowering daily wage workers through digital contracts

![MazdoorMitra](https://img.shields.io/badge/Status-MVP-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8)

---

## 🎯 Overview

MazdoorMitra is a web application that connects **Daily Wage Workers (Mazdoor)** with **Contractors (Thekedar)** through **mandatory digital contracts** to prevent wage exploitation and ensure fair payment.

### Core Value Proposition
- **सुरक्षा कॉन्ट्रैक्ट (Suraksha Contract)**: Mandatory digital contracts before any job begins
- **Minimum Wage Protection**: Automatic validation ensuring wages ≥ ₹400/day
- **Digital Signatures**: Both parties must sign before job activation
- **Bilingual Interface**: Hindi + English for accessibility

---

## 🌟 Key Features

### 1. **Dual Authentication**
- Separate signup/login flows for Workers and Contractors
- Phone number + OTP verification
- User type selection with visual interface

### 2. **Suraksha-Contract Module** ⭐ (Core Feature)
- Contract generation with:
  - Daily wage input
  - Number of days
  - Work hours per day
  - Overtime rate
- **Real-time minimum wage validation** (₹400/day threshold)
- Contract preview before creation
- **Dual digital signature system**:
  - Contractor signs first
  - Worker reviews and signs
  - Contract activates only when both have signed
- Immutable contract record

### 3. **Marketplace** (Planned)
- Search workers by skill and location
- Workers can toggle "Available for Work" status
- View worker profiles with ratings

### 4. **Job Dashboard** (Planned)
- Active contracts tracking
- Days worked monitoring
- Pending payment summary

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS (custom accessibility theme)
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Phone + OTP (Supabase Auth + MSG91)
- **Internationalization**: i18next (Hindi, English)

---

## 📋 Prerequisites

Before running this project, ensure you have:

- **Node.js** ≥ 18.17.0
- **npm** or **yarn**
- **Supabase Account** (free tier works)
- **MSG91 Account** (for OTP, optional for development)

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd /Users/adnanquraishee/Downloads/MazdoorMitra
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration from:
   ```
   supabase/schema.sql
   ```
3. Copy your **Project URL** and **Anon Key** from Settings → API

### 3. Configure Environment Variables

Create a `.env.local` file:

```bash
cp .env.example .env.local
```

Update with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Optional: MSG91 for production OTP
MSG91_AUTH_KEY=your_msg91_key
MSG91_SENDER_ID=MZDRMR
MSG91_ROUTE=4

# App Configuration
NEXT_PUBLIC_MINIMUM_WAGE=400
NEXT_PUBLIC_DEFAULT_LANGUAGE=hi
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Testing OTP in Development

In development mode, the OTP is logged to the console:

```bash
# Check terminal output after requesting OTP:
📱 OTP for +919876543210: 123456
⏰ Expires at: 2024-12-14T00:30:00.000Z
```

---

## 📁 Project Structure

```
MazdoorMitra/
├── app/                          # Next.js App Router
│   ├── auth/                     # Authentication pages
│   │   └── signup/page.tsx       # Multi-step signup
│   ├── contracts/                # Contract module
│   │   ├── create/page.tsx       # Contract creation form
│   │   └── [id]/page.tsx         # Contract details & signing
│   ├── api/                      # Backend API endpoints
│   │   ├── auth/
│   │   │   ├── send-otp/route.ts # OTP generation
│   │   │   └── signup/route.ts   # User registration
│   │   └── contracts/
│   │       ├── create/route.ts   # Contract creation
│   │       └── [id]/
│   │           ├── route.ts      # Fetch contract
│   │           └── accept/route.ts # Digital signature
│   ├── globals.css               # Global styles + Tailwind
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── lib/
│   └── supabase.ts               # Supabase client & helpers
├── types/
│   └── index.ts                  # TypeScript definitions
├── supabase/
│   └── schema.sql                # Database migration
├── .env.example                  # Environment template
├── package.json
├── tailwind.config.ts            # Custom theme
└── README.md
```

---

## 🔐 Database Schema

8 tables in PostgreSQL (Supabase):

1. **users** - Core user data
2. **worker_profiles** - Worker-specific info (skills, rate, location)
3. **contractor_profiles** - Contractor-specific info
4. **jobs** - Job postings
5. **suraksha_contracts** ⭐ - Digital contracts with wage protection
6. **work_logs** - Daily work tracking
7. **payments** - Payment records
8. **otp_verifications** - OTP management

See full schema: `supabase/schema.sql`

---

## 🎨 Design Philosophy

### Accessibility-First
- **Large touch targets**: Min 48x48px buttons
- **High contrast colors**: Orange/Green palette
- **Bilingual labels**: Hindi + English on all UI elements
- **Simple navigation**: Max 3 clicks to any feature
- **Voice input support** (planned): For wage entry

### Low Tech-Literacy Focus
- Icon-based navigation
- Large fonts (18px+ for body text)
- Minimal text input fields
- Visual feedback for all actions

---

## ⚡ Key User Flows

### Worker Signup Flow
1. Select "I am a Worker"
2. Enter phone number → Receive OTP
3. Verify OTP + Enter name
4. Create profile (skills, rate, location)
5. Toggle availability

### Contract Creation Flow (Contractor)
1. Search for worker in marketplace
2. Click "Hire This Worker"
3. Fill contract form:
   - Daily wage (with min wage check)
   - Days, hours, overtime rate
4. Preview contract
5. Create contract (auto-signs for contractor)
6. Wait for worker acceptance

### Contract Acceptance Flow (Worker)
1. Receive notification about pending contract
2. View contract details
3. Review all terms
4. Click "Accept" → Digital signature
5. Contract activates (job begins)

---

## 🧪 Testing

### Manual Testing Checklist

**Authentication:**
- [ ] Worker signup with OTP
- [ ] Contractor signup
- [ ] OTP expiry (5 minutes)

**Suraksha-Contract:**
- [ ] Create contract with wage > ₹400 (no warning)
- [ ] Create contract with wage < ₹400 (warning shown)
- [ ] Contract preview displays correctly
- [ ] Contractor signature recorded
- [ ] Worker can accept contract
- [ ] Contract activates after dual signature
- [ ] Job status changes to "active"

---

## 🚧 Roadmap

### MVP (Current Version)
- [x] Authentication system
- [x] Suraksha-Contract module
- [x] Database schema
- [x] Bilingual UI
- [ ] Worker profile creation
- [ ] Contractor profile creation
- [ ] Marketplace search

### Phase 2
- [ ] React Native mobile apps
- [ ] Payment integration (Razorpay/PhonePe)
- [ ] SMS notifications (MSG91)
- [ ] Work log tracking
- [ ] Rating system

### Phase 3
- [ ] Voice input for forms
- [ ] Escrow payment system
- [ ] Biometric signatures
- [ ] Contract templates
- [ ] Multi-language support (Marathi, Gujarati, etc.)

---

## 🤝 Contributing

This is a social impact project. Contributions welcome!

Areas needing help:
- Translation to regional languages
- Accessibility improvements
- SMS/notification integrations
- Mobile app development

---

## 📄 License

MIT License

---

## 💡 About

**MazdoorMitra** was created to address wage exploitation in India's informal labor sector. By enforcing digital contracts and minimum wage checks, we aim to protect millions of daily wage workers.

**Target Impact:**
- Prevent wage theft
- Ensure minimum wage compliance
- Create legal recourse for workers
- Build trust between workers and contractors

---

## 📞 Support

For issues or questions:
- Create a GitHub Issue
- Email: support@mazdoormitra.com (planned)

---

**Built with ❤️ for India's hardworking laborers**

मजदूरों के लिए, मजदूरों के साथ | For Workers, With Workers
# MazdoorMitra
# MazdoorMitra
