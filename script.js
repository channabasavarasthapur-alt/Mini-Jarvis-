const micBtn = document.getElementById("mic");
const statusText = document.getElementById("status");
const languageSelect = document.getElementById("language");

let voices = [];

// Load voices
speechSynthesis.onvoiceschanged = () => {
  voices = speechSynthesis.getVoices();
};

// Force unlock speech (IMPORTANT)
function unlockSpeech() {
  const u = new SpeechSynthesisUtterance(" ");
  u.volume = 0;
  speechSynthesis.speak(u);
  speechSynthesis.cancel();
}

function speak(text) {
  if (!text) return;

  speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);

  // FORCE voice
  const selectedLang = languageSelect.value;
  const voice = voices.find(v => v.lang === selectedLang) || voices[0];
  utter.voice = voice;
  utter.lang = voice.lang;

  speechSynthesis.speak(utter);
}

/* ---------------- MIC ---------------- */

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.continuous = false;

micBtn.addEventListener("click", () => {
  unlockSpeech(); // 🔥 THIS FIXES NO SOUND
  speechSynthesis.cancel();
  recognition.lang = languageSelect.value;
  recognition.start();
  statusText.innerText = "Listening...";
});

recognition.onresult = (e) => {
  const text = e.results[0][0].transcript;
  statusText.innerText = "You said: " + text;
  wiki(text);
};

/* ---------------- WIKI ---------------- */

function clean(text) {
  return text
    .toLowerCase()
    .replace(/who is|what is|tell me about|define|explain/gi, "")
    .trim();
}

async function wiki(query) {
  const topic = clean(query);
  if (!topic) {
    speak("Please repeat");
    return;
  }

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


