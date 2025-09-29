const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

// Simple cube for demonstration
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

function animate() {
  renderer.setAnimationLoop(() => {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
  });
}

animate();
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;

recognition.onresult = (event) => {
  const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
  console.log("Voice command:", transcript);

  if (transcript.includes("start lesson")) {
    alert("Starting the lesson...");
    // Trigger VR scene or lesson logic here
  } else if (transcript.includes("help")) {
    speak("You can say 'start lesson' or 'exit VR'.");
  }
};

document.getElementById("enterVR").addEventListener("click", () => {
  recognition.start();
});
function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  speechSynthesis.speak(utterance);
}
function showSignLanguage(videoName) {
  const video = document.getElementById("signVideo");
  video.src = `videos/${videoName}.mp4`;
  video.hidden = false;
  video.play();
}

// Example trigger
document.getElementById("enterVR").addEventListener("click", () => {
  showSignLanguage("start_lesson_sign");
});
const socket = io('http://localhost:5000');

function joinRoom(roomName, username) {
  socket.emit('join', { room: roomName, username: username });
}

socket.on('status', (data) => {
  speak(data.msg); // Auditory feedback
  console.log(data.msg);
});

// Example usage
joinRoom("classroom1", "StudentA");