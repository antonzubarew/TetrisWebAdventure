class TetrisAudio {
    constructor() {
        this.synth = new Tone.Synth().toDestination();
        this.initialized = false;
    }

    async init() {
        await Tone.start();
        this.initialized = true;
    }

    playMove() {
        if (!this.initialized) return;
        this.synth.triggerAttackRelease("C4", "32n");
    }

    playRotate() {
        if (!this.initialized) return;
        this.synth.triggerAttackRelease("E4", "32n");
    }

    playDrop() {
        if (!this.initialized) return;
        this.synth.triggerAttackRelease("G3", "16n");
    }

    playClear() {
        if (!this.initialized) return;
        this.synth.triggerAttackRelease("C5", "8n");
    }

    playGameOver() {
        if (!this.initialized) return;
        const now = Tone.now();
        this.synth.triggerAttackRelease("C4", "8n", now);
        this.synth.triggerAttackRelease("G3", "8n", now + 0.1);
        this.synth.triggerAttackRelease("E3", "8n", now + 0.2);
        this.synth.triggerAttackRelease("C3", "4n", now + 0.3);
    }
}
