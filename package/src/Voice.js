import KokoroWorker from './kokoro.worker.js?worker&inline';


let canPlayAudio = false;

window.addEventListener("pointerdown", () => {
    canPlayAudio = true;
});
window.addEventListener("keydown", () => {
    canPlayAudio = true;
});


/**
 * @type {import("../types").Voice}
 */
export class Voice {

    /** 
     * @param {import("../types").VoiceOptions} opts
     */
    constructor(opts) {
        this.context = opts.context;

        this._workerReady = false;

        /**
         * @type {import("../types/WorkerEvents").MainThreadEventData}
         */
        const configureMessage = {
            type: "configure-worker",
            voice: opts.voice,
            speed: opts.speed || 1,
            dtype: opts.dtype,
            device: opts.device,
            model_id: opts.model_id,
        }
        // https://vite.dev/guide/features.html#web-workers
        // const workerPath = new URL('./src/kokoro.worker.js', import.meta.url);
        this.worker = opts.worker || new KokoroWorker(); //new Worker(workerPath, { type: "module" });
        this.worker.postMessage(configureMessage);
        this.worker.onmessage = this.onMessage;
        console.debug("Voice created");
        this.onUpdate();
    }

    _workerReady = false;

    /** @type {Array<import("../types/WorkerEvents").WorkerAudioEventData>} */
    _queued = new Array();

    /** @type {ArrayBuffer | null} */
    _activeBuffer = null;
    /** @type {AudioBufferSourceNode | null} */
    _activeTrack = null;

    /** @type {string | null} */
    _sayNext = null;
    /** @type {null | ((val:any) => void)} */
    _sayNextResolve = null;
    /** @type {string | null} */
    _sayNextResolveText = null;
    /** @type {string | null} */
    _currentlySaying = null;
    /** @type {number} */
    _charactersSaid = 0;

    /**
     * Dispose of the voice object
     */
    dispose() {
        console.debug("Voice disposed");
        this._queued.length = 0;
        this._activeTrack?.disconnect();
        this.worker.terminate();
    }

    /**
     * Schedule a text to be spoken
     * @param {string} text 
     * @returns {Promise<void>}
     */
    say(text) {
        console.debug("Say:", text);
        this._sayNext = text;
        this._sayNextResolveText = text;
        const promise = new Promise((resolve) => {
            this._sayNextResolve = resolve;
        });
        return promise;
        // if (this._sayNext === null) {
        // }
        // let resolve: (() => void);
        // const promise = new Promise<void>(r => { resolve = r; });
        // this._sayQueue.push({ text, resolve: resolve! });
        // return promise;
    }

    /**
     * @internal
     */
    onUpdate = () => {

        // const _sayNext = 

        if (this._sayNext && this._workerReady) {
            this._currentlySaying = this._sayNext;
            this.worker.postMessage({ type: "say", text: this._sayNext });
            this._sayNext = null;
        }

        if (this._activeBuffer === null && canPlayAudio) {
            if (this._queued.length > 0) {
                const data = this._queued.shift() || null;
                if (data) {
                    this._activeBuffer = data.audio;
                    this.context.decodeAudioData(this._activeBuffer).then(buffer => {
                        if (this._activeTrack) {
                            this._activeTrack.disconnect();
                            this._activeTrack.stop();
                        }
                        this._activeTrack = this.context.createBufferSource();
                        this._activeTrack.connect(this.context.destination);
                        this._activeTrack.buffer = buffer;
                        this._activeTrack.start(0);
                        setTimeout(() => {
                            this._charactersSaid += data.text.length;
                            this._activeBuffer = null;
                            console.debug(this._charactersSaid, this._currentlySaying?.length, this._queued.length, data.text);
                            // if(this._currentlySaying && this._charactersSaid >= this._currentlySaying.length) 
                            if (this._currentlySaying && this._queued.length <= 0 && this._charactersSaid >= this._currentlySaying?.length * .5) {
                                this._sayNextResolve?.(void 0);
                            }
                            // if (data.text === this._sayNextResolveText) {
                            // }
                            // else {
                            //     console.warn("Text mismatch", data.text, this._sayNextResolveText);
                            // }
                        }, buffer.duration * 1000);
                    });
                }
            }
        }

        window.requestAnimationFrame(this.onUpdate);
    }

    /** 
     * @inernal 
     * @param {MessageEvent<import("../types/WorkerEvents").WorkerEventData>} evt
    */
    onMessage = (evt) => {

        const data = (evt.data);
        switch (data.type) {
            case "worker-ready":
                console.debug("Worker ready");
                this._workerReady = true;
                break;
            case "audio":
                this._queued.push(data);
                if (this._queued.length > 10) {
                    console.warn("Buffer queue is getting long, dropping old buffers");
                    this._queued.shift();
                }
                break;
            default:
                console.warn("Unknown event type", data);
                break;
        }
    }
}