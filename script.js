const micBtn = document.getElementById("micBtn");
const statusText = document.getElementById("status");
const languageSelect = document.getElementById("language");

window.speechSynthesis.onvoiceschanged = () => {};

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

micBtn.onclick = () => {
  recognition.lang = languageSelect.value;
  recognition.start();
  statusText.innerText = "Listening...";
};

recognition.onresult = (event) => {
  const message = event.results[0][0].transcript;
  statusText.innerText = "You said: " + message;
  handleCommand(message);
};

function speak(text) {
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = languageSelect.value;

  const voices = speechSynthesis.getVoices();
  speech.voice = voices.find(v => v.lang === speech.lang) || voices[0];

  speech.rate = 0.95;
  speech.pitch = 1.05;
  speech.volume = 1;

  window.speechSynthesis.speak(speech);
}

function handleCommand(message) {
  message = message.toLowerCase();

  if (message.includes("time")) {
    speak("The time is " + new Date().toLocaleTimeString());
  } else if (message.includes("date")) {
    speak("Today is " + new Date().toDateString());
  } else if (message.includes("open youtube")) {
    speak("Opening YouTube");
    window.open("https://youtube.com", "_blank");
  } else if (message.includes("open google")) {
    speak("Opening Google");
    window.open("https://google.com", "_blank");
  } else {
    searchWikipedia(message);
  }
}

async function searchWikipedia(query) {
  speak("Searching Wikipedia");

  const url =
    "https://en.wikipedia.org/api/rest_v1/page/summary/" +
    encodeURIComponent(query);

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.extract) {
      speak(data.extract);
    } else {
      speak("Sorry, I could not find information");
    }
  } catch {
    speak("Error connecting to Wikipedia");
  }
}




