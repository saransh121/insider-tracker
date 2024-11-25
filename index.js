const express = require('express');
const apiRoutes = require('./routes/api');
const path = require('path');

const app = express();

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api', apiRoutes);

// Start the server
app.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
});
