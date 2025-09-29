const API = 'http://localhost:5000/api';
const studentId = 1; // Replace with dynamic ID if using login

function loadLessons() {
  fetch(`${API}/lessons`)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('lessonList');
      container.innerHTML = '<ul>' + data.map(lesson =>
        `<li>${lesson.title} – Tags: ${lesson.tags.join(', ')}</li>`
      ).join('') + '</ul>';
    });
}

function loadProgress() {
  fetch(`${API}/progress`)
    .then(res => res.json())
    .then(data => {
      const filtered = data.filter(entry => entry.student_name === 'Student Name'); // Replace with dynamic name
      const container = document.getElementById('progressList');
      container.innerHTML = '<ul>' + filtered.map(entry =>
        `<li>${entry.lesson_title} – ${entry.completed ? '✅' : '❌'} (${entry.timestamp})</li>`
      ).join('') + '</ul>';
    });
}

function playSignVideo() {
  const video = document.getElementById('signVideo');
  video.hidden = false;
  video.play();
}