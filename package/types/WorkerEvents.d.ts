
export type WorkerReadyEvent = {
    type: "worker-ready";
}

export type WorkerAudioEventData = {
    type: "audio";
    audio: ArrayBuffer;
    sampling_rate: number;
    text: string;
}

export type WorkerEventData = WorkerReadyEvent | WorkerAudioEventData;


export type ConfigureKokoroWorker = {
    type: "configure-worker";
    voice: import("kokoro-js").GenerateOptions["voice"],
    speed: number,
    dtype?: "fp32" | "fp16" | "q8" | "q4" | "q4f16";
    device?: "wasm" | "webgpu" | "cpu" | null;
    model_id?: string;
}

export type MainThreadEventData = ConfigureKokoroWorker |
{
    type: "say";
    text: string;
}