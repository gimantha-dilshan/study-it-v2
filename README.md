# Study-It: Cloud-Powered AI Tutor 🎓✨

Study-It is a next-generation educational WhatsApp bot designed to help students learn faster, solve homework, and understand complex concepts 24/7. Now with **Cloud Persistence** and a **Premium Registration Portal**.

---

## 🚀 Key Features

- **📸 Homework Scanner**: Send photos of math, science, or any subject's homework for instant AI analysis.
- **💬 2.5 Flash Lite Intelligence**: Powered by `gemini-2.5-flash-lite` for lightning-fast, encouraging, and detailed explanations.
- **☁️ Supabase Cloud Integration**: Real-time message counts and tiered daily limits (Free vs. Registered).
- **🌐 Next.js Registration Portal**: A beautiful, glassmorphism web app for users to "Level Up" their daily limits.
- **🛡️ Smart Phone Detection**: Automatically detects the "real" phone number of users with private WhatsApp LIDs for easy registration.

---

## 🏗️ Project Structure

- **`/` (Root)**: The WhatsApp bot logic (Node.js + Baileys).
- **`/web`**: The Next.js 16 registration website.
- **`/database.js`**: Unified database controller for Supabase.
- **`/gemini.js`**: AI tutor logic with WhatsApp-optimized formatting.

---

## 🛠️ Quick Setup (Bot)

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Environment Variables**: Create a `.env` file in the root:
   ```env
   GEMINI_API_KEY=your_key_here
   ADMIN_NUMBER=947xxxxxxxx
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   ```
3. **Start the Bot**:
   ```bash
   npm start
   ```

---

## 🌍 Deployment

- **Website**: Deploy the `/web` directory to **Vercel** with matching env vars.
- **Bot**: Deploy to any **Bot Panel** or VPS running Node.js 18+.

---

## 🏁 How it Works
1. **User** messages the bot.
2. **Bot** creates a profile in Supabase and tracks usage.
3. **User** hits their daily limit (5 messages).
4. **User** visits your website, types their **Phone Number**, and clicks "Level Up".
5. **Bot** instantly recognizes them and grants 50 messages/day! 🚀

---

**Developed with ❤️ for Students.** ✨📚🤓
