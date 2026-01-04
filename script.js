const micBtn = document.getElementById("micBtn");
const statusText = document.getElementById("status");
const languageSelect = document.getElementById("language");

let isSpeaking = false;
let wakeListening = true;

window.speechSynthesis.onvoiceschanged = () => {};

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.interimResults = false;
recognition.continuous = true; // Keep listening for wake word

// Start wake word listening automatically
recognition.lang = languageSelect.value;
recognition.start();
statusText.innerText = "Listening for 'Hey Jarvis'...";

recognition.onresult = e => {
  const message = e.results[e.results.length -1][0].transcript.trim();
  console.log("Speech detected:", message);

  if(isSpeaking){
    window.speechSynthesis.cancel();
    isSpeaking = false;
  }

  // Wake word detection
  if(wakeListening && message.toLowerCase().includes("hey jarvis")){
    statusText.innerText = "Jarvis Activated!";
    speak("Yes, I am listening.");
    wakeListening = false; // temporarily disable wake listening
    listenForCommand(); // now listen for actual command
  }
};

recognition.onerror = () => {
  statusText.innerText = "Tap mic or reload";
};

// Function to speak
function speak(text){
  if(window.speechSynthesis.speaking){
    window.speechSynthesis.cancel();
  }

  isSpeaking = true;

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = languageSelect.value;

  const voices = window.speechSynthesis.getVoices();
  utter.voice = voices.find(v => v.lang === utter.lang) || voices[0];

  utter.rate = 0.95;
  utter.pitch = 1.05;

  utter.onend = () => { isSpeaking = false; };

  window.speechSynthesis.speak(utter);
}

// Function to listen for actual command after wake word
function listenForCommand(){
  const commandRec = new SpeechRecognition();
  commandRec.interimResults = false;
  commandRec.lang = languageSelect.value;

  statusText.innerText = "Listening for your command...";

  commandRec.onresult = e => {
    const cmd = e.results[0][0].transcript;
    statusText.innerText = "You said: " + cmd;
    handleCommand(cmd);
    wakeListening = true; // re-enable wake word
  };

  commandRec.onerror = () => {
    statusText.innerText = "Tap mic";
    wakeListening = true;
  };

  commandRec.start();
}

// Command handling (same as before)
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
  else if(text.includes("open youtube")){
    speak("Opening YouTube");
    window.open("https://youtube.com","_blank");
  }
  else if(text.includes("open google")){
    speak("Opening Google");
    window.open("https://google.com","_blank");
  }
  else{
    wikiSearch(message);
  }
}

function cleanQuery(text){
  return text.toLowerCase()
    .replace(/who is|what is|tell me about|define|explain|please|can you|jarvis/gi,"")
    .trim();
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

    const titles = data[1];
    const descriptions = data[2];

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









