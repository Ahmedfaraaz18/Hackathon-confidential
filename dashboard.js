const API = 'http://localhost:5000/api';

function createLesson() {
  const title = document.getElementById('lessonTitle').value;
  const tags = document.getElementById('lessonTags').value.split(',').map(tag => tag.trim());

  fetch(`${API}/lessons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, tags })
  })
  .then(res => res.json())
  .then(data => alert(data.message));
}

function loadStudents() {
  fetch(`${API}/students`)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('studentList');
      container.innerHTML = '<ul>' + data.map(student =>
        `<li>${student.name} – Accessibility: ${JSON.stringify(student.accessibility)}</li>`
      ).join('') + '</ul>';
    });
}

function loadProgress() {
  fetch(`${API}/progress`)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('progressList');
      container.innerHTML = '<ul>' + data.map(entry =>
        `<li>${entry.student_name} – ${entry.lesson_title} – ${entry.completed ? '✅' : '❌'} (${entry.timestamp})</li>`
      ).join('') + '</ul>';
    });
}
function logout() {
  localStorage.clear();
  window.location.href = 'login.html';
}