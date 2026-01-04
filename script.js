const micBtn = document.getElementById("micBtn");
const statusText = document.getElementById("status");
const languageSelect = document.getElementById("language");

/* Prevent voice loading bug */
window.speechSynthesis.onvoiceschanged = () => {};

/* Speech Recognition */
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.interimResults = false;

/* Mic click */
micBtn.addEventListener("click", e => {
  e.preventDefault();                 // ❌ stop Google search
  recognition.lang = languageSelect.value;
  recognition.start();
  statusText.innerText = "Listening...";
});

/* Result */
recognition.onresult = e => {
  const message = e.results[0][0].transcript;
  statusText.innerText = message;
  handleCommand(message);
};

/* Error */
recognition.onerror = () => {
  statusText.innerText = "Tap the mic";
  speak("Please try again");
};

/* Speak */
function speak(text) {
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = languageSelect.value;

  const voices = speechSynthesis.getVoices();
  speech.voice = voices.find(v => v.lang === speech.lang) || voices[0];

  speech.rate = 0.95;
  speech.pitch = 1.05;
  speech.volume = 1;

  speechSynthesis.speak(speech);
}

/* Handle commands */
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
    searchWikipedia(message);
  }
}

/* Clean query for Wikipedia */
function cleanQuery(text) {
  return text
    .toLowerCase()
    .replace(
      /who is|what is|tell me about|define|explain|search|wikipedia|please|can you|could you/gi,
      ""
    )
    .trim();
}

/* Wikipedia search */
async function searchWikipedia(query) {
  const cleaned = cleanQuery(query);

  if (!cleaned) {
    speak("Please say the topic clearly");
    return;
  }

  speak("Searching");

  try {
    const url =
      "https://en.wikipedia.org/api/rest_v1/page/summary/" +
      encodeURIComponent(cleaned);

    const res = await fetch(url);
    const data = await res.json();

    if (data.extract && !data.type) {
      speak(data.extract);
    } else {
      speak("I could not find information about " + cleaned);
    }
  } catch (error) {
    speak("Network error");
  }
}







