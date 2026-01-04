const micBtn = document.getElementById("mic");
const statusText = document.getElementById("status");

// ---- Speech Recognition ----
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  statusText.innerText = "Speech recognition not supported";
}

const recognition = new SpeechRecognition();
recognition.lang = "en-US";
recognition.continuous = false;
recognition.interimResults = false;

// ---- Speak (Android safe) ----
function speak(text) {
  if (!text) return;

  speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";

  // Android Chrome needs delay
  setTimeout(() => {
    speechSynthesis.speak(utter);
  }, 300);
}

// ---- Clean question ----
function cleanQuery(text) {
  return text
    .toLowerCase()
    .replace(/who is|what is|tell me about|define|explain/gi, "")
    .trim();
}

// ---- Wikipedia Search ----
async function searchWiki(query) {
  const topic = cleanQuery(query);

  if (!topic) {
    speak("Please say the topic clearly");
    return;
  }

  statusText.innerText = "Searching " + topic;

  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        topic
      )}`
    );

    const data = await res.json();

    if (data.extract) {
      statusText.innerText = data.extract;
      speak(data.extract);
    } else {
      speak("No information found");
    }
  } catch {
    speak("Network error");
  }
}

// ---- Mic Button ----
micBtn.addEventListener("click", () => {
  speechSynthesis.cancel(); // stop speaking
  statusText.innerText = "Listening...";
  recognition.start();
});

// ---- Result ----
recognition.onresult = (event) => {
  const text = event.results[0][0].transcript;
  statusText.innerText = "You said: " + text;
  searchWiki(text);
};

// ---- Error ----
recognition.onerror = (event) => {
  statusText.innerText = "Mic error: " + event.error;
};
