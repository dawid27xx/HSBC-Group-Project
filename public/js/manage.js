document.addEventListener('DOMContentLoaded', function () {
    // Get the portfolio ID from localStorage
    const portfolioId = localStorage.getItem('portfolioId');
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const payload = jwt_decode(token);
            if (payload.username) {
                document.getElementById('username').textContent = payload.username;
            }
        } catch (e) {
            console.error('Invalid token', e);
        }
    }

    if (!portfolioId) {
    showModal('Error fetching portfolio.');
        window.location.href = '/index.html';
    } 
    
    if (portfolioName) {
        document.getElementById('portfolioName').textContent = portfolioName;
    }

    if (portfolioExchange) {
        document.getElementById('portfolioExchange').textContent = portfolioExchange;
    }

    // Fetch the cumulative portfolio data for the line chart
    fetch(`/portfolio/portfolio/getCumulativePricesforPortfolio/${portfolioId}`, {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.dates && data.values) {
                renderCumulativeGrowthChart(data.dates, data.values);
            } else {
                console.error('Invalid data structure for cumulative portfolio value');
            }
        })
        .catch(error => {
            console.error('Error fetching cumulative portfolio data:', error);
            showModal('Failed to load portfolio data.');
        });

    // Fetch asset composition data for the donut chart
    fetch(`portfolio/asset/${portfolioId}`, {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data && Array.isArray(data)) {
                renderAssetCompositionChart(data);
            } else {
                console.error('Invalid asset composition data');
            }
        })
        .catch(error => {
            console.error('Error fetching asset composition data:', error);
            showModal('Failed to load asset composition data.');
        });

    const table2 = document.getElementById('transactionTable').getElementsByTagName('tbody')[0];

    

    // update url
    fetch(`/transaction/transactionByPortfolio/${portfolioId}`, {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => response.json())
    .then(data => {
        data = data.reverse();
        // 
        data.forEach((p) => { 
            // date we're getting: "datetime": "2025-08-29T09:01:28.000Z"
            // new Date(date) <- converts it to standard format that js can understand
            let date = new Date(p.datetime); 
            // options for formatting the date
            const options = { year: 'numeric', month: 'short' , day: 'numeric', hour: '2-digit', minute: '2-digit' };
            // function that converts date objects to strings
            date = date.toLocaleDateString('en-US', options);
            const newRow = table2.insertRow();
            const transactionType = newRow.insertCell(0);
            const quantity = newRow.insertCell(1);
            const dateTime = newRow.insertCell(2);
            transactionType.innerHTML = p.transaction_type.toUpperCase();
            quantity.innerHTML = p.quantity;
            dateTime.innerHTML = date;
        })
    })
});

const token = localStorage.getItem('token');
    if (token) {
        try {
            const payload = jwt_decode(token);
            if (payload.username) {
                document.getElementById('username').textContent = payload.username;
            }
        } catch (e) {
            console.error('Invalid token', e);
        }
    }

function renderCumulativeGrowthChart(dates, values) {
    const ctx = document.getElementById('cumulativeGrowthChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Cumulative Growth',
                data: values,
                fill: false,
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.1,
                pointRadius: 5,
                pointBackgroundColor: 'rgba(75, 192, 192, 1)',
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    },
                    ticks: {
                        autoSkip: true,
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Net Worth (GBP)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
            },
        }
    });
}

const colorPalette = [
    'rgba(75, 192, 192, 0.7)', // Light Teal
    'rgba(153, 102, 255, 0.7)', // Light Purple
    'rgba(255, 159, 64, 0.7)', // Light Orange
    'rgba(54, 162, 235, 0.7)', // Light Blue
    'rgba(255, 99, 132, 0.7)', // Light Red
    'rgba(255, 205, 86, 0.7)', // Light Yellow
    'rgba(201, 203, 207, 0.7)'  // Light Grey
];

function renderAssetCompositionChart(assets) {
    const ctx = document.getElementById('assetCompositionChart').getContext('2d');
    const labels = assets.map(asset => asset.ticker);
    const data = assets.map(asset => asset.quantity);
    const backgroundColors = generateColorPalette(assets.length);
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Asset Composition',
                data: data,
                backgroundColor: backgroundColors,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return tooltipItem.label + ': ' + tooltipItem.raw + ' units';
                        }
                    }
                }
            }
        }
    });
}

function generateColorPalette(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
        colors.push(colorPalette[i % colorPalette.length]);
    }
    return colors;
}


const portfolioId = localStorage.getItem('portfolioId');
const portfolioName = localStorage.getItem('portfolioName');
const portfolioExchange = localStorage.getItem('portfolioExchange');

document.getElementById('addAssetForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const quantity = document.getElementById('addQuantityInput').value;
    const ticker = document.getElementById('addTickerInput').value;

    fetch('/portfolio/asset', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({ portfolio_id: portfolioId, ticker: ticker, quantity: quantity })
    }).then(response => {
        if (!response.ok) {
            throw new Error('Failed to add asset.');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            showModal('Asset added successfully!', 'success');
        } else {
            showModal('Failed to add asset: ' + (data.error || 'Unknown error.'));
        }
    })
    .catch(error => {
    showModal('An error occurred: ' + error.message);
    });
});

document.getElementById('transactionForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const ticker = document.getElementById('transactionTickerInput').value;
    const transactionTypeElement = document.getElementById('transactionTypeInput');
    const transactionType = transactionTypeElement.options[transactionTypeElement.selectedIndex].text;
    const quantity = parseInt(document.getElementById('transactionQuantityInput').value);

    fetch('/portfolio/asset', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({ portfolio_id: portfolioId, ticker: ticker, transaction_type: transactionType, quantity: quantity })
    }).then(response => {
        if (!response.ok) {
            throw new Error('Failed to make transaction.');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            showModal('Transaction made successfully!', 'success');
        } else {
            showModal('Failed to make transaction: ' + (data.error || 'Unknown error.'));
        }
    })
    .catch(error => {
    showModal('An error occurred: ' + error.message);
    });
});
