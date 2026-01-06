require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('public'));

// Берем настройки из .env
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.VOICE_ID;

wss.on('connection', (ws) => {
    console.log('Пользователь подключился (Режим Попугая)');

    ws.on('message', async (message) => {
        try {
            const userText = message.toString();
            console.log(`Ты сказал: ${userText}`);

            // === ВМЕСТО НЕЙРОСЕТИ ПРОСТО ПОВТОРЯЕМ ТЕКСТ ===
            // Можешь поменять фразу в кавычках, если хочешь
            const aiResponse = userText; 
            
            // Отправляем текст обратно на экран
            ws.send(JSON.stringify({ type: 'text', content: "Повторяю: " + aiResponse }));

            // Генерируем голос
            const elevenUrl = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream?optimize_streaming_latency=3`;
            
            const response = await fetch(elevenUrl, {
                method: 'POST',
                headers: {
                    'xi-api-key': ELEVENLABS_API_KEY,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: aiResponse,
                    model_id: "eleven_multilingual_v2",
                    voice_settings: { stability: 0.5, similarity_boost: 0.8 }
                })
            });

            if (!response.ok) {
                console.error("Ошибка ElevenLabs:", await response.text());
                return;
            }

            const arrayBuffer = await response.arrayBuffer();
            ws.send(arrayBuffer); 

        } catch (error) {
            console.error('Ошибка:', error);
        }
    });
});

server.listen(3000, '0.0.0.0', () => {
    console.log('Сервер-Попугай запущен! Порт 3000');
})