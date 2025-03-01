# Kokoro TTS & Needle Engine

Tiny package containing a kokro tts worker and Needle Engine component


For a quick test go to the [./test](/test/) directory and run `npm i && npm dev` and open the local URL in your browser.


### Usage

```ts
import { Voice } from "@needle-tools/kokoro-tts"

const myVoice = new Voice({
  context: new AudioContext(),
  voice: "af_jessica",
});
myVoice.say("Hello World");
```