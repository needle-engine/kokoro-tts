# Kokoro TTS & Needle Engine

This package contains a kokoro TTS worker and a small typed API for local text to speech.   

[Live Example](https://needle-engine.github.io/kokoro-tts/)

### Usage

```ts
import { Voice } from "@needle-tools/kokoro-tts"

const myVoice = new Voice({
  context: new AudioContext(),
  voice: "af_jessica",
});
myVoice.say("Hello World");
```


To test it locally go to the [./examples](/examples/) directory and run `npm i && npm dev`, then open the local URL in your browser.
