const micBtn = document.getElementById("micBtn");
const statusText = document.getElementById("status");
const languageSelect = document.getElementById("language");

window.speechSynthesis.onvoiceschanged = () => {};

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.interimResults = false;

micBtn.addEventListener("click", e => {
  e.preventDefault();          // ❌ stops Google search
  recognition.lang = languageSelect.value;
  recognition.start();
  statusText.innerText = "Listening...";
});

recognition.onresult = e => {
  const message = e.results[0][0].transcript;
  statusText.innerText = message;
  handleCommand(message);
};

recognition.onerror = () => {
  statusText.innerText = "Tap the mic";
  speak("Please try again");
};

function speak(text){
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = languageSelect.value;

  const voices = speechSynthesis.getVoices();
  speech.voice = voices.find(v => v.lang === speech.lang) || voices[0];

  speech.rate = 0.95;
  speech.pitch = 1.05;
  speech.volume = 1;

  speechSynthesis.speak(speech);
}

function handleCommand(msg){
  const text = msg.toLowerCase();

  if(text.includes("time")){
    speak("The time is " + new Date().toLocaleTimeString());
  }
  else if(text.includes("date")){
    speak("Today is " + new Date().toDateString());
  }
  else if(text.includes("open youtube")){
    speak("Opening YouTube");
    window.open("https://youtube.com","_blank");
  }
  else if(text.includes("open google")){
    speak("Opening Google");
    window.open("https://google.com","_blank");
  }
  else{
    searchWikipedia(msg);
  }
}

async function searchWikipedia(query){
  speak("Searching");
  try{
    const url =
      "https://en.wikipedia.org/api/rest_v1/page/summary/" +
      encodeURIComponent(query);

    const res = await fetch(url);
    const data = await res.json();

    if(data.extract){
      speak(data.extract);
    }else{
      speak("No information found");
    }
  }catch{
    speak("Network error");
  }
}






