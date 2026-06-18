const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' })); 
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

// Sử dụng đúng endpoint chuẩn hóa của model gemini-pro ổn định nhất cho URL thuần
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

app.get('/', (req, res) => {
    res.send("Server đang chạy tốt!");
});

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!GEMINI_API_KEY) {
            return res.status(500).json({ reply: "Lỗi: Chưa nhận được API Key trên Render." });
        }

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: message }]
                }]
            })
        });
        
        const data = await response.json();
        
        if (data.error) {
            console.error("Google Error:", data.error);
            return res.status(400).json({ reply: `Google báo lỗi: ${data.error.message}` });
        }

        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
            const aiResponse = data.candidates[0].content.parts[0].text;
            return res.json({ reply: aiResponse });
        } else {
            console.error("Cấu trúc trả về lạ:", data);
            return res.json({ reply: "Không nhận được phản hồi đúng cấu trúc từ AI." });
        }

    } catch (error) {
        console.error("System Error:", error);
        res.status(500).json({ reply: "Lỗi hệ thống Backend không thể kết nối." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
