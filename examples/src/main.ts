import './style.css'
import { Voice } from "@needle-tools/kokoro-tts"

const voice = new Voice({
  context: new AudioContext(),
  voice: "af_nicole"
});
voice.say("Hello, world! This is a kokoro text to speech test. I hope you enjoy it!");
let i = setInterval(() => {
  if (voice.state !== "loading") {
    console.log("Voice is ready!");
    clearInterval(i);
  }
});

const input = document.querySelector("#input") as HTMLInputElement;
const form = document.querySelector("#form") as HTMLFormElement;

form.addEventListener("submit", e => {
  e.preventDefault();
  voice.say(input.value);
  input.value = '';
});
