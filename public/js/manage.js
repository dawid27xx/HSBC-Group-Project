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
        alert('Error fetching portfolio.');
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
            alert('Failed to load portfolio data.');
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
            alert('Failed to load asset composition data.');
        });
});

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



// document.getElementById('registerForm').addEventListener('submit', function(event) {
//     event.preventDefault();
    
//     const username = document.getElementById('registerUsername').value;
//     const password = document.getElementById('registerPassword').value;

//     fetch('/auth/register', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ username: username, password: password })
//     }).then(response => {
//         if (!response.ok) {
//             throw new Error('Registration failed. Please enter a unique username.');
//         }
//         return response.json();
//     })
//     .then(data => {
//         if (data.success) {
//             // add info 
//             alert('Registration successful! You can now log in.');
//         } else {
//             alert('Registration failed: ' + (data.message || 'Unknown error.'));
//         }
//     })
//     .catch(error => {
//         alert('An error occurred: ' + error.message);
//     });
// });


