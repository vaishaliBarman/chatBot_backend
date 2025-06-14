import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is not set in .env file');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

app.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Invalid message format' });
  }

  try {
    const result = await model.generateContent(message);
    const response = await result.response.text();
    res.json({ reply: response });
    console.log('User:', message);
    console.log('Bot:', response);
  } catch (err) {
    console.error('Gemini API Error:', err);
    res.status(500).json({ error: 'Gemini API error', details: err.message });
  }
});

app.listen(5000, () => console.log('🚀 Server running at http://localhost:5000'));
