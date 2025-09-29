const API = 'http://localhost:5000/api';

document.getElementById('registerForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;

  fetch(`${API}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, role })
  })
  .then(res => res.json())
  .then(data => {
    if (data.message) {
      document.getElementById('registerMessage').innerText = data.message;
      setTimeout(() => window.location.href = 'login.html', 1500);
    } else {
      document.getElementById('registerMessage').innerText = data.error;
    }
  });
});