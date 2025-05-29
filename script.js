const form = document.getElementById("loginForm");
const chatBox = document.getElementById("chatBox");
const roomDisplay = document.getElementById("roomDisplay");
const messages = document.getElementById("messages");

// Fixed room-password mapping
const roomPasswords = {
  "SSSJIS": "#7430$",
  "WAGON": "PAZz0%",
  "Y2M$": "7R0Mnk(i)",
  "CHUPk0": "Az1Bu42&"
};

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();
  const room = document.getElementById("room").value.trim();

  if (!user || !pass || !room) {
    alert("All fields are required.");
    return;
  }

  // Check if room exists
  if (!roomPasswords[room]) {
    alert("Invalid room name.");
    return;
  }

  // Check if password matches
  if (roomPasswords[room] !== pass) {
    alert("Incorrect password for this room.");
    return;
  }

  form.classList.add("hidden");
  chatBox.classList.remove("hidden");
  roomDisplay.textContent = room;
});

function sendMessage() {
  const input = document.getElementById("message");
  const msg = input.value.trim();
  if (!msg) return;

  const div = document.createElement("div");
  div.textContent = "You: " + msg;
  messages.appendChild(div);
  input.value = "";
}
