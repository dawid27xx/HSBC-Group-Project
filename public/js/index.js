// Populate username from JWT in localStorage
const token = localStorage.getItem("token");
if (token) {
  try {
    const payload = jwt_decode(token);
    if (payload.username) {
      document.getElementById("username").textContent = payload.username;
    }
  } catch (e) {
    console.error("Invalid token", e);
    window.location.href = '/auth_page.html';
  }
}

const portfolioIds = [];
const portfolioNames = {};
const assetTickers = {};
let chart = null;


// Fetch user portfolio IDs
fetch("userPortfolio/userPortfolio", {
  headers: { Authorization: "Bearer " + token },
})
  .then((response) => response.json())
  .then((data) => {
    data.forEach((pa) => portfolioIds.push(pa.portfolio_id));
    // for each portfolio
    fetchPortfolioDetails();
  })
  .catch((err) => console.error("Error fetching user portfolio IDs:", err));

  
function fetchPortfolioDetails() {
  fetch(`/portfolio/portfolio`, {
    headers: { Authorization: "Bearer " + token },
  })
    .then((response) => response.json())
    .then(async (data) => {
      for (const portfolio of data) {
        portfolioNames[portfolio.id] = portfolio.name;

        const res = await fetch(`/portfolio/asset/${portfolio.id}`, {
          headers: { Authorization: "Bearer " + token },
        });
        const assets = await res.json();
        assets.forEach((a) => {
          assetTickers[a.id] = a.ticker; // map asset_id to tickers used later
        });
      }

      if (portfolioIds.length > 0) {
        fetchPortfolioData(portfolioIds[0], 0);
      }
      // Always call fetchTransactions after portfolioNames and assetTickers are populated
      fetchTransactions();
    })
    .catch((err) => console.error("Error fetching portfolio details:", err));
}

// Fetch portfolio data for charts
function fetchPortfolioData(portfolioId, index) {
  fetch(`/portfolio/portfolio/getCumulativePricesforPortfolio/${portfolioId}`, {
    headers: { Authorization: "Bearer " + token },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data && data.dates && data.values) {
        updateChart(
          data.dates,
          data.values,
          portfolioNames[portfolioId],
          index
        );
      } else {
        console.error(`No data for portfolio ${portfolioId}`);
      }
      if (portfolioIds[index + 1]) {
        fetchPortfolioData(portfolioIds[index + 1], index + 1);
      }
    })
    .catch((err) =>
      console.error(`Error fetching data for portfolio ${portfolioId}:`, err)
    );
}

