const micBtn = document.getElementById("micBtn");
const statusText = document.getElementById("status");
const languageSelect = document.getElementById("language");

window.speechSynthesis.onvoiceschanged = () => {};

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.interimResults = false;

micBtn.addEventListener("click", e => {
  e.preventDefault();
  recognition.lang = languageSelect.value;
  recognition.start();
  statusText.innerText = "Listening...";
});

recognition.onresult = e => {
  const message = e.results[0][0].transcript;
  statusText.innerText = "You said: " + message;
  handleCommand(message);
};

recognition.onerror = () => {
  statusText.innerText = "Tap the mic";
  speak("Please try again");
};

function speak(text){
  speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = languageSelect.value;
  const voices = speechSynthesis.getVoices();
  utter.voice = voices.find(v => v.lang === utter.lang) || voices[0];
  utter.rate = 0.95;
  utter.pitch = 1.05;
  speechSynthesis.speak(utter);
}

function handleCommand(message){
  const text = message.toLowerCase();
  if(text.includes("time")){
    const t = new Date().toLocaleTimeString();
    statusText.innerText = t;
    speak("The time is " + t);
  }
  else if(text.includes("date")){
    const d = new Date().toDateString();
    statusText.innerText = d;
    speak("Today is " + d);
  }
  else{
    wikiSearch(message);
  }
}

function cleanQuery(text){
  return text.toLowerCase().replace(/who is|what is|tell me about|define|explain|please|can you|jarvis/gi,"").trim();
}

async function wikiSearch(query){
  const cleaned = cleanQuery(query);
  if(!cleaned){
    speak("Please say the topic clearly");
    return;
  }

  statusText.innerText = "Searching Wikipedia for: " + cleaned;
  speak("Searching");

  try{
    const searchURL = `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&origin=*&search=${encodeURIComponent(cleaned)}`;
    const res = await fetch(searchURL);
    const data = await res.json();

    const titles = data[1]; // titles array
    const descriptions = data[2]; // descriptions array

    if(!titles.length){
      statusText.innerText = "No information found";
      speak("I could not find information on " + cleaned);
      return;
    }

    const firstTitle = titles[0];
    const firstDesc = descriptions[0] || "I found " + firstTitle;

    statusText.innerText = firstTitle + ": " + firstDesc;
    speak(firstDesc);

  }catch(err){
    statusText.innerText = "Network error";
    speak("Network error. Please try again");
  }
}










