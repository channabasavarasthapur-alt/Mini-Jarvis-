const micBtn = document.getElementById("micBtn");
const statusText = document.getElementById("status");
const languageSelect = document.getElementById("language");

/* Fix voice loading */
window.speechSynthesis.onvoiceschanged = () => {};

/* Speech Recognition */
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.interimResults = false;

/* Mic click */
micBtn.addEventListener("click", e => {
  e.preventDefault(); // stop Google search
  recognition.lang = languageSelect.value;
  recognition.start();
  statusText.innerText = "Listening...";
});

/* Speech result */
recognition.onresult = e => {
  const message = e.results[0][0].transcript;
  statusText.innerText = message;
  handleCommand(message);
};

recognition.onerror = () => {
  statusText.innerText = "Tap the mic";
  speak("Please try again");
};

/* Speak */
function speak(text) {
  speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = languageSelect.value;

  const voices = speechSynthesis.getVoices();
  speech.voice = voices.find(v => v.lang === speech.lang) || voices[0];

  speech.rate = 0.95;
  speech.pitch = 1.05;
  speech.volume = 1;

  speechSynthesis.speak(speech);
}

/* Command handling */
function handleCommand(message) {
  const text = message.toLowerCase();

  if (text.includes("time")) {
    speak("The time is " + new Date().toLocaleTimeString());
  }
  else if (text.includes("date")) {
    speak("Today is " + new Date().toDateString());
  }
  else if (text.includes("open youtube")) {
    speak("Opening YouTube");
    window.open("https://youtube.com", "_blank");
  }
  else if (text.includes("open google")) {
    speak("Opening Google");
    window.open("https://google.com", "_blank");
  }
  else {
    wikipediaSmartSearch(message);
  }
}

/* Clean user sentence */
function cleanQuery(text) {
  return text
    .toLowerCase()
    .replace(
      /who is|what is|tell me about|define|explain|search|wikipedia|please|can you|could you|jarvis/gi,
      ""
    )
    .trim();
}

/* SMART Wikipedia search (SEARCH → SUMMARY) */
async function wikipediaSmartSearch(query) {
  const cleaned = cleanQuery(query);

  if (!cleaned) {
    speak("Please say the topic clearly");
    return;
  }

  speak("Searching Wikipedia");

  try {
    /* STEP 1: Search */
    const searchURL =
      `https://en.wikipedia.org/w/api.php?` +
      `action=opensearch&format=json&origin=*` +
      `&search=${encodeURIComponent(cleaned)}`;

    const searchRes = await fetch(searchURL);
    const searchData = await searchRes.json();

    const titles = searchData[1];

    if (!titles || titles.length === 0) {
      speak("No information found");
      return;
    }

    /* STEP 2: Get first result summary */
    const bestTitle = titles[0];

    const summaryURL =
      `https://en.wikipedia.org/api/rest_v1/page/summary/` +
      encodeURIComponent(bestTitle);

    const summaryRes = await fetch(summaryURL);
    const summaryData = await summaryRes.json();

    if (summaryData.extract) {
      speak(summaryData.extract);
    } else {
      speak("I found information but cannot read it");
    }

  } catch (err) {
    speak("Network error");
  }
}








