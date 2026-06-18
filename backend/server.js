const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' })); 
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

// Hàm gọi API lõi của Google
async function callGoogleAPI(modelName, message) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: message }] }]
        })
    });
    return await response.json();
}

app.get('/', (req, res) => {
    res.send("Server AI đang chạy tốt!");
});

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!GEMINI_API_KEY) {
            return res.status(500).json({ reply: "Lỗi: Chưa nhận được API Key trên Render." });
        }

        console.log("Đang thử gọi với gemini-1.5-flash...");
        let data = await callGoogleAPI('gemini-1.5-flash', message);

        // Nếu flash báo lỗi không tìm thấy model, tự động chuyển sang thử gemini-pro
        if (data.error && (data.error.message.includes('not found') || data.error.status === 'INVALID_ARGUMENT')) {
            console.log("Mẫu flash bị từ chối. Đang tự động chuyển sang gemini-pro...");
            data = await callGoogleAPI('gemini-pro', message);
        }

        // Kiểm tra kết quả cuối cùng
        if (data.error) {
            console.error("Google Error:", data.error);
            return res.status(400).json({ reply: `Google báo lỗi: ${data.error.message}` });
        }

        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
            const aiResponse = data.candidates[0].content.parts[0].text;
            return res.json({ reply: aiResponse });
        }

        return res.json({ reply: "Không nhận được cấu trúc phản hồi chuẩn từ Google." });

    } catch (error) {
        console.error("System Error:", error);
        res.status(500).json({ reply: "Lỗi hệ thống Backend không thể kết nối." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server đang chạy ở cổng ${PORT}`));
