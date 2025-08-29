const jwt = require('jsonwebtoken');

const token = localStorage.getItem('token');
if (token) {
    try {
        const payload = jwt.decode(token);
        if (payload.username) {
            document.getElementById('username').textContent = payload.username;
        }
    } catch (e) {
        console.error('Invalid token', e);
        alert('Authentication error - please sign in again.');
        window.location.href = '/auth_page.html';
    }
}

const portfolioId = localStorage.getItem('portfolioId');
const portfolioName = localStorage.getItem('portfolioName');
const portfolioExchange = localStorage.getItem('portfolioExchange');

if (!portfolioId) {
    alert('Error fetching portfolio.');
    window.location.href = '/index.html';
} 

if (portfolioName) {
    document.getElementById('portfolioName').textContent = portfolioName;
}

if (portfolioExchange) {
    document.getElementById('portfolioExchange').textContent = portfolioExchange;
}


