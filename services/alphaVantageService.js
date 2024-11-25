 
const axios = require('axios');

const API_KEY = '7N5T2PC19L1QCVL1'; // Replace with your actual API key
const BASE_URL = 'https://www.alphavantage.co/query';

const fetchInsiderTradingData = async (symbol) => {
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                function: 'INSIDER_ACTIVITY',
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
