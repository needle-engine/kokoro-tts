import { ConfigureKokoroWorker } from "./WorkerEvents";

export type VoiceOptions = {
    context: AudioContext;
    worker?: Worker;
    voice: import("kokoro-js").GenerateOptions["voice"],
    speed?: number,
    dtype?: ConfigureKokoroWorker["dtype"],
    device?: ConfigureKokoroWorker["device"],
    model_id?: ConfigureKokoroWorker["model_id"];
}

export declare class Voice { 
    constructor(options: VoiceOptions);
    say(text: string): Promise<void>;
    dispose(): void;
}