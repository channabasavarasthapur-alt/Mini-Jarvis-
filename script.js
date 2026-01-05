// ELEMENTS
const output = document.getElementById("output");
const micBtn = document.getElementById("micBtn");

// ---------------- SPEECH RECOGNITION ----------------
let recognition;

if ("webkitSpeechRecognition" in window) {
  recognition = new webkitSpeechRecognition();
} else if ("SpeechRecognition" in window) {
  recognition = new SpeechRecognition();
} else {
  alert("Speech recognition not supported in this browser.");
}

recognition.lang = "en-US";
recognition.continuous = false;
recognition.interimResults = false;

// Mic button click (USER ACTION → REQUIRED)
micBtn.addEventListener("click", () => {
  try {
    speechSynthesis.cancel();
    clearTyping();
    output.innerText = "🎤 Listening...";
    recognition.start();
  } catch (e) {
    console.log("Mic already running");
  }
});

// When speech is captured
recognition.onresult = (event) => {
  const text = event.results[0][0].transcript;
  getAnswer(text);
};

recognition.onerror = (event) => {
  output.innerText = "Mic error: " + event.error;
};

// ---------------- MAIN LOGIC ----------------
async function getAnswer(question) {
  if (!question || question.trim().length < 2) {
    typeText("Please ask a proper question.");
    speak("Please ask a proper question.");
    return;
  }

  speechSynthesis.cancel();
  typeText("🔍 Searching in Wikipedia...");

  let answer = await fromWikipedia(question);

  if (answer && answer.length > 60) {
    typeText(answer);
    speak(answer);
    return;
  }

  typeText("❌ No info found in Wikipedia, searching in other platform...");
  speak("No info found in Wikipedia, searching in other platform.");

  answer = await fromDuckDuckGo(question);

  if (answer && answer.length > 20) {
    typeText(answer);
    speak(answer);
    return;
  }

  const fallback = "Sorry, no information found anywhere.";
  typeText(fallback);
  speak(fallback);
}

// ---------------- WIKIPEDIA ----------------
async function fromWikipedia(query) {
  try {
    const title = encodeURIComponent(query.trim().replace(/\s+/g, "_"));
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.extract || null;
  } catch {
    return null;
  }
}

// ---------------- DUCKDUCKGO ----------------
async function fromDuckDuckGo(query) {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(
      query
    )}&format=json&no_redirect=1&no_html=1`;
    const res = await fetch(url);
    const data = await res.json();
    return data.AbstractText || data.Answer || null;
  } catch {
    return null;
  }
}

// ---------------- TYPING ANIMATION ----------------
let typingTimer;

function typeText(text) {
  clearTyping();
  output.innerText = "";
  let i = 0;

  typingTimer = setInterval(() => {
    output.innerText += text.charAt(i);
    i++;
    if (i >= text.length) clearTyping();
  }, 25);
}

function clearTyping() {
  clearInterval(typingTimer);
}

// ---------------- VOICE ----------------
function speak(text) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  utter.rate = 1;
  utter.pitch = 1;
  speechSynthesis.speak(utter);
}

