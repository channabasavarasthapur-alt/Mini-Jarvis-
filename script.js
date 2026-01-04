const micBtn = document.getElementById("micBtn");
const statusText = document.getElementById("status");
const languageSelect = document.getElementById("language");

let isSpeaking = false;
let voices = [];

// Load voices properly
function loadVoices(){
    voices = window.speechSynthesis.getVoices();
    if(!voices.length){
        setTimeout(loadVoices, 100);
    }
}
loadVoices();
window.speechSynthesis.onvoiceschanged = loadVoices;

// Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.interimResults = false;

// CLICK MIC
micBtn.addEventListener("click", () => {
    // Stop current speech
    if(isSpeaking){
        window.speechSynthesis.cancel();
        isSpeaking = false;
    }

    recognition.lang = languageSelect.value;
    recognition.start();
    statusText.innerText = "Listening...";
});

// SPEECH RECOGNITION RESULT
recognition.onresult = (e) => {
    const message = e.results[0][0].transcript;
    statusText.innerText = "You said: " + message;
    handleCommand(message);
};

recognition.onerror = () => {
    statusText.innerText = "Tap the mic";
    speak("Please try again");
};

// SPEAK FUNCTION
function speak(text){
    if(window.speechSynthesis.speaking){
        window.speechSynthesis.cancel();
    }
    isSpeaking = true;

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = languageSelect.value;

    // Pick a proper voice
    let voice = voices.find(v => v.lang === utter.lang);
    if(!voice) voice = voices[0]; // fallback
    utter.voice = voice;

    utter.rate = 0.95;
    utter.pitch = 1.05;

    utter.onend = () => { isSpeaking = false; };

    window.speechSynthesis.speak(utter);
}

// HANDLE COMMANDS
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
        window.open("https://youtube.com", "_blank");
    }
    else if(text.includes("open google")){
        speak("Opening Google");
        window.open("https://google.com", "_blank");
    }
    else{
        wikiSearch(message);
    }
}

// CLEAN USER INPUT
function cleanQuery(text){
    return text.toLowerCase()
        .replace(/who is|what is|tell me about|define|explain|please|can you|jarvis/gi,"")
        .trim();
}

// WIKIPEDIA SEARCH
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
