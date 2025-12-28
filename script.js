const micBtn = document.getElementById("micBtn");
const statusText = document.getElementById("status");
const ring = document.getElementById("ring");

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.lang = "en-US";

let listening = false;

/* -------- VOICE FIX -------- */
let voices = [];

function loadVoices() {
  voices = speechSynthesis.getVoices();
}
loadVoices();
speechSynthesis.onvoiceschanged = loadVoices;

function speak(text) {
  speechSynthesis.cancel();

  const u = new SpeechSynthesisUtterance(text);

  const bestVoice =
    voices.find(v => v.name.includes("Google")) ||
    voices.find(v => v.name.includes("Natural")) ||
    voices.find(v => v.lang.startsWith("en"));

  if (bestVoice) u.voice = bestVoice;

  u.rate = 0.95;
  u.pitch = 1.05;
  u.volume = 1;

  speechSynthesis.speak(u);
}
/* -------------------------- */

micBtn.onclick = () => {
  if (listening) return;
  listening = true;

  recognition.start();
  ring.classList.add("listening");
  statusText.innerText = "Listening...";
};

recognition.onresult = (e) => {
  const cmd = e.results[0][0].transcript.toLowerCase().trim();
  statusText.innerText = cmd;

  if (cmd.includes("time")) {
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });
    speak("The time is " + time);
  }
  else if (cmd.includes("date")) {
    speak("Today is " + new Date().toDateString());
  }
  else {
    speak("Searching Google for " + cmd);
    window.open(
      "https://www.google.com/search?q=" + encodeURIComponent(cmd),
      "_blank"
    );
  }
};

recognition.onend = () => {
  listening = false;
  ring.classList.remove("listening");
};

recognition.onerror = () => {
  listening = false;
  ring.classList.remove("listening");
  statusText.innerText = "Tap the mic and speak";
};




