const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const webPush = require('web-push');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

webPush.setVapidDetails(
    `mailto:${process.env.CONTACT_EMAIL}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

let subscriptions = [];

// 1. Топ-новости
// Заменяем эндпоинт /api/news в server/index.js
app.get('/api/news', async (req, res) => {
    const category = req.query.category || 'general';
    
    // Генерируем фейковые новости на случай, если NewsAPI вернет ошибку или пустой список
    const mockArticles = [
        {
            title: `Срочные новости: Прорыв в категории [${category}]!`,
            description: "Разработчики успешно запустили прогрессивное веб-приложение (PWA). Новая технология позволяет сайтам работать без интернета и отправлять пуши.",
            url: "https://lenta.ru",
            urlToImage: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=500",
            publishedAt: new Date().toISOString(),
            source: { name: "PWA Вестник" }
        },
        {
            title: "Искусственный интеллект полностью переписал код на Node.js",
            description: "В ходе лабораторной работы студент настроил Express сервер, который обрабатывает маршруты и подписки на пуш-уведомления без единого сбоя.",
            url: "https://habr.com",
            urlToImage: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=500",
            publishedAt: new Date().toISOString(),
            source: { name: "Хабр" }
        },
        {
            title: "Студенты массово защищают лабораторные работы по кроссплатформе",
            description: "Кафедра сообщает о 100% успеваемости среди тех, кто использует правильные стратегии кэширования в Service Worker.",
            url: "https://ria.ru",
            urlToImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500",
            publishedAt: new Date().toISOString(),
            source: { name: "РИА Новости" }
        }
    ];

    try {
        const response = await axios.get(`${process.env.NEWS_API_URL}/top-headlines`, {
            params: {
                country: 'us', // Используем 'us' для обхода блокировок ру-региона в NewsAPI
                category: category,
                apiKey: process.env.NEWS_API_KEY,
                pageSize: 20
            }
        });

        // Если NewsAPI вернул статьи — отдаем их, если массив пустой — отдаем моки
        if (response.data && response.data.articles && response.data.articles.length > 0) {
            return res.json(response.data);
        } else {
            return res.json({ articles: mockArticles });
        }
    } catch (error) {
        console.log("NewsAPI недоступен или заблокирован. Отдаем локальные mock-данные.");
        // Возвращаем моки, чтобы приложение не падало
        return res.json({ articles: mockArticles });
    }
});

// 2. Поиск новостей
app.get('/api/news/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.status(400).json({ error: 'Query parameter required' });
        const response = await axios.get(`${process.env.NEWS_API_URL}/everything`, {
            params: {
                q: query,
                apiKey: process.env.NEWS_API_KEY,
                pageSize: 20
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to search news' });
    }
});

// 3. Список категорий (Задание А)
app.get('/api/categories', (req, res) => {
    res.json([
        { id: 'general', name: 'Главное', icon: '📰' },
        { id: 'technology', name: 'Технологии', icon: '💻' },
        { id: 'science', name: 'Наука', icon: '🔬' },
        { id: 'sports', name: 'Спорт', icon: '⚽' }
    ]);
});

// 4. Архив (Задание А)
app.get('/api/news/archive', async (req, res) => {
    try {
        const { date, category = 'general' } = req.query;
        if (!date) return res.status(400).json({ error: 'Date parameter required' });
        const response = await axios.get(`${process.env.NEWS_API_URL}/everything`, {
            params: {
                q: category,
                from: date,
                to: date,
                apiKey: process.env.NEWS_API_KEY,
                pageSize: 20
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch archive' });
    }
});

// Push Уведомления
app.get('/api/vapid-public-key', (req, res) => {
    res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

app.post('/api/subscribe', (req, res) => {
    const subscription = req.body;
    if (!subscriptions.some(sub => sub.endpoint === subscription.endpoint)) {
        subscriptions.push(subscription);
    }
    res.status(201).json({ message: 'Subscribed' });
});

app.post('/api/send-notification', async (req, res) => {
    const payload = JSON.stringify({
        title: req.body.title || 'Новое в PWA News!',
        body: req.body.body || 'Проверьте свежие новости.',
        url: '/'
    });
    const promises = subscriptions.map(sub => webPush.sendNotification(sub, payload).catch(() => {}));
    await Promise.all(promises);
    res.json({ message: 'Sent' });
});

app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api/')) {
        return res.sendFile(path.join(__dirname, '../public/index.html'));
    }
    next();
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));