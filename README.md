# Study-It: The Ultimate AI Educational Assistant 🎓🚀✨

**Study-It** is a professional, multimodal WhatsApp educational platform designed to empower students with instant, high-quality learning assistance. Built with a "Student-First" philosophy, it combines the power of **Gemini 2.5 Flash** with a sleek, real-time **Admin Dashboard (V4)** for total educational control.

---

## 🌟 Key Features

### 🧠 Multimodal AI Intelligence (The Brain)
- **📸 Smart OCR Analysis:** Send a photo of any math problem, science equation, or essay prompt. The bot provides step-by-step logic, not just answers.
- **🎙️ AI Voice Partner:** Send a voice note asking a question. Study-It listens and responds with clear, structured explanations.
- **📄 Document Mastery:** Upload PDF textbooks or study guides. The bot can summarize entire chapters or answer specific questions from the text.
- **⚡ Reliability System:** Automated model fallback (Flash → Flash Lite) ensures the bot is always online, even during high API demand.

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

### ⚖️ Advanced Quota System
- **🆓 Free Tier:** 5 successful AI inquiries per day for guests.
- **💎 Pro Tier:** 100 successful AI inquiries per day for registered students.
- **🛡️ Value-Delivery Guard:** Daily limits are only deducted for *successful* AI responses. Errors never cost the student a turn.

---

## 🛠️ Technical Architecture

### Core Bot (Node.js)
- **WhatsApp Engine:** `@whiskeysockets/baileys` (Multi-device support).
- **AI Integration:** `@google/genai` (Gemini 2.5 SDK).
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
Create three tables in your Supabase project:

```sql
-- 1. Users Table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    jid TEXT UNIQUE,
    phone TEXT,
    name TEXT,
    email TEXT,
    is_registered BOOLEAN DEFAULT false,
    daily_usage INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Messages Table
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    jid TEXT,
    role TEXT, -- 'user' or 'model'
    content TEXT,
    type TEXT DEFAULT 'text', -- 'text', 'image', 'audio', 'document'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Broadcasts Table
CREATE TABLE broadcasts (
    id BIGSERIAL PRIMARY KEY,
    message TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Environment Variables (.env)
Create a `.env` file in the **root** folder:
```env
GEMINI_API_KEY=your_google_ai_key
ADMIN_NUMBER=your_whatsapp_number@s.whatsapp.net
SUPABASE_URL=your_project_url
SUPABASE_KEY=your_service_role_key
```

And a `.env.local` in the **web/** folder:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
ADMIN_PASSCODE=your_secret_passcode
```

### 3. Launch
```bash
# Start the WhatsApp Bot
npm install
node index.js

# Start the Admin Dashboard
cd web
npm install
npm run dev
```

---

## 🛡️ Security & Privacy
- **Stateless AI:** Messages are processed in real-time. History is retrieved sparingly to maintain privacy.
- **Quota Protection:** Automated usage resets every midnight.
- **Admin Isolation:** Login is protected by a server-side verified passcode.

---

*Study-it Education: Empowering the next generation of students with high-tech AI companionship.* 🌟🎓🏛️
