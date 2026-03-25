# Study-It WhatsApp Bot 🎓✨

Study-It is an educational WhatsApp bot powered by **Gemini 2.0 Flash Lite**. It helps students solve homework problems, explain complex topics, and provides step-by-step guidance, all through WhatsApp.

## Features
- **📸 Homework Scanner**: Send photos of math, science, or any subject's homework for instant analysis.
- **💬 AI Tutor**: Ask any question and get clear, encouraging, and detailed explanations.
- **🧠 Step-by-Step Logic**: The bot doesn't just give answers; it helps you understand "how" to solve them.
- **📱 Easy Connection**: Connects to your WhatsApp via a pairing code or QR code.

## Tech Stack
- **Framework**: [Baileys](https://baileys.wiki) (WhatsApp Web API)
- **AI**: [Google Gemini SDK](https://github.com/google-gemini/generative-ai-js) (@google/genai)
- **Database**: Pure JSON File (via `fs.promises`)
- **Language**: Node.js (ES Modules)

## Getting Started

### Prerequisites
- Node.js installed on your computer.
- A Gemini API Key from [Google AI Studio](https://aistudio.google.com/).

### Installation
1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd study-it
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your key:
   ```env
   GEMINI_API_KEY=your_key_here
   ```

### Running the Bot
```bash
npm start
```
1. Enter your WhatsApp phone number (with country code) when prompted.
2. Link the provided **Pair Code** on your phone (WhatsApp -> Settings -> Linked Devices -> Link with phone number).

## Admin Commands 🛡️
You can control the bot remotely by setting your phone number in the `.env` file:
```env
ADMIN_NUMBER=947xxxxxxxx
```
*Note: You can use your phone number or your WhatsApp LID.*

### Available Commands (Admin Only):
- **`.stats`**: View total users and message statistics.
- **`.broadcast [message]`**: Send a global announcement to all users who have messaged the bot.

## Contributing
Feel free to open issues or pull requests to improve the bot's features!

## License
ISC
