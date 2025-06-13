import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai"; 
import fallbackFAQs from "./fallbackFaqs.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "आप Moodle विशेषज्ञ सहायक हैं। सभी उत्तर हिंदी में दें।" },
        { role: "user", content: userMessage }
      ]
    });

    const reply = chatCompletion.choices[0].message.content;
    res.json({ reply });

  } catch (error) {
    console.error("OpenAI error:", error.message);

    // Try to find a fallback answer
    const matched = fallbackFAQs.find(faq =>
      userMessage.toLowerCase().includes(faq.question.toLowerCase().slice(0, 10))
    );

    if (matched) {
      res.json({ reply: matched.answer });
    } else {
      res.status(500).json({
        reply: "सर्वर से कनेक्शन में त्रुटि हुई। कृपया कुछ समय बाद पुनः प्रयास करें।"
      });
    }
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
