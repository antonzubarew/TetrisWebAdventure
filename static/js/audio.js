class TetrisAudio {
    constructor() {
        this.synth = null;
        this.initialized = false;
    }

    async init() {
        try {
            this.synth = new Tone.Synth().toDestination();
            await Tone.start();
            this.initialized = true;
            console.log('Audio initialized successfully');
        } catch (error) {
            console.warn('Audio initialization failed:', error);
            this.initialized = false;
        }
    }

    async playSoundSafely(noteFunction) {
        if (!this.initialized || !this.synth) {
            console.warn('Audio not initialized, skipping sound playback');
            return;
        }
        try {
            await noteFunction();
        } catch (error) {
            console.warn('Error playing sound:', error);
            this.initialized = false;
        }
    }

    playMove() {
        this.playSoundSafely(() => this.synth.triggerAttackRelease("C4", "32n"));
    }

    playRotate() {
        this.playSoundSafely(() => this.synth.triggerAttackRelease("E4", "32n"));
    }

    playDrop() {
        this.playSoundSafely(() => this.synth.triggerAttackRelease("G3", "16n"));
    }

    playClear() {
        this.playSoundSafely(() => this.synth.triggerAttackRelease("C5", "8n"));
    }

    playGameOver() {
        if (!this.initialized || !this.synth) {
            console.warn('Audio not initialized, skipping game over sound');
            return;
        }
        try {
            const now = Tone.now();
            this.synth.triggerAttackRelease("C4", "8n", now);
            this.synth.triggerAttackRelease("G3", "8n", now + 0.1);
            this.synth.triggerAttackRelease("E3", "8n", now + 0.2);
            this.synth.triggerAttackRelease("C3", "4n", now + 0.3);
        } catch (error) {
            console.warn('Error playing game over sound:', error);
            this.initialized = false;
        }
    }
}
