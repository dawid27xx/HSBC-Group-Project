const express = require('express');
require('dotenv').config({path: './.env'});
const app = express();
const assetRoutes = require('./routes/assetRoutes')

app.use(express.json());

app.use('/assets', assetRoutes);

const PORT = 3000;

app.listen(PORT, () => {
console.log(`Server running at http://localhost:${PORT}/`);
});