// ====== DOM ======
const micBtn = document.getElementById("mic");
const statusText = document.getElementById("status");
const languageSelect = document.getElementById("language");

// ====== SPEECH SYNTHESIS ======
function speak(text) {
  if (!text) return;

  // STOP speaking if already speaking
  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = languageSelect.value;
  utter.rate = 1;
  utter.pitch = 1;

  window.speechSynthesis.speak(utter);
}

// ====== SPEECH RECOGNITION ======
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  alert("Speech Recognition not supported in this browser");
}

const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.interimResults = false;

// ====== CLEAN QUERY ======
function cleanQuery(text) {
  return text
    .toLowerCase()
    .replace(
      /who is|what is|tell me about|define|explain|search|wikipedia|please/gi,
      ""
    )
    .trim();
}

// ====== WIKIPEDIA SEARCH (FIXED) ======
async function wikiSearch(query) {
  const cleaned = cleanQuery(query);

  if (!cleaned) {
    speak("Please say the topic clearly");
    return;
  }

  statusText.innerText = "Searching: " + cleaned;
  speak("Searching");

  try {
    // Step 1: Find title
    const searchURL = `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&origin=*&search=${encodeURIComponent(
      cleaned
    )}`;
    const searchRes = await fetch(searchURL);
    const searchData = await searchRes.json();

    const title = searchData[1][0];
    if (!title) {
      speak("No information found");
      return;
    }

    // Step 2: Get summary
    const summaryURL = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      title
    )}`;
    const summaryRes = await fetch(summaryURL);
    const summaryData = await summaryRes.json();

    if (summaryData.extract) {
      statusText.innerText = summaryData.extract;
      speak(summaryData.extract);
    } else {
      speak("I found " + title + " but no details available");
    }
  } catch (err) {
    speak("Network error");
  }
}

// ====== COMMAND HANDLER ======
function handleCommand(command) {
  statusText.innerText = "You said: " + command;

  if (command.includes("time")) {
    const time = new Date().toLocaleTimeString();
    speak("The time is " + time);
    return;
  }

  if (command.includes("date")) {
    const date = new Date().toDateString();
    speak("Today is " + date);
    return;
  }

  wikiSearch(command);
}

// ====== MIC CLICK ======
micBtn.addEventListener("click", () => {
  // Stop speaking when user speaks again
  window.speechSynthesis.cancel();

  recognition.lang = languageSelect.value;
  recognition.start();
  statusText.innerText = "Listening...";
});

// ====== RECOGNITION EVENTS ======
recognition.onresult = (event) => {
  const command = event.results[0][0].transcript;
  handleCommand(command);
};

recognition.onerror = () => {
  statusText.innerText = "Mic error. Try again";
};

recognition.onend = () => {
  // Do nothing (prevents looping bugs)
};



