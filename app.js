const express = require('express');
require('dotenv').config({path: './.env'});
const app = express();
const userRoutes = require('./routes/userRoutes')

app.use(express.json());

app.use('/users', userRoutes);

const PORT = 3000;

app.listen(PORT, () => {
console.log(`Server running at http://localhost:${PORT}/`);
});