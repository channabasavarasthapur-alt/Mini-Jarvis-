const micBtn = document.getElementById("micBtn");
const statusText = document.getElementById("status");
const languageSelect = document.getElementById("language");

window.speechSynthesis.onvoiceschanged = () => {};

// Speech recognition
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.interimResults = false;

micBtn.addEventListener("click", (e) => {
  e.preventDefault();
  recognition.lang = languageSelect.value; // user speech language
  recognition.start();
  statusText.innerText = "Listening...";
});

recognition.onresult = (e) => {
  const message = e.results[0][0].transcript;
  statusText.innerText = "You said: " + message;
  handleCommand(message);
};

recognition.onerror = () => {
  statusText.innerText = "Tap the mic";
  speak("Please try again");
};

// Speak
function speak(text) {
  speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);

  // IMPORTANT: voice language can change
  utter.lang = languageSelect.value;

  const voices = speechSynthesis.getVoices();
  utter.voice = voices.find(v => v.lang === utter.lang) || voices[0];

  utter.rate = 0.95;
  utter.pitch = 1.05;
  utter.volume = 1;

  speechSynthesis.speak(utter);
}

// Command handler
function handleCommand(message) {
  const text = message.toLowerCase();

  if (text.includes("time")) {
    const t = new Date().toLocaleTimeString();
    statusText.innerText = t;
    speak("The time is " + t);
  }
  else if (text.includes("date")) {
    const d = new Date().toDateString();
    statusText.innerText = d;
    speak("Today is " + d);
  }
  else {
    wikipediaSearch(message);
  }
}

// Clean sentence
function cleanQuery(text) {
  return text
    .toLowerCase()
    .replace(/who is|what is|tell me about|define|explain|please|can you|jarvis/gi, "")
    .trim();
}

// GUARANTEED Wikipedia logic
async function wikipediaSearch(query) {
  const cleaned = cleanQuery(query);

  if (!cleaned) {
    speak("Please say the topic clearly");
    return;
  }

  statusText.innerText = "Searching Wikipedia for: " + cleaned;
  speak("Searching");

  try {
    // STEP 1: English Wikipedia SEARCH (ALWAYS WORKS)
    const searchURL =
      `https://en.wikipedia.org/w/api.php` +
      `?action=query&list=search&srsearch=${encodeURIComponent(cleaned)}` +
      `&format=json&origin=*`;

    const searchRes = await fetch(searchURL);
    const searchData = await searchRes.json();

    if (!searchData.query.search.length) {
      statusText.innerText = "No result found";
      speak("I could not find information");
      return;
    }

    // STEP 2: Take best result title
    const title = searchData.query.search[0].title;

    // STEP 3: Get summary
    const summaryURL =
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;

    const summaryRes = await fetch(summaryURL);
    const summaryData = await summaryRes.json();

    if (summaryData.extract) {
      statusText.innerText = summaryData.extract;
      speak(summaryData.extract);
    } else {
      statusText.innerText = "Summary not available";
      speak("Summary not available");
    }

  } catch (err) {
    statusText.innerText = "Network error";
    speak("Network error");
  }
}









