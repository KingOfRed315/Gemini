const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors()); 
app.use(express.json());

// SỬA DÒNG NÀY: Giấu API Key vào hệ thống của Render, không để lộ trên GitHub
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }]
            })
        });
        
        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text;
        
        res.json({ reply: aiResponse });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi hệ thống hoặc Key không hợp lệ." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server đang chạy ở cổng ${PORT}`));