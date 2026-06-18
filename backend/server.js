const express = require('express');
const cors = require('cors');

const app = express();

// Cấu hình CORS mở rộng để tránh bị chặn request từ Vercel
app.use(cors({
    origin: '*',
    methods: ['POST', 'GET'],
    allowedHeaders: ['Content-Type']
})); 

app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash/generateContent?key=${GEMINI_API_KEY}`;

// Thêm một đường dẫn GET để kiểm tra xem server sống hay chết
app.get('/', (req, res) => {
    res.send("Server AI đang hoạt động bình thường!");
});

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!GEMINI_API_KEY) {
            return res.status(500).json({ reply: "Lỗi: Chưa cấu hình GEMINI_API_KEY trên Render." });
        }

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }]
            })
        });
        
        const data = await response.json();
        
        // Kiểm tra nếu Google trả về cấu trúc lỗi
        if (data.error) {
            console.error("Google API Error:", data.error);
            return res.status(400).json({ reply: `Lỗi từ Google: ${data.error.message}` });
        }

        const aiResponse = data.candidates[0].content.parts[0].text;
        res.json({ reply: aiResponse });
    } catch (error) {
        console.error("System Error:", error);
        res.status(500).json({ reply: "Lỗi hệ thống Backend không thể xử lý tin nhắn." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server đang chạy ở cổng ${PORT}`));
