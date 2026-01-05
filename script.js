const output = document.getElementById("output");

// MAIN FUNCTION
async function getAnswer(question) {
  if (!question || question.trim().length < 2) {
    output.innerText = "Please ask a proper question.";
    speak("Please ask a proper question.");
    return;
  }

  speechSynthesis.cancel();
  output.innerText = "🔍 Searching in Wikipedia...";

  let answer = await fromWikipedia(question);

  // If Wikipedia has good answer
  if (answer && answer.length > 60) {
    showAnswer(answer);
    return;
  }

  // Wikipedia failed → show message
  output.innerText = "❌ No info found in Wikipedia, searching in other platform...";
  speak("No info found in Wikipedia. Searching in other platform.");

  answer = await fromDuckDuckGo(question);

  if (answer && answer.length > 20) {
    showAnswer(answer);
    return;
  }

  const fallback = "Sorry, no information found anywhere.";
  output.innerText = fallback;
  speak(fallback);
}

// ---------- WIKIPEDIA ----------
async function fromWikipedia(query) {
  try {
    const title = encodeURIComponent(
      query.trim().replace(/\s+/g, "_")
    );
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

// ---------- DISPLAY + VOICE ----------
function showAnswer(text) {
  output.innerText = text;
  speak(text);
}

// ---------- SPEECH ----------
function speak(text) {
  if (!("speechSynthesis" in window)) return;

  speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  utter.rate = 1;
  utter.pitch = 1;
  speechSynthesis.speak(utter);
}




