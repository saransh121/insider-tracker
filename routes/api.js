const express = require('express');
const router = express.Router();
const { fetchInsiderTradingData } = require('../services/fmpService');
const { fetchRealTimeStockPrice } = require('../services/fmpService');

router.get('/stocks', async (req, res) => {
    const { symbol } = req.query; // Example: /api/stocks?symbol=MSFT
    if (!symbol) {
        return res.status(400).json({ error: 'Symbol is required' });
    }

    try {
        const data = await fetchInsiderTradingData(symbol);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

router.get('/quote', async (req, res) => {
    const { symbol } = req.query;
    if (!symbol) {
        return res.status(400).json({ error: 'Symbol is required' });
    }

    try {
        const data = await fetchRealTimeStockPrice(symbol);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch real-time stock price' });
    }
});

module.exports = router;
