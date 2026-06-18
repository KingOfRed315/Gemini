const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/generative-ai');

const app = express();
app.use(cors({ origin: '*' })); 
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

// Khởi tạo Google Gen AI bằng thư viện chính thức
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

app.get('/', (req, res) => {
    res.send("Server AI đang chạy hoàn hảo!");
});

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!GEMINI_API_KEY) {
            return res.status(500).json({ reply: "Lỗi: Chưa cấu hình GEMINI_API_KEY trên Render." });
        }

        // Gọi model gemini-1.5-flash bằng hàm cấu trúc chuẩn của Google
        const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent({
            contents: [{ parts: [{ text: message }] }]
        });
        
        const aiResponse = result.response.text;
        res.json({ reply: aiResponse });

    } catch (error) {
        console.error("System Error:", error);
        res.status(500).json({ reply: "Lỗi hệ thống Backend không thể xử lý tin nhắn." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server đang chạy ở cổng ${PORT}`));
