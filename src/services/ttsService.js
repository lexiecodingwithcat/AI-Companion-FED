import { config } from "../utils/envConfig";

let synth;
let utterance;

export function speakText(text) {
  console.log("TTS engine is set to: " + config.ttsEngine);
  if (config.ttsEngine === "simple") {
    return browserTTS(text);
  } else if (config.ttsEngine === "dummy") {
    return "TTS disabled.";
  } else {
    return "Invalid TTS engine.";
  }
}

// Simple browser TTS using Web Speech API
function browserTTS(text) {
  if (!window.speechSynthesis) {
    console.error("Web Speech API is not supported in this browser.");
    return "Web Speech API not supported.";
  }
  console.log("Web Speech API is supported.");
  synth = window.speechSynthesis;
  utterance = new SpeechSynthesisUtterance(text);
  synth.speak(utterance);
  return "Speaking...";
}

// Function to stop speech
export function stopSpeech() {
  if (synth && synth.speaking) {
    synth.cancel();
    console.log("Speech stopped.");
  }
}