import fetch from 'node-fetch';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = process.env.GEMINI_API_URL || `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `you are an event-to-google-calendar-link generator.

i'll give you any natural language description of an event. all times i mention are in malaysia time (gmt+8, asia/kuala_lumpur). extract the following details:
- event title
- start date and time
- end date and time
- location
- description

generate a clickable google calendar link using this format:
https://calendar.google.com/calendar/render?action=TEMPLATE&text=...&dates=...&details=...&location=...&sf=true&output=xml

make sure:
- all values are url encoded
- dates are formatted as yyyymmddthhmmssz in utc timezone (convert from malaysia time if needed)
- if i don't mention a location or description, leave them empty but still include the parameters
- return only the final link, no extra text, no formatting, just the raw link

if the user asks anything outside this scope, reply in all lowercase, in a machiavellian, ambitious, and direct style inspired by steve jobs, elon musk, and peter thiel. do not use dashes or markdown. be brief, bold, and challenging. do not mention calendar or events unless relevant. dont force me to build anything, just asnwer me in simple direct thought provoking manner`;

const HELP_MESSAGE = `google calendar link bot help

- describe your event in one message
- include event title, start and end date/time, location, and description if needed
- all times must be in malaysia time (gmt+8)
- i will convert to utc and reply with a google calendar link
- if location or description is missing, those fields will be empty
- reply will only be the link, no extra text`;

export default async (req, res) => {
  // Log the current date/time
  const now = new Date();
  console.log('Date.now():', Date.now());
  console.log('new Date():', now.toString());
  console.log('new Date().toISOString():', now.toISOString());

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const body = req.body;
  const message = body?.message?.text;
  const chatId = body?.message?.chat?.id;

  if (!message || !chatId) {
    res.status(200).send('No message');
    return;
  }

  // Handle help keyword anywhere in the message
  if (message.toLowerCase().includes('help')) {
    console.log('Help detected, sending help message.');
    try {
      const telegramResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: HELP_MESSAGE
        })
      });
      const telegramData = await telegramResponse.json();
      console.log('Telegram sendMessage response:', telegramData);
    } catch (err) {
      console.error('Error sending help message to Telegram:', err);
    }
    res.status(200).send('OK');
    return;
  }

  // Call Gemini API with system prompt and user message
  const geminiResponse = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
        { role: 'user', parts: [{ text: message }] }
      ]
    })
  });

  const geminiData = await geminiResponse.json();
  const reply = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "sorry, i couldn't get a response.";

  // Send reply to Telegram
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: reply
    })
  });

  res.status(200).send('OK');
}; 