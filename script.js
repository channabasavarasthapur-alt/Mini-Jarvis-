const output = document.getElementById("output");

async function getAnswer(question) {
  output.innerText = "Searching...";

  let answer = await fromWikipedia(question);
  if (answer) {
    speak(answer);
    output.innerText = answer;
    return;
  }

  answer = await fromDuckDuckGo(question);
  if (answer) {
    speak(answer);
    output.innerText = answer;
    return;
  }

  output.innerText = "Sorry, no information found.";
  speak("Sorry, no information found.");
}

// ---------- WIKIPEDIA ----------
async function fromWikipedia(query) {
  try {
    const title = encodeURIComponent(query.trim().replace(/\s+/g, "_"));
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`;

    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    return data.extract || null;
  } catch {
    return null;
  }
}

// ---------- DUCKDUCKGO ----------
async function fromDuckDuckGo(query) {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(
      query
    )}&format=json&no_redirect=1&no_html=1`;

    const res = await fetch(url);
    const data = await res.json();

    return data.AbstractText || data.Answer || null;
  } catch {
    return null;
  }
}

// ---------- VOICE ----------
function speak(text) {
  window.speechSynthesis.cancel(); // stop if already speaking
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  speechSynthesis.speak(utter);
}


