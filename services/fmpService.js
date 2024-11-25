const axios = require('axios');

const API_KEY = 'BILvAu2fEAMDlFsLiyYL6jFIluaesdPm'; // Replace with your actual API key
const BASE_URL = 'https://financialmodelingprep.com/api/v4';

const fetchInsiderTradingData = async (symbol) => {
    try {
        const response = await axios.get(`${BASE_URL}/insider-roaster`, {
            params: {
                symbol,
                apikey: API_KEY,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching insider trading data:', error.message);
        throw error;
    }
};

module.exports = {
    fetchInsiderTradingData,
};


const fetchRealTimeStockPrice = async (symbol) => {
    try {
        const response = await axios.get(`https://financialmodelingprep.com/api/v3/quote/${symbol}`, {
            params: { apikey: API_KEY },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching real-time stock price:', error.message);
        throw error;
    }
};

module.exports = {
    fetchRealTimeStockPrice,
};