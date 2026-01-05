const output = document.getElementById("output");
const micBtn = document.getElementById("micBtn");

// ---------------- MIC SETUP ----------------
let recognition;
if ("webkitSpeechRecognition" in window) {
  recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;
} else {
  alert("Speech recognition not supported in this browser.");
}

// Mic click
micBtn.onclick = () => {
  speechSynthesis.cancel(); // stop speaking
  output.innerText = "🎤 Listening...";
  recognition.start();
};

// When speech is recognized
recognition.onresult = (event) => {
  const spokenText = event.results[0][0].transcript;
  getAnswer(spokenText);
};

recognition.onerror = () => {
  output.innerText = "Mic error. Try again.";
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
  speak("No info found in Wikipedia. Searching in other platform.");

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
let typingInterval;
function typeText(text) {
  clearInterval(typingInterval);
  output.innerText = "";
  let i = 0;

  typingInterval = setInterval(() => {
    output.innerText += text.charAt(i);
    i++;
    if (i >= text.length) clearInterval(typingInterval);
  }, 25); // typing speed
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

