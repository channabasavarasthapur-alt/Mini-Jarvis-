const micBtn = document.getElementById("mic");
const statusEl = document.getElementById("status");

let recognition;
let listening = false;
let typingInterval = null;

// ---------- SPEECH RECOGNITION ----------
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;

  recognition.onstart = () => {
    listening = true;
    statusEl.textContent = "Listening...";
  };

  recognition.onend = () => {
    listening = false;
  };

  recognition.onerror = () => {
    statusEl.textContent = "Mic error";
  };

  recognition.onresult = (event) => {
    const query = event.results[0][0].transcript;
    thinkingEffect(() => searchWikipedia(query));
  };
} else {
  statusEl.textContent = "Speech not supported";
}

// ---------- MIC CLICK ----------
micBtn.addEventListener("click", () => {
  if (!recognition) return;

  // stop current speech & typing (realistic interruption)
  speechSynthesis.cancel();
  if (typingInterval) clearInterval(typingInterval);

  if (!listening) {
    speak(
      "Hey there! I am Jarvis, your AI assistant, created by  Baasaavaa. How can I help you?"
    );

    setTimeout(() => {
      recognition.start();
    }, 1800);
  }
});

// ---------- THINKING EFFECT ----------
function thinkingEffect(callback) {
  let dots = 0;
  statusEl.textContent = "Thinking";

  const think = setInterval(() => {
    dots = (dots + 1) % 4;
    statusEl.textContent = "Thinking" + ".".repeat(dots);
  }, 400);

  setTimeout(() => {
    clearInterval(think);
    callback();
  }, 1400); // human-like delay
}

// ---------- WIKIPEDIA SEARCH ----------
async function searchWikipedia(query) {
  try {
    statusEl.textContent = "Searching Wikipedia...";

    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      query
    )}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.extract) {
      const msg =
        "No information found in Wikipedia. Searching in other platform.";
      typeText(msg);
      speak(msg);
      return;
    }

    let text = data.extract
      .replace(/\s+/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2");

    typeText(text);

    setTimeout(() => {
      speak(text);
    }, 600); // pause before speaking (realism)
  } catch (e) {
    statusEl.textContent = "Something went wrong";
  }
}

// ---------- TYPING ANIMATION ----------
function typeText(text) {
  statusEl.textContent = "";
  let i = 0;

  if (typingInterval) clearInterval(typingInterval);

  typingInterval = setInterval(() => {
    statusEl.textContent += text.charAt(i);
    i++;
    if (i >= text.length) clearInterval(typingInterval);
  }, 22); // natural typing speed
}

// ---------- TEXT TO SPEECH ----------
function speak(text) {
  speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  utter.rate = 0.95; // natural speed
  utter.pitch = 1;
  utter.volume = 1;

  speechSynthesis.speak(utter);
}




