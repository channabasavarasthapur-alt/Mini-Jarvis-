const statusText = document.getElementById("status");
const micBtn = document.getElementById("micBtn");
const ring = document.getElementById("ring");

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.lang = "en-US";

/* ---------- VOICE IMPROVEMENT ---------- */
let voices = [];

function loadVoices() {
  voices = speechSynthesis.getVoices();
}
speechSynthesis.onvoiceschanged = loadVoices;

function speak(text) {
  speechSynthesis.cancel(); // stop previous speech

  const u = new SpeechSynthesisUtterance(text);

  // Pick best available natural voice
  const voice =
    voices.find(v => v.name.includes("Google")) ||
    voices.find(v => v.name.includes("Natural")) ||
    voices.find(v => v.lang === "en-US");

  if (voice) u.voice = voice;

  u.rate = 0.95;   // smooth
  u.pitch = 1.05;  // natural
  u.volume = 1;

  speechSynthesis.speak(u);
}
/* ------------------------------------- */

micBtn.onclick = () => {
  recognition.start();
  ring.classList.add("listening");
  statusText.innerText = "Listening...";
};

recognition.onresult = (e) => {
  const cmd = e.results[0][0].transcript.toLowerCase();
  statusText.innerText = cmd;

  if (cmd.includes("hey jarvis")) {
    speak("Yes. How can I help you?");
  }
  else if (cmd.includes("time")) {
    const now = new Date();
    const options = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata"
    };
    speak("The time is " + now.toLocaleTimeString("en-US", options));
  }
  else if (cmd.includes("date")) {
    speak("Today is " + new Date().toDateString());
  }
  else if (cmd.includes("open google")) {
    speak("Opening Google");
    window.open("https://google.com", "_blank");
  }
  else if (cmd.includes("open youtube")) {
    speak("Opening YouTube");
    window.open("https://youtube.com", "_blank");
  }
  else {
    speak("Searching Google");
    window.open("https://www.google.com/search?q=" + cmd, "_blank");
  }
};

recognition.onend = () => {
  ring.classList.remove("listening");
};

function toggleTheme() {
  document.body.classList.toggle("light");
}

function openCalc() {
  const a = prompt("Enter first number");
  const b = prompt("Enter second number");
  const result = Number(a) + Number(b);
  alert("Result = " + result);
  speak("The result is " + result);
}

function openNotes() {
  let note = localStorage.getItem("jarvisNote") || "";
  note = prompt("Your note:", note);
  if (note !== null) {
    localStorage.setItem("jarvisNote", note);
    speak("Note saved");
  }
}



