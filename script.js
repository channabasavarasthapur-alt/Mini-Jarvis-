const micBtn = document.getElementById("mic");
const statusEl = document.getElementById("status");

let recognition;
let listening = false;
let typingInterval = null;

// ---------------- SPEECH RECOGNITION ----------------
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

// ---------------- MIC CLICK ----------------
micBtn.addEventListener("click", () => {
  if (!recognition || listening) return;

  speechSynthesis.cancel();
  if (typingInterval) clearInterval(typingInterval);

  const intro =
    "Hey there! I am Jarvis, your AI assistant, created by Chun-nuh Baasava. How can I help you?";

  speak(intro, () => {
    recognition.start(); // start mic AFTER speaking
  });
});

// ---------------- THINKING EFFECT ----------------
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
  }, 1200);
}

// ---------------- WIKIPEDIA SEARCH ----------------
async function searchWikipedia(query) {
  try {
    statusEl.textContent = "Searching Wikipedia...";

    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      query
    )}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.extract) {
      let text = cleanText(data.extract);
      typeText(text);
      setTimeout(() => speak(text), 500);
    } else {
      fallbackDuckDuckGo(query);
    }
  } catch {
    fallbackDuckDuckGo(query);
  }
}

// ---------------- DUCKDUCKGO FALLBACK ----------------
async function fallbackDuckDuckGo(query) {
  const msg = "No info in Wikipedia. Searching in DuckDuckGo.";
  typeText(msg);
  speak(msg);

  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(
      query
    )}&format=json&no_redirect=1&no_html=1`;

    const res = await fetch(url);
    const data = await res.json();

    let answer =
      data.AbstractText ||
      data.Answer ||
      (data.RelatedTopics &&
        data.RelatedTopics[0] &&
        data.RelatedTopics[0].Text);

    if (answer) {
      answer = cleanText(answer);
      setTimeout(() => {
        typeText(answer);
        speak(answer);
      }, 800);
    } else {
      const noAns = "Sorry, I could not find information on this topic.";
      setTimeout(() => {
        typeText(noAns);
        speak(noAns);
      }, 800);
    }
  } catch {
    const err = "Something went wrong while searching.";
    typeText(err);
    speak(err);
  }
}

// ---------------- TEXT CLEANING ----------------
function cleanText(text) {
  return text
    .replace(/\s+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2");
}

// ---------------- TYPING ANIMATION ----------------
function typeText(text) {
  statusEl.textContent = "";
  let i = 0;

  if (typingInterval) clearInterval(typingInterval);

  typingInterval = setInterval(() => {
    statusEl.textContent += text.charAt(i);
    i++;
    if (i >= text.length) clearInterval(typingInterval);
  }, 22);
}

// ---------------- TEXT TO SPEECH ----------------
function speak(text, onEnd) {
  speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  utter.rate = 0.95;
  utter.pitch = 1;

  utter.onend = () => {
    if (onEnd) onEnd();
  };

  speechSynthesis.speak(utter);
}