// update chart
function updateChart(dates, values, portfolioName, index) {
  if (!chart) {
    chart = new Chart("netWorthChart", {
      type: "line",
      data: {
        labels: dates,
        datasets: [
          {
            label: portfolioName,
            backgroundColor: `rgba(${index * 50}, 123, 255, 0.2)`,
            borderColor: `rgba(${index * 50}, 123, 255, 1)`,
            data: values,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: { type: "category", title: { display: true, text: "Date" } },
          y: { title: { display: true, text: "Net Worth (GBP)" } },
        },
        plugins: { legend: { display: true, position: "top" } },
      },
    });
  } else {
    chart.data.datasets.push({
      label: portfolioName,
      backgroundColor: `rgba(${index * 50}, 123, 255, 0.2)`,
      borderColor: `rgba(${index * 50}, 123, 255, 1)`,
      data: values,
      fill: true,
    });
    chart.update();
  }
}

// Populate portfolio table
const table = document
  .getElementById("portfolioTable")
  .getElementsByTagName("tbody")[0];

let totalNetWorth = 0;

fetch(`/portfolio/portfolio`, {
  headers: { Authorization: "Bearer " + token },
})
  .then((response) => response.json())
  .then(async (data) => {
    // process all portfolios in parallel and wait for all to finish
    await Promise.all(
      data.map(async (p) => {
        const newRow = table.insertRow();
        const pName = newRow.insertCell(0);
        const pExchange = newRow.insertCell(1);
        const pValue = newRow.insertCell(2);
        const pChange = newRow.insertCell(3);
        const manageButton = newRow.insertCell(4);

        pName.textContent = p.name;
        pExchange.textContent = p.exchange;
        pValue.textContent = "-";
        pChange.textContent = "-";
        manageButton.innerHTML = `<button class="btn btn-outline-dark" onclick="managePortfolio(${p.id}, '${p.name}', '${p.exchange}')">Manage</button>`;

        // Fetch current portfolio value
        try {
          const res = await fetch(
            `/portfolio/portfolio/getCumulativePricesforPortfolio/${p.id}`,
            { headers: { Authorization: "Bearer " + token } }
          );
          const valueData = await res.json();
          if (valueData?.values?.length) {
            const latestValue = valueData.values[valueData.values.length - 1];
            pValue.textContent = `$${latestValue.toLocaleString()}`;
            totalNetWorth += Number(latestValue);
          } else {
            pValue.textContent = "-";
          }
        } catch (err) {
          console.error("Error fetching portfolio value:", err);
          pValue.textContent = "-";
        }

        // Fetch weekly change %
        try {
          const res = await fetch(
            `/portfolio/portfolio/getWeeklyChange/${p.id}`,
            { headers: { Authorization: "Bearer " + token } }
          );
          const changeData = await res.json();
          if (Array.isArray(changeData) && changeData.length > 0) {
            const avgChange =
              changeData.reduce((acc, item) => acc + (item.changePct || 0), 0) /
              changeData.length;
            const sign = avgChange >= 0 ? "+" : "";
            pChange.textContent = `${sign}${avgChange.toFixed(2)}%`;
            pChange.classList.add(avgChange >= 0 ? "order-buy" : "order-sell");
          } else {
            pChange.textContent = "-";
          }
        } catch (err) {
          console.error("Error fetching weekly change:", err);
          pChange.textContent = "-";
        }
      })
    );

    // Update the Net Worth card once everything is done
    const netWorthEl = document.getElementById("netWorthValue");
    if (netWorthEl) {
      netWorthEl.textContent = `$${totalNetWorth.toLocaleString()}`;
    }
  })
  .catch((err) => console.error("Error fetching portfolio details:", err));


  // helper for manage page navigation
function managePortfolio(id, name, exchange) {
  localStorage.setItem("portfolioId", id);
  localStorage.setItem("portfolioName", name);
  localStorage.setItem("portfolioExchange", exchange);
  window.location.href = "manage.html";
}

// Adds new portfolio and updates table accordingly
document
  .getElementById("addPortfolioForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("portfolioName").value;
    const exchange = document.getElementById("portfolioExchange").value;
    const ticker = document.getElementById("tickerInput").value;
    const quantity = document.getElementById("quantityInput").value;

    fetch("/portfolio/portfolio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ name, exchange, ticker, quantity }),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to add portfolio");
        return response.json();
      })
      .then((newPortfolio) => {
        const table = document
          .getElementById("portfolioTable")
          .getElementsByTagName("tbody")[0];
        const newRow = table.insertRow();
        const pName = newRow.insertCell(0);
        const pExchange = newRow.insertCell(1);
        const pValue = newRow.insertCell(2);
        const pChange = newRow.insertCell(3);
        const manageButton = newRow.insertCell(4);

        pName.textContent = newPortfolio.name;
        pExchange.textContent = newPortfolio.exchange;
        pValue.textContent = "-";
        pChange.textContent = "-";
        manageButton.innerHTML = `<button class="btn btn-outline-dark" onclick="managePortfolio(${newPortfolio.id}, '${newPortfolio.name}', '${newPortfolio.exchange}')">Manage</button>`;

        // Fetch and update value
        fetch(`/portfolio/portfolio/getCumulativePricesforPortfolio/${newPortfolio.id}`, {
          headers: { Authorization: "Bearer " + token }
        })
          .then(res => res.json())
          .then(valueData => {
            if (valueData?.values?.length) {
              const latestValue = valueData.values[valueData.values.length - 1];
              pValue.textContent = `$${latestValue.toLocaleString()}`;
            }
          });

  // Fetch and update weekly change
  fetch(`/portfolio/portfolio/getWeeklyChange/${newPortfolio.id}`, {
    headers: { Authorization: "Bearer " + token }
  })
    .then(res => res.json())
    .then(changeData => {
      if (Array.isArray(changeData) && changeData.length > 0) {
        const avgChange =
          changeData.reduce((acc, item) => acc + (item.changePct || 0), 0) /
          changeData.length;
        const sign = avgChange >= 0 ? "+" : "";
        pChange.textContent = `${sign}${avgChange.toFixed(2)}%`;
        pChange.classList.add(avgChange >= 0 ? "order-buy" : "order-sell");
      }
    });

    document.getElementById("addPortfolioForm").reset();
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("addPortfolioModal")
    );
    modal.hide();
  })
});



// Update Transaction Table

function fetchTransactions() {
  const table2 = document
    .getElementById("transactionTable")
    .getElementsByTagName("tbody")[0];

  fetch(`/transaction/transaction`, {
    headers: { Authorization: "Bearer " + token },
  })
    .then((response) => response.json())
    .then((data) => {
      data = data.reverse().slice(0, 5);

      data.forEach((p) => {
        let date = p.datetime ? new Date(p.datetime) : null;
        const options = {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        };

        const formattedDate = date.toLocaleDateString("en-GB", options) 

        const newRow = table2.insertRow();

        const portfolioCell = newRow.insertCell(0);
        const tickerCell = newRow.insertCell(1);
        const typeCell = newRow.insertCell(2);
        const quantityCell = newRow.insertCell(3);
        const dateCell = newRow.insertCell(4);

        portfolioCell.textContent = portfolioNames[p.portfolio_id] 
        tickerCell.textContent = assetTickers[p.portfolio_asset_id] 
        typeCell.textContent = p.transaction_type.toUpperCase();
        quantityCell.textContent = p.quantity;
        dateCell.textContent = formattedDate;

        if (p.transaction_type.toUpperCase() === "BUY") {
          typeCell.classList.add("order-buy");
        } else if (p.transaction_type.toUpperCase() === "SELL") {
          typeCell.classList.add("order-sell");
        }
      });
    })
    .catch((err) => console.error("Error fetching transactions:", err));
};
