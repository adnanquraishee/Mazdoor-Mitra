# MazdoorMitra - Setup Instructions

## Quick Start Guide

### Step 1: Install Node.js

If you don't have Node.js installed:

**macOS:**
```bash
# Using Homebrew
brew install node

# Or download from: https://nodejs.org/
```

Verify installation:
```bash
node --version  # Should be v18.17.0 or higher
npm --version
```

### Step 2: Install Project Dependencies

```bash
cd /Users/adnanquraishee/Downloads/MazdoorMitra
npm install
```

This will install all required packages (Next.js, React, Supabase, Tailwind, etc.)

### Step 3: Set Up Supabase Database

1. **Create Supabase Account:**
   - Go to https://supabase.com
   - Click "Start your project"
   - Sign up with GitHub or email

2. **Create New Project:**
   - Click "New Project"
   - Choose organization name
   - Set database password (save this!)
   - Select region (Asia South - Mumbai recommended)
   - Click "Create new project"

3. **Run Database Migration:**
   - Wait for project to finish setting up (~2 minutes)
   - Go to **SQL Editor** in left sidebar
   - Click "New query"
   - Copy entire contents of: `/Users/adnanquraishee/Downloads/MazdoorMitra/supabase/schema.sql`
   - Paste into SQL Editor
   - Click "Run" button
   - You should see: "Success. No rows returned"

4. **Get API Credentials:**
   - Go to **Settings** → **API**
   - Copy:
     - **Project URL** (e.g., https://abcdefgh.supabase.co)
     - **anon public** key (long string)

### Step 4: Configure Environment Variables

1. **Create .env.local file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Edit .env.local:**
   ```bash
   # Open in text editor
   nano .env.local
   # or
   open -a TextEdit .env.local
   ```

3. **Add your Supabase credentials:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_long_anon_key_here

   # For development, MSG91 is optional
   # MSG91_AUTH_KEY=your_msg91_key_here

   NEXT_PUBLIC_MINIMUM_WAGE=400
   NEXT_PUBLIC_APP_NAME=MazdoorMitra
   NEXT_PUBLIC_DEFAULT_LANGUAGE=hi
   ```

4. **Save and close**

### Step 5: Run the Application

```bash
npm run dev
```

You should see:
```
▲ Next.js 14.2.0
- Local:        http://localhost:3000
- Ready in 2.3s
```

### Step 6: Open in Browser

Navigate to: **http://localhost:3000**

You should see the MazdoorMitra landing page!

---

## Testing the Application

### Test 1: Worker Signup

1. Click "मैं मजदूर हूं / I am a Worker"
2. Enter phone number: `9876543210`
3. Click "OTP भेजें / Send OTP"
4. **Check terminal** - you'll see:
   ```
   📱 OTP for +919876543210: 123456
   ```
5. Enter the OTP shown in terminal
6. Enter name: "Test Worker"
7. Click "Create Account"

### Test 2: Create a Contract

1. Navigate to: http://localhost:3000/contracts/create?job_id=test
2. Fill in:
   - Daily Wage: `600`
   - Number of Days: `10`
   - Work Hours: `8`
   - Overtime Rate: `75`
3. Click "Preview Contract"
4. Verify total shows ₹6,000
5. Click "Create Contract"

### Test 3: Minimum Wage Warning

1. Go back to contract creation
2. Enter Daily Wage: `300` (below ₹400)
3. You should see orange warning:
   "⚠️ चेतावनी: यह वेतन न्यूनतम मजदूरी से कम है"

---

## Optional: MSG91 Setup (For Production OTP)

For actual SMS delivery:

1. **Sign up at MSG91:**
   - Go to https://msg91.com
   - Click "Sign Up"
   - Complete verification

2. **Get API Key:**
   - Dashboard → API Keys
   - Copy "Authkey"

3. **Add to .env.local:**
   ```env
   MSG91_AUTH_KEY=your_auth_key_here
   MSG91_SENDER_ID=MZDRMR
   MSG91_ROUTE=4
   ```

4. **Update send-otp API:**
   - Uncomment MSG91 code in: `app/api/auth/send-otp/route.ts`

---

## Troubleshooting

### Issue: "Module not found" errors

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Supabase connection fails

**Solution:**
1. Check `.env.local` has correct URL and key
2. Verify no extra spaces in env variables
3. Restart dev server: `Ctrl + C`, then `npm run dev`

### Issue: OTP not appearing

**Solution:**
- Check terminal console where `npm run dev` is running
- Look for `📱 OTP for...` message
- If not there, check Supabase logs

### Issue: Database tables not found

**Solution:**
1. Go to Supabase Dashboard → Table Editor
2. Verify all 8 tables exist
3. If not, re-run schema.sql in SQL Editor

---

## Next Steps

After setup:

1. **Explore the landing page** - http://localhost:3000
2. **Test signup flow** - Create worker and contractor accounts
3. **Test contract creation** - Use the forms
4. **Check Supabase dashboard** - See data being created
5. **Read the code** - Understand the structure
6. **Build missing features** - Refer to roadmap in README.md

---

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type check
npx tsc --noEmit

# Format code (if you add Prettier)
npm run format
```

---

## Deployment (Optional)

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Go to https://vercel.com
3. Import GitHub repository
4. Add environment variables from .env.local
5. Deploy

---

**Ready to Build!** 🚀

If you encounter any issues, check the terminal logs or Supabase dashboard for errors.
