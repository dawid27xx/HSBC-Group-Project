document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    fetch('/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username, password: password })
    }).then(response => {
        if (!response.ok) {
            throw new Error('Incorrect username or password.');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            localStorage.setItem('token', data.token);
            window.location.href = '/index.html';
        } else {
            alert('Login failed: ' + (data.message || 'Unknown error.'));
        }
    })
    .catch(error => {
        alert('An error occurred: ' + error.message);
    });
});

document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    fetch('/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username, password: password })
    }).then(response => {
        if (!response.ok) {
            throw new Error('Registration failed. Please enter a unique username.');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // add info 
            alert('Registration successful! You can now log in.');
        } else {
            alert('Registration failed: ' + (data.message || 'Unknown error.'));
        }
    })
    .catch(error => {
        alert('An error occurred: ' + error.message);
    });
});