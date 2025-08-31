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
  }
}

const portfolioIds = [];
const portfolioNames = {};

fetch("userPortfolio/userPortfolio", {
  headers: { Authorization: "Bearer " + token },
})
  .then((response) => response.json())
  .then((data) => {
    data.forEach((pa) => portfolioIds.push(pa.portfolio_id));
    fetchPortfolioDetails();
  })
  .catch((err) => console.error("Error fetching user portfolio IDs:", err));

const fetchPortfolioDetails = () => {
  fetch(`/portfolio/portfolio`, {
    headers: { Authorization: "Bearer " + token },
  })
    .then((response) => response.json())
    .then((data) => {
      data.forEach((portfolio) => {
        portfolioNames[portfolio.id] = portfolio.name;
      });
      fetchPortfolioData(portfolioIds[0], 0);
    })
    .catch((err) => console.error("Error fetching portfolio details:", err));
};

const fetchPortfolioData = (portfolioId, index) => {
  fetch(`/portfolio/portfolio/getCumulativePricesforPortfolio/${portfolioId}`, {
    headers: { Authorization: "Bearer " + token },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data && data.dates && data.values) {
        updateChart(data.dates, data.values, portfolioNames[portfolioId], index);
      } else {
        console.error(`No data for portfolio ${portfolioId}`);
      }
      if (portfolioIds[index + 1]) {
        fetchPortfolioData(portfolioIds[index + 1], index + 1);
      }
    })
    .catch((err) => console.error(`Error fetching data for portfolio ${portfolioId}:`, err));
};

let chart = null;
const updateChart = (dates, values, portfolioName, index) => {
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
};

const table = document
  .getElementById("portfolioTable")
  .getElementsByTagName("tbody")[0];

fetch(`/portfolio/portfolio`, {
  headers: { Authorization: "Bearer " + token },
})
  .then((response) => response.json())
  .then((data) => {
    data.forEach((p) => {
      const newRow = table.insertRow();
      const pName = newRow.insertCell(0);
      const pExchange = newRow.insertCell(1);
      const manageButton = newRow.insertCell(2);

      pName.textContent = p.name;
      pExchange.textContent = p.exchange;
      manageButton.innerHTML = `<button class="btn btn-outline-dark" onclick="managePortfolio(${p.id}, '${p.name}', '${p.exchange}')">Manage</button>`;
    });
  })
  .catch((err) => console.error("Error fetching portfolio details:", err));

function managePortfolio(id, name, exchange) {
  localStorage.setItem("portfolioId", id);
  localStorage.setItem("portfolioName", name);
  localStorage.setItem("portfolioExchange", exchange);
  window.location.href = "manage.html";
}

document
  .getElementById("addPortfolioForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("portfolioName").value;
    const exchange = document.getElementById("portfolioExchange").value;

    fetch("/portfolio/portfolio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ name, exchange }),
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
        const manageButton = newRow.insertCell(2);

        pName.textContent = newPortfolio.name;
        pExchange.textContent = newPortfolio.exchange;
        manageButton.innerHTML = `<button class="btn btn-outline-dark" onclick="managePortfolio(${newPortfolio.id}, '${newPortfolio.name}', '${newPortfolio.exchange}')">Manage</button>`;

        document.getElementById("addPortfolioForm").reset();
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("addPortfolioModal")
        );
        modal.hide();
      })
      .catch((err) => {
        console.error("Error adding portfolio:", err);
        alert("Could not add portfolio. Please try again.");
      });
  });

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
        let date = new Date(p.datetime);
        const options = {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        };
        date = date.toLocaleDateString("en-US", options);
      
        const newRow = table2.insertRow();
        const transactionType = newRow.insertCell(0);
        const quantity = newRow.insertCell(1);
        const dateTime = newRow.insertCell(2);
      
        const type = p.transaction_type.toUpperCase();
      
        if (type === "BUY") {
            transactionType.innerHTML = `<span class="badge bg-success">BUY</span>`;
          } else if (type === "SELL") {
            transactionType.innerHTML = `<span class="badge bg-danger">SELL</span>`;
          } else {
            transactionType.textContent = type;
          }
          
      
        quantity.textContent = p.quantity;
        dateTime.textContent = date;
      });
      
  });
