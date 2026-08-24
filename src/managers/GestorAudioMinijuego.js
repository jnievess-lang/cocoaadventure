export default class GestorAudioMinijuego {

    constructor(scene, config = {}) {
        this.scene = scene;
        this.musicKey = config.musicKey ?? "musicaFondo";
        this.musicVolume = config.musicVolume ?? 0.22;
        this.duckedVolume = config.duckedVolume ?? 0.08;
        this.activeVoice = null;
    }

    ensureMusic() {
        let music = this.scene.sound.get(this.musicKey);

        if (!music) {
            music = this.scene.sound.add(this.musicKey, {
                loop: true,
                volume: this.musicVolume
            });
        }

        if (!music.isPlaying) music.play();
        music.setVolume(this.musicVolume);
        return music;
    }

    duckMusic() {
        this.scene.sound.get(this.musicKey)?.setVolume(this.duckedVolume);
    }

    restoreMusic() {
        this.scene.sound.get(this.musicKey)?.setVolume(this.musicVolume);
    }

    playVoice(key, onComplete) {
        this.stopVoice();
        this.duckMusic();

        const voice = this.scene.sound.add(key, { volume: 1 });
        this.activeVoice = voice;
        let finished = false;

        const finish = () => {
            if (finished) return;
            finished = true;
            this.restoreMusic();

            if (this.activeVoice === voice) {
                voice.destroy();
                this.activeVoice = null;
            }

            onComplete?.();
        };

        if (voice.play()) {
            voice.once("complete", finish);
        }
        else {
            this.scene.time.delayedCall(300, finish);
        }

        return voice;
    }

    pauseAll() {
        const music = this.scene.sound.get(this.musicKey);
        if (music?.isPlaying) music.pause();
        if (this.activeVoice?.isPlaying) this.activeVoice.pause();
    }

    resumeAll() {
        const music = this.scene.sound.get(this.musicKey);
        if (music?.isPaused) music.resume();

        if (this.activeVoice?.isPaused) {
            this.activeVoice.resume();
            this.duckMusic();
        }
        else {
            this.restoreMusic();
        }
    }

    stopVoice() {
        if (!this.activeVoice) return;

        this.activeVoice.stop();
        this.activeVoice.destroy();
        this.activeVoice = null;
    }

    destroy() {
        this.stopVoice();
        this.scene = null;
    }

}
