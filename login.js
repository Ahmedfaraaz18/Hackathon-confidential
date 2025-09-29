const API = 'http://localhost:5000/api';

document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  fetch(`${API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.message) {
      localStorage.setItem('role', data.role);
      localStorage.setItem('username', username);
      window.location.href = data.role === 'teacher' ? 'dashboard.html' : 'profile.html';
    } else {
      document.getElementById('loginMessage').innerText = data.error;
    }
  });
});