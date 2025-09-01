document.getElementById("logoutForm").addEventListener("submit", (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    window.location.href = "/auth_page.html";
});
