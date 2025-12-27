const statusText = document.getElementById("status");
const micBtn = document.getElementById("micBtn");
const ring = document.getElementById("ring");

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.lang = "en-US";

function speak(text) {
  const u = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(u);
}

micBtn.onclick = () => {
  recognition.start();
  ring.classList.add("listening");
  statusText.innerText = "Listening...";
};

recognition.onresult = (e) => {
  const cmd = e.results[0][0].transcript.toLowerCase();
  statusText.innerText = cmd;

  if (cmd.includes("hey jarvis")) {
    speak("Yes, how can I help?");
  }
  else if (cmd.includes("time")) {
    // ✅ Fixed time with IST
    const now = new Date();
    const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' };
    speak("The time is " + now.toLocaleTimeString('en-US', options));
  }
  else if (cmd.includes("date")) {
    speak(new Date().toDateString());
  }
  else if (cmd.includes("open google")) {
    speak("Opening Google");
    window.open("https://google.com");
  }
  else if (cmd.includes("open youtube")) {
    speak("Opening YouTube");
    window.open("https://youtube.com");
  }
  else if (cmd.startsWith("search")) {
    const q = cmd.replace("search", "");
    speak("Searching Google");
    window.open("https://www.google.com/search?q=" + q);
  }
  else if (cmd.includes("calculator")) {
    openCalc();
  }
  else if (cmd.includes("notes")) {
    openNotes();
  }
  else {
    // Optional improvement: auto Google search instead of "sorry"
    speak("Searching Google for " + cmd);
    window.open("https://www.google.com/search?q=" + cmd, "_blank");
  }
};

recognition.onend = () => {
  ring.classList.remove("listening");
};

function openCalc() {
  const n1 = prompt("Enter first number");
  const n2 = prompt("Enter second number");
  alert("Sum = " + (Number(n1) + Number(n2)));
}

function openNotes() {
  let note = localStorage.getItem("jarvisNote") || "";
  note = prompt("Your note:", note);
  if (note !== null) localStorage.setItem("jarvisNote", note);
}

