const micBtn = document.getElementById("mic");
const statusText = document.getElementById("status");
const languageSelect = document.getElementById("language");

/* ---------------- SPEECH ---------------- */

let voicesLoaded = false;

speechSynthesis.onvoiceschanged = () => {
  voicesLoaded = true;
};

function speak(text) {
  if (!text) return;

  // Cancel previous speech
  speechSynthesis.cancel();

  // Force user-gesture safety
  setTimeout(() => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = languageSelect.value || "en-US";
    utter.rate = 1;
    utter.pitch = 1;
    speechSynthesis.speak(utter);
  }, 100);
}

/* ---------------- MIC ---------------- */

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.interimResults = false;

function startListening() {
  speechSynthesis.cancel();
  recognition.lang = languageSelect.value || "en-US";
  recognition.start();
  statusText.innerText = "Listening...";
}

/* ---------------- HELPERS ---------------- */

function cleanQuery(text) {
  return text
    .toLowerCase()
    .replace(/who is|what is|tell me about|define|explain|please/gi, "")
    .trim();
}

/* ---------------- WIKIPEDIA (REAL FIX) ---------------- */

async function wikiSearch(query) {
  const topic = cleanQuery(query);
  if (!topic) {
    speak("Please say the topic again");
    return;
  }

  statusText.innerText = "Searching " + topic;

  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      topic
    )}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.extract && !data.type) {
      statusText.innerText = data.extract;
      speak(data.extract);
    } else {
      speak("Sorry, I could not find details about " + topic);
    }
  } catch {
    speak("Network error");
  }
}

/* ---------------- COMMAND ---------------- */

function handleCommand(command) {
  statusText.innerText = "You said: " + command;

  if (command.includes("time")) {
    speak(new Date().toLocaleTimeString());
    return;
  }

  if (command.includes("date")) {
    speak(new Date().toDateString());
    return;
  }

  wikiSearch(command);
}

/* ---------------- EVENTS ---------------- */

micBtn.addEventListener("click", () => {
  startListening();
});

recognition.onresult = (e) => {
  const text = e.results[0][0].transcript;
  handleCommand(text);
};

recognition.onerror = () => {
  statusText.innerText = "Mic error. Tap again.";
};

