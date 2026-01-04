const micBtn = document.getElementById("mic");
const statusText = document.getElementById("status");

/* ---------- SPEECH RECOGNITION ---------- */

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  statusText.innerText = "Speech recognition not supported on this browser.";
}

const recognition = new SpeechRecognition();
recognition.lang = "en-US";
recognition.continuous = false;
recognition.interimResults = false;

/* ---------- SPEECH SYNTHESIS ---------- */

function speak(text) {
  if (!text) return;

  // Stop anything currently speaking
  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";

  // Android Chrome needs a delay
  setTimeout(() => {
    speechSynthesis.speak(utterance);
  }, 300);
}

/* ---------- HELPERS ---------- */

function cleanQuery(text) {
  return text
    .toLowerCase()
    .replace(/who is|what is|tell me about|define|explain/gi, "")
    .trim();
}

/* ---------- WIKIPEDIA SEARCH ---------- */

async function wikiSearch(query) {
  const topic = cleanQuery(query);

  if (!topic) {
    speak("Please say the topic clearly.");
    return;
  }

  statusText.innerText = "Searching for " + topic + "...";

  try {
    const response = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        topic
      )}`
    );

    const data = await response.json();

    if (data.extract) {
      statusText.innerText = data.extract;
      speak(data.extract);
    } else {
      speak("Sorry, I could not find information about " + topic);
    }
  } catch (err) {
    speak("Network error. Please try again.");
  }
}

/* ---------- MIC BUTTON ---------- */

micBtn.addEventListener("click", () => {
  // Android Chrome requirement
  speechSynthesis.cancel();
  statusText.innerText = "Listening...";
  recognition.start();
});

/* ---------- RESULTS ---------- */

recognition.onresult = (event) => {
  const text = event.results[0][0].transcript;
  statusText.innerText = "You asked: " + text;
  wikiSearch(text);
};

recognition.onerror = (event) => {
  statusText.innerText = "Mic error. Please tap again.";
};

