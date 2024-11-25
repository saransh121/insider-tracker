const express = require('express');
const apiRoutes = require('./routes/api');

const app = express();

app.use('/api', apiRoutes);

app.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
});
