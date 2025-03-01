import { ConfigureKokoroWorker } from "./WorkerEvents";

export type VoiceOptions = {
    /** The audio context to use */
    context: AudioContext;
    /** The voice to use */
    voice: import("kokoro-js").GenerateOptions["voice"],
    /**
     * The speed of the voice. A number between 0.5 and 2.0.
     * @default 1.0
     */
    speed?: number,
    /**
     * The model type to use. If not provided, the default model will be used.
     */
    dtype?: ConfigureKokoroWorker["dtype"],
    /**
     * The device to use. If not provided, the default device will be used.
     * @default "webgpu"
     */
    device?: ConfigureKokoroWorker["device"],
    /**
     * The model ID to use. If not provided, the default model will be used.
     */
    model_id?: ConfigureKokoroWorker["model_id"];
}

/**
 * A class for using text to speech
 */
export class Voice {
    constructor(options: VoiceOptions);
    /** The current state:
     * - "loading": The voice model is loading
     * - "idle": Ready to speak
     * - "speaking": Currently playing audio
    */
    get state(): "loading" | "idle" | "speaking";
    /** @param text The text to say */
    say(text: string): Promise<void>;
    /** Dispose of the resources used by the voice */
    dispose(): void;
}