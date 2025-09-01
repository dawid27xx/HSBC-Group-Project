document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");
  const portfolioId = localStorage.getItem("portfolioId");
  const portfolioName = localStorage.getItem("portfolioName");
  const portfolioExchange = localStorage.getItem("portfolioExchange");

  if (token) {
    try {
      const payload = jwt_decode(token);
      if (payload.username) {
        document.getElementById("username").textContent = payload.username;
      }
    } catch (e) {
      console.error("Invalid token", e);
    }
  }

  if (!portfolioId) {
    showModal("Error fetching portfolio.", "error");
    window.location.href = "/index.html";
    return;
  }

  if (portfolioName) {
    document.getElementById("portfolioName").textContent = portfolioName;
  }
  if (portfolioExchange) {
    document.getElementById("portfolioExchange").textContent =
      portfolioExchange;
  }

  async function buildWeeklyTicker() {
    const track = document.getElementById("weeklyTickerTrack");
  
    const res = await fetch(
      `/portfolio/portfolio/getWeeklyChange/${portfolioId}`,
      {
        headers: { Authorization: "Bearer " + token },
      }
    );
    if (!res.ok) return;
  
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      track.innerHTML = '<div class="ticker-item">No assets yet</div>';
      return;
    }
  
    let lastWeekChangeTotal = 0;   
    let totalStocks = 0;
  
    const itemsHTML = data
      .map(({ ticker, changePct }) => {
        const pct = Number(changePct);
        lastWeekChangeTotal += pct;   
        totalStocks += 1;
  
        const pctStr = pct.toFixed(2);
        const up = pct >= 0;
        const cls = up ? "badge-up" : "badge-down";
        const sign = up ? "+" : "";
        return `<div class="ticker-item">
            <span class="symbol">${ticker}</span>
            <span class="${cls}">${sign}${pctStr}%</span>
          </div>`;
      })
      .join("");
  
    let avgChange = totalStocks > 0 ? (lastWeekChangeTotal / totalStocks).toFixed(2) : "0.00";
    const sign = avgChange >= 0 ? "+" : "";
    const cls = avgChange >= 0 ? "order-buy" : "order-sell";
  
    document.getElementById("portfolioChangeWeek").innerHTML =
      `<span class="${cls}">${sign}${avgChange}%</span>`;
  
    document.getElementById("portfolioStockCount").textContent = totalStocks;
  
    let repeated = itemsHTML;
    while (track.scrollWidth < window.innerWidth * 2) {
      repeated += itemsHTML;
      track.innerHTML = repeated;
    }
  
    const itemCount = track.querySelectorAll(".ticker-item").length;
    const duration = Math.min(60, Math.max(18, itemCount * 2.5));
    track.style.setProperty("--duration", `${duration}s`);
  }
  

  buildWeeklyTicker();

  // Fetch the cumulative portfolio data for the line chart
  fetch(`/portfolio/portfolio/getCumulativePricesforPortfolio/${portfolioId}`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.dates && data.values) {
        renderCumulativeGrowthChart(data.dates, data.values);
        const latest = data.values[data.values.length - 1]; 
        const first = data.values[data.values.length - 12];                     
        const yearlyChange = ((latest - first) / first) * 100;

        document.getElementById("portfolioValue").innerText = `$${latest.toLocaleString()}`;

        const el = document.getElementById("portfolioChangeYear");
        el.innerHTML = `${yearlyChange >= 0 ? "+" : ""}${yearlyChange.toFixed(2)}%`;
        el.classList.add(yearlyChange >= 0 ? "order-buy" : "order-sell");
      } else {
        console.error("Invalid data structure for cumulative portfolio value");
      }
    })
    .catch((error) => {
      console.error("Error fetching cumulative portfolio data:", error);
      alert("Failed to load portfolio data.");
    });

  fetch(`portfolio/asset/${portfolioId}`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data && Array.isArray(data)) {
        renderAssetCompositionChart(data);
      } else {
        console.error("Invalid asset composition data");
      }
    })
    .catch((error) => {
      console.error("Error fetching asset composition data:", error);
      alert("Failed to load asset composition data.");
    });

  const table2 = document
    .getElementById("transactionTable")
    .getElementsByTagName("tbody")[0];


fetch(`/transaction/transactionByPortfolio/${portfolioId}`, {
    headers: {
        'Authorization': 'Bearer ' + token
    }
})
.then(response => response.json())
.then(data => {
    data = data.reverse();

    data.forEach((p) => { 
        let date = new Date(p.datetime); 
        const options = { year: 'numeric', month: 'short' , day: 'numeric', hour: '2-digit', minute: '2-digit' };
        date = date.toLocaleDateString('en-US', options);

        const newRow = table2.insertRow();
        const transactionType = newRow.insertCell(0);
        const quantity = newRow.insertCell(1);
        const dateTime = newRow.insertCell(2);

        const type = p.transaction_type.toUpperCase();
        transactionType.textContent = type;

        if (type === "BUY") {
            transactionType.classList.add("order-buy");
        } else if (type === "SELL") {
            transactionType.classList.add("order-sell");
        }

        quantity.textContent = p.quantity;
        dateTime.textContent = date;
    });
})

});

const token = localStorage.getItem("token");
if (token) {
  try {
    const payload = jwt_decode(token);
    if (payload.username) {
      document.getElementById("username").textContent = payload.username;
    }
  } catch (e) {
    console.error("Invalid token", e);
  }
}

function renderCumulativeGrowthChart(dates, values) {
  const ctx = document.getElementById("cumulativeGrowthChart").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: dates,
      datasets: [
        {
          label: "Cumulative Growth",
          data: values,
          fill: false,
          borderColor: "rgba(75, 192, 192, 1)",
          tension: 0.1,
          pointRadius: 5,
          pointBackgroundColor: "rgba(75, 192, 192, 1)",
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: "Date",
          },
          ticks: {
            autoSkip: true,
            maxRotation: 45,
            minRotation: 45,
          },
        },
        y: {
          title: {
            display: true,
            text: "Net Worth (GBP)",
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
      },
    },
  });
}

const colorPalette = [
  "rgba(75, 192, 192, 0.7)",
  "rgba(153, 102, 255, 0.7)", 
  "rgba(255, 159, 64, 0.7)", 
  "rgba(54, 162, 235, 0.7)", 
  "rgba(255, 99, 132, 0.7)",
  "rgba(255, 205, 86, 0.7)", 
  "rgba(201, 203, 207, 0.7)", 
];

function renderAssetCompositionChart(assets) {
  const ctx = document.getElementById("assetCompositionChart").getContext("2d");
  const labels = assets.map((asset) => asset.ticker);
  const data = assets.map((asset) => asset.quantity);
  const backgroundColors = generateColorPalette(assets.length);

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: backgroundColors,
        },
      ],
    },
    options: {
      responsive: true,
      legend: {
        position: "right",
        labels: {
          fontSize: 14, 
          fontStyle: "bold",
          generateLabels: function (chart) {
            const dataset = chart.data.datasets[0];
            return chart.data.labels.map((label, i) => {
              const value = dataset.data[i];
              return {
                text: `${label} (${value})`,
                fillStyle: dataset.backgroundColor[i],
                hidden: isNaN(dataset.data[i]) || dataset.data[i] === null,
                index: i,
              };
            });
          },
        },
      },
      tooltips: {
        callbacks: {
          label: function (tooltipItem, data) {
            const label = data.labels[tooltipItem.index];
            const value = data.datasets[0].data[tooltipItem.index];
            return `${label}: ${value} units`;
          },
        },
      },
    },
  });
}

function generateColorPalette(count) {
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(colorPalette[i % colorPalette.length]);
  }
  return colors;
}

const portfolioId = localStorage.getItem("portfolioId");
const portfolioName = localStorage.getItem("portfolioName");
const portfolioExchange = localStorage.getItem("portfolioExchange");

document
  .getElementById("addAssetForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const quantity = document.getElementById("addQuantityInput").value;
    const ticker = document
      .getElementById("addTickerInput")
      .value.trim()
      .toUpperCase();

    if (!ticker || !quantity || quantity <= 0) {
      alert("Please enter a valid ticker and quantity.");
      return;
    }

    try {
      const res = await fetch(`/portfolio/asset/${portfolioId}`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch assets for validation.");

      const existingAssets = await res.json();
      const alreadyExists = existingAssets.some(
        (a) => a.ticker.toUpperCase() === ticker
      );

      if (alreadyExists) {
        alert(`The asset ${ticker} already exists in this portfolio.`);
        return;
      }

      const addRes = await fetch("/portfolio/asset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          portfolio_id: portfolioId,
          ticker: ticker,
          quantity: quantity,
        }),
      });

      if (!addRes.ok) throw new Error("Failed to add asset.");

      const data = await addRes.json();

      if (data.success) {
        alert(`Asset ${ticker} added successfully!`);
        document.getElementById("addAssetForm").reset();
      } else {
        alert("Failed to add asset: " + (data.error || "Unknown error."));
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred: " + err.message);
    }
  });

document
  .getElementById("transactionForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const ticker = document.getElementById("transactionTickerInput").value;
    const transactionTypeElement = document.getElementById(
      "transactionTypeInput"
    );

    const transactionType =
      transactionTypeElement.options[transactionTypeElement.selectedIndex].text;
    const quantity = parseInt(
      document.getElementById("transactionQuantityInput").value
    );

    fetch("/portfolio/asset", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        portfolio_id: portfolioId,
        ticker: ticker,
        transaction_type: transactionType,
        quantity: quantity,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to make transaction.");
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          alert("Transaction made successfully!");
        } else {
          alert(
            "Failed to make transaction: " + (data.error || "Unknown error.")
          );
        }
      })
      .catch((error) => {
        alert("An error occurred: " + error.message);
      });
  });

  
