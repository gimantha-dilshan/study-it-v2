# Study-It: The Ultimate AI Educational Assistant 🎓🚀✨

![Version](https://img.shields.io/badge/Version-2.5_Stable-blue?style=for-the-badge&logo=github)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)
![WhatsApp](https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**Study-It** is a professional, multimodal WhatsApp educational platform designed to empower students with instant, high-quality learning assistance. Built with a "Student-First" philosophy, it combines the power of **Gemini 2.0 Flash** (with 4-tier fallback) with a sleek, real-time **Admin Dashboard (V4)** for total educational control.

---

## 🌟 Key Features

### 🧠 Multimodal AI Intelligence (The Brain)
- **📸 Smart OCR Analysis:** Send a photo of any math problem, science equation, or essay prompt. The bot provides step-by-step logic, not just answers.
- **🎙️ AI Voice Partner:** Send a voice note asking a question. Study-It listens and responds with clear, structured explanations.
- **📄 Document Mastery:** Upload PDF textbooks or study guides. The bot can summarize entire chapters or answer specific questions from the text.
- **⚡ Ultra-Reliable Fallback (Dual-API):** 
    - **4-Tier Protection:** If the primary model fails, the bot cycles through a secondary model, and then repeats the *entire cycle* with a **Backup API Key**.
    - **Automatic Key Rotation:** Ensures 100% up-time even if your main account hits its rate limit.

### 🛰️ Admin Command Center V4 (The Hub)
- **💎 Glassmorphism UI:** A premium, translucent design with high-end micro-animations and a stunning "Live System Analysis" status indicator.
- **📊 Deep Analytics:** 
    - Real-time tracking of Active Users and Pro Conversions.
    - User Activity Wave Graphs (last 7 days).
    - Granular message breakdown (Total Texts vs. Images vs. Voices).
- **📢 Professional Broadcasts:** 
    - Send official announcements to all students with one click.
    - Automatic attachment of the **Official Study-It Graphic**.
    - **Smart Templates:** Pre-configured buttons for Updates, Maintenance, and News.
- **📱 Mobile Optimized:** Manage your entire educational platform from any device, anywhere.

### 🎨 Premium Marketing Web-App (Enhanced)
- **Glassy Aesthetic:** A sleek, fully animated Next.js landing page built with Tailwind, optimized for both desktop and mobile performance.
- **🖼️ Interactive Showcase:** High-fidelity "Live Preview" window showing real-world AI use cases with smooth transitions.
- **📬 Contact & Support:** Integrated **Web3Forms** support for students to send suggestions, bug reports, and feedback directly.
- **🚀 Mobile Optimized:** Drastically reduced GPU load by selectively hiding massive blurs on mobile, ensuring a silky-smooth scrolling experience.
- **Direct WhatsApp Funnel:** Includes a glowing WhatsApp button natively linked directly to `NEXT_PUBLIC_BOT_NUMBER` for instantaneous onboarding.
- **Dedicated Flow:** Independent `/register` route allowing seamless upgrading to the Pro Tier with instant backend sync to the bot.

### 🚀 Automated Student Onboarding (New)
- **⚡ Instant Pro Activation:** As soon as a student registers on the web-app, the bot sends an immediate "Welcome to Pro" message on WhatsApp.
- **🛠️ Self-Healing Catch-up:** If the bot goes offline, it automatically scans for missed registrations upon restart, ensuring no student is left behind.
- **📊 Individual Analytics:** Deep-dive into any student's profile to see their 7-day engagement wave and message type breakdown (Texts vs. Voices vs. Images).

### ⚖️ Advanced Quota System
- **🆓 Free Tier:** 5 successful AI inquiries per day for guests.
- **💎 Pro Tier:** 100 successful AI inquiries per day for registered students.
- **🛡️ Value-Delivery Guard:** Daily limits are only deducted for *successful* AI responses. Errors never cost the student a turn.

---

## 🛠️ Technical Architecture

### Core Bot (Node.js)
- **WhatsApp Engine:** `@whiskeysockets/baileys` (Multi-device support).
- **AI Integration:** `@google/genai` (Dual-Account Key Rotation).
- **Failover Logic:** 4-Step sequence (Primary-M1 → Primary-M2 → Backup-M1 → Backup-M2).
- **Database:** Supabase (PostgreSQL) for user state and message persistence.
- **Event Queue:** Upstash Redis (TCP `ioredis`) for 0-latency broadcast/registration processing.
- **Contact Form** Web3Forms for contact section on website.

### Web Admin (Next.js 14)
- **Framework:** Next.js App Router (React).
- **Styling:** Vanilla CSS + Tailwind for the Glassmorphism system.
- **Realtime:** Upstash Redis REST API (`@upstash/redis`) for cross-server instant queueing.
- **Security:** Server Actions for passcode verification (Passcode never exposed to client).

---

## 📁 Project Structure

```text
 study-it-v2/
 ├── index.js             # Core Bot Engine & WhatsApp Gateway
 ├── gemini.js            # AI Brain (Multimodal logic & Fallbacks)
 ├── database.js          # Database Controller (Quotas, History, Stats)
 ├── web/                 # Web App (Marketing Page & Admin Dashboard)
 │   ├── app/
 │   │   ├── admin/       # Dashboard V4 Implementation
 │   │   ├── register/    # Direct Student Onboarding & Pro Registration
 │   │   ├── page.tsx     # Premium Glassmorphism Product Landing Page
 │   │   └── actions.ts   # Secure Server-side Authentication
 │   ├── components/      # Modular UI (Hero, Navbar, Features, Showcase, Contact)
 │   └── globals.css      # Premium Design Tokens & Animations
 ├── announcement.jpg     # Official Multimedia Broadcast Asset
 ├── auth_info_baileys/   # Persistent WhatsApp session data
 └── README.md            # This Manual
 ```

---

## 🚀 Installation & Setup

### 1. Database Configuration (Supabase)
Create four tables in your Supabase project:

```sql
-- 1. Users Table (Stores student profiles & quotas)
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    jid TEXT UNIQUE,
    phone TEXT,
    name TEXT,
    email TEXT,
    is_registered BOOLEAN DEFAULT false,
    daily_usage INTEGER DEFAULT 0,
    last_usage_date TEXT, -- CRITICAL: For daily quota resets
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Messages Table (Stores chat history for AI memory)
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    jid TEXT,
    role TEXT, -- 'user' or 'ai'
    content TEXT,
    type TEXT DEFAULT 'text', -- 'text', 'image', 'audio', 'document'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Broadcasts Table (For Admin announcements)
CREATE TABLE broadcasts (
    id BIGSERIAL PRIMARY KEY,
    message TEXT,
    status TEXT DEFAULT 'pending', -- 'pending' or 'sent'
    target_jids JSONB DEFAULT NULL, -- NEW: For targeted broadcasts
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Registration Events Table (Triggers automated Pro messages)
CREATE TABLE registration_events (
    id BIGSERIAL PRIMARY KEY,
    jid TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

```

### 2. Database Security (Mandatory RLS)
To keep your student data safe, you MUST enable Row Level Security (RLS) in the Supabase SQL Editor:

```sql
-- Enable RLS on all tables to prevent unauthorized client access
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;

-- No public policies are needed! 
-- All database access is safely routed through the Next.js Server Actions 
-- and the Node.js Bot backend securely using the Supabase Service Role key (which enforces server-side bypass).
```

### 3. Environment Variables (.env)
Create a `.env` file in the **root** folder (See `.env.example`):
```env
GEMINI_API_KEY=your_google_ai_key
GEMINI_API_KEY_2=your_backup_google_ai_key
BOT_NUMBER=your_country_code_number_no_plus_signs # e.g. 94771234567
ADMIN_NUMBER=your_country_code_number_no_plus_signs # e.g. 94771234567
SUPABASE_URL=your_project_url
SUPABASE_KEY=your_service_role_key
REDIS_URL=your_upstash_tcp_url_starts_with_rediss # NEW: Upstash Redis TCP url
```

And a `.env.local` in the **web/** folder (See `web/.env.example`):
```env
SUPABASE_URL=your_project_url
ADMIN_PASSCODE=your_secret_passcode
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
UPSTASH_REDIS_REST_URL=your_upstash_rest_url      # NEW: Web API URL
UPSTASH_REDIS_REST_TOKEN=your_upstash_rest_token  # NEW: Web API Token
NEXT_PUBLIC_BOT_NUMBER=your_country_code_number_no_plus_signs # NEW: Frontend Bot Link
NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY=your_access_key            # NEW: Contact Support Key
```



## 🔐 Admin Dashboard Access

The **Study-It Admin Center** allows you to manage users, view real-time analytics, and send global broadcasts.

1. **URL:** Navigate to `http://localhost:3000/admin` (or your production URL).
2. **Authentication:** Enter the `ADMIN_PASSCODE` you defined in your `web/.env.local` file.
3. **Capabilities:**
   - **🔴 Live Broadcast:** Send official announcements to all WhatsApp students.
   - **📈 Analytics:** Track daily message volume, OCR scans, and voice notes.
   - **👥 User Management:** Search for students and view their specific usage history.
   - **💎 Pro Management:** Verify registration events and student status.

---

## ☁️ VPS Deployment Guide (Ubuntu / Oracle Cloud)

Follow these exact steps to host **Study-It** on a professional Linux VPS.

### 1. Update System & Install Dependencies
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git
sudo npm install -g pm2
```

### 2. Verify Installation
```bash
node -v
npm -v
pm2 -v
```

### 3. Clone & Install
```bash
git clone https://github.com/gimantha-dilshan/study-it.git
cd study-it
npm install
```

### 4. Configure Environment (The Terminal Way)
Because `.env` files contain sensitive keys, they are never uploaded to GitHub. You must create it manually on your server using the `nano` text editor:

```bash
nano .env
```
*Paste your environment variables (refer to `.env.example`), then press `CTRL+O`, `Enter`, and `CTRL+X` to save and exit.*

### 5. Start the Bot & Pairing
```bash
# Start and name the process
pm2 start index.js --name "study-it"

# View logs to get your pairing code
pm2 logs study-it
```
*Wait for the green **Pairing Code** to appear. Open WhatsApp on your phone > Linked Devices > Link with Phone Number and enter the code.*

### 6. Management Commands
```bash
# To stop the bot
pm2 stop study-it

# To restart the bot
pm2 restart study-it
```

---

## 🌐 Web Hosting Guide (Frontend & Dashboard)

The **Next.js web platform** (Marketing page, Registration, and Admin Dashboard) needs to be hosted separately. You have two professional options:

### Option 1: Vercel (Highly Recommended)
Vercel is the natural home for Next.js. It's free, has global CDN performance, and handles SSL automatically.
1. Create a [Vercel](https://vercel.com/) account and connect your GitHub repository.
2. Set the **Root Directory** to `web`.
3. Add all your environment variables from `web/.env.local` to the Vercel **Environment Variables** settings.
4. Click **Deploy**. Your site is now live!

### Option 2: VPS (Using PM2)
If you want to host the web app on the same VPS as your bot to save costs:

1. **Navigate to the web folder:**
   ```bash
   cd web
   ```
2. **Configure Production Environment:**
   Create a `.env` file inside the `web` folder:
   ```bash
   nano .env
   ```
   *Paste your `web/.env.local` contents here, save and exit.*
3. **Build & Start:**
   ```bash
   npm install
   npm run build
   pm2 start npm --name "study-it-web" -- start
   ```
4. **Accessing the Dashboard:**
   Once running, your site will be available on port `3000`. You can use a reverse proxy like **Nginx** to map it to a domain with SSL.

---

## 🛡️ Security & Privacy
- **Stateless AI:** Messages are processed in real-time. History is retrieved sparingly to maintain privacy.
- **Quota Protection:** Automated usage resets every midnight.
- **Admin Isolation:** Login is protected by a server-side verified passcode.

---

## 🛡️ License
Distributed under the **MIT License**. See `LICENSE` for more information.

## 🤝 Contact
**Gimantha Dilshan** - Developer
Project Link: [https://github.com/gimantha-dilshan/study-it-v2](https://github.com/gimantha-dishan/study-it)

---

*Study-it Education: Empowering the next generation of students with high-tech AI companionship.* 🌟🎓🏛️
