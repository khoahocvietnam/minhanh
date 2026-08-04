export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'Chưa cấu hình GEMINI_API_KEY trên Vercel' });
        }

        // Sử dụng model gemini-2.5-flash-lite theo yêu cầu của bạn
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;
        
        const payload = {
            contents: [{ parts: [{ text: message }] }],
            system_instruction: {
                parts: [{ text: "Bạn tên là Scorey, một chú voi AI thông minh làm gia sư tiếng Anh cho học sinh cấp 3 tại Việt Nam ôn thi THPT Quốc Gia. Hãy luôn trả lời bằng tiếng Việt, giải thích ngữ pháp ngắn gọn, dễ hiểu, dùng ngôn ngữ GenZ thân thiện, hay dùng emoji. Câu trả lời dưới 100 chữ." }]
            }
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content) {
            const aiText = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ text: aiText });
        } else {
            console.error("Gemini API Error Response:", JSON.stringify(data));
            return res.status(500).json({ error: data.error?.message || 'Không nhận được phản hồi từ Gemini' });
        }
    } catch (error) {
        console.error("Server System Error:", error);
        return res.status(500).json({ error: 'Lỗi hệ thống server' });
    }
}
