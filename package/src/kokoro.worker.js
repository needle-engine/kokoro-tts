

/** @type {import("kokoro-js").TextSplitterStream | null} */
let splitter = null;


/** 
 * @type {Omit<import("../types").ConfigureKokoroWorker, "type">}
 */
let workerConfig = {
    voice: "af_alloy",
    speed: 1,
    dtype: "fp32",
    device: "webgpu",
    model_id: "onnx-community/Kokoro-82M-v1.0-ONNX",
}

self.onmessage = async (e) => {
    /** @type {import("../types").MainThreadEventData} */
    const data = e.data;
    switch (data.type) {

        case "configure-worker":
            workerConfig = e;
            break;

        case "say":
            if (splitter) {
                const text = e.data.text;
                const tokens = text.match(/\s*\S+/g);
                for (const token of tokens) {
                    splitter.push(token);
                    await new Promise((resolve) => setTimeout(resolve, 10));
                }
                splitter.flush();
            }
            break;
    }
};

// self.importScripts("https://cdn.jsdelivr.net/npm/kokoro-js/dist/kokoro.js");
// self.importScripts("./node_modules/kokoro-js/dist/kokoro.js");
// self.importScripts("kokoro-js")
import("kokoro-js").then(async kokoro => {
    const { KokoroTTS, TextSplitterStream } = kokoro;

    console.log("Kokoro TTS starting: Downloading model");

    let lastProgressPrintTime = Date.now();
    const model_id = "onnx-community/Kokoro-82M-v1.0-ONNX";
    const tts = await KokoroTTS.from_pretrained(model_id, {
        dtype: workerConfig.dtype,// "fp32", // Options: "fp32", "fp16", "q8", "q4", "q4f16"
        device: workerConfig.device, // Options: "wasm", "webgpu" (web) or "cpu" (node).
        progress_callback: (evt) => {
            if (Date.now() - lastProgressPrintTime > 2000 && evt.status === "progress") {
                lastProgressPrintTime = Date.now();
                console.log(`Downloading kokoro model: ${evt.progress.toFixed(2)}% (${(evt.total / 1024 / 1024).toFixed(2)} MB)`);
            }
        }
    });


    console.log("Kokoro TTS is ready!");
    splitter = new TextSplitterStream();
    const stream = tts.stream(splitter, {
        voice: workerConfig.voice,
        speed: workerConfig.speed,
    });
    (async () => {
        for await (const { text, phonemes, audio } of stream) {
            // console.log({
            //     text,
            //     phonemes,
            //     audio
            // });
            const buffer = audio.toWav();
            /** @type {import("../types").WorkerEventData} */
            const msg = {
                type: "audio",
                audio: buffer,
                sampling_rate: audio.sampling_rate,
                text: text,
            }
            self.postMessage(msg);
        }
    })();

    self.postMessage({ type: "worker-ready" });
    // splitter.flush();
});

