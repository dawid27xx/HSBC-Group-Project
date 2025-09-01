document.getElementById("logoutButton").addEventListener("submit", (e) => {
    e.preventDefault();

    
})

function logout() {
  localStorage.removeItem("token");
  window.location.href = "/auth_page.html";
}