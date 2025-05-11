# Telegram Gemini Bot

A simple Telegram chatbot using Google Gemini (Gemini API) as its AI, deployable for free on Vercel.

## Features
- Telegram webhook-based bot
- Uses Gemini API for AI responses
- Deployable on Vercel (serverless)

## Setup

1. **Clone the repository**
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Set environment variables:**
   - `TELEGRAM_BOT_TOKEN`: Your Telegram bot token
   - `GEMINI_API_KEY`: Your Gemini API key
   
   On Vercel, set these in the dashboard under Project Settings > Environment Variables.

4. **Deploy to Vercel:**
   - Push your code to GitHub and connect to Vercel, or use `vercel` CLI.

5. **Set Telegram webhook:**
   After deploying, set your webhook:
   ```sh
   curl -F "url=https://your-vercel-url.vercel.app/api/telegram" "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook"
   ```

## Usage
- Start a chat with your bot on Telegram.
- Send a message, and Gemini will reply! 