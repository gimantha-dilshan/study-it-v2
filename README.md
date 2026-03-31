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

### Web Admin (Next.js 14)
- **Framework:** Next.js App Router (React).
- **Styling:** Vanilla CSS + Tailwind for the Glassmorphism system.
- **Realtime:** Supabase Subscription for live broadcast triggers.
- **Security:** Server Actions for passcode verification (Passcode never exposed to client).

---

## 📁 Project Structure

```text
study-it-v2/
├── index.js             # Core Bot Engine & WhatsApp Gateway
├── gemini.js            # AI Brain (Multimodal logic & Fallbacks)
├── database.js          # Database Controller (Quotas, History, Stats)
├── web/                 # Admin Dashboard (Next.js Project)
│   ├── app/
│   │   ├── admin/       # Dashboard V4 Implementation
│   │   └── actions.ts   # Secure Server-side Authentication
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
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;

-- No public policies on 'users' or 'messages' — all access goes through
-- Server Actions / Bot which use the service_role key (bypasses RLS).

-- Supabase Realtime requires SELECT policies to deliver postgres_changes events.
-- Without these, the bot's Realtime listeners will silently receive nothing.
CREATE POLICY "Allow realtime broadcast reads" ON broadcasts FOR SELECT USING (true);
CREATE POLICY "Allow realtime registration reads" ON registration_events FOR SELECT USING (true);

-- Enable Realtime replication on event-driven tables
ALTER PUBLICATION supabase_realtime ADD TABLE broadcasts;
ALTER PUBLICATION supabase_realtime ADD TABLE registration_events;
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
```

And a `.env.local` in the **web/** folder (See `web/.env.example`):
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
ADMIN_PASSCODE=your_secret_passcode
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Launch
```bash
# Start the WhatsApp Bot (Now with automated BOT_NUMBER pairing)
npm install
node index.js

# Start the Admin Dashboard
cd web
npm install
npm run dev
```

---

## ☁️ Server Deployment (Oracle Cloud / VPS)
**Study-It** is optimized for headless hosting. When deploying to a server:
1. Ensure `BOT_NUMBER` is set in your `.env`.
2. Run `node index.js`. A large, green **Pairing Code** will be displayed in the terminal.
3. Open WhatsApp on your phone > Linked Devices > Link with Phone Number.
4. Enter the code shown in the terminal.
5. Use `pm2` to keep the bot alive: `pm2 start index.js --name "study-it-bot"`

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
Project Link: [https://github.com/your-username/study-it](https://github.com/your-username/study-it)

---

*Study-it Education: Empowering the next generation of students with high-tech AI companionship.* 🌟🎓🏛️
