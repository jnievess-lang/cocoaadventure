import Phaser from "phaser";

export default class TemporizadorRegresivo extends Phaser.GameObjects.Container {

    constructor(scene, config) {
        super(scene, 0, 0);
        scene.add.existing(this);

        this.durationSeconds = Math.max(1, Math.floor(config.durationSeconds));
        this.remainingTime = this.durationSeconds;
        this.warningSeconds = config.warningSeconds ?? 10;
        this.warningSoundKey = config.warningSoundKey ?? "sfxAvisoTiempo";
        this.onTimeUp = config.onTimeUp;
        this.timerEvent = null;
        this.warningSound = null;

        const width = scene.scale.width;
        const height = scene.scale.height;
        const centerX = width * (config.centerX ?? 0.5);
        const centerY = height * (config.centerY ?? 0.095);

        this.panel = scene.add.image(
            centerX,
            centerY,
            config.panelTexture ?? "PanelTemporizador"
        );
        this.panel.setScale(
            (width * (config.displayWidth ?? 0.13)) / this.panel.width
        );

        this.text = scene.add.text(
            width * (config.textX ?? 0.52),
            centerY,
            this.formatTime(this.remainingTime),
            {
                fontFamily: "Trebuchet MS",
                fontSize: `${height * (config.fontSize ?? 0.044)}px`,
                color: "#FFFFFF",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        this.add([this.panel, this.text]);
        this.setDepth(config.depth ?? 50);
    }

    start() {
        if (this.timerEvent) return;

        this.timerEvent = this.scene.time.addEvent({
            delay: 1000,
            callback: this.tick,
            callbackScope: this,
            loop: true
        });
    }

    tick() {
        this.remainingTime--;

        if (this.remainingTime === this.warningSeconds) {
            this.showWarning();
        }

        if (this.remainingTime <= 0) {
            this.remainingTime = 0;
            this.text.setText("00:00");
            this.stop();
            this.onTimeUp?.();
            return;
        }

        this.text.setText(this.formatTime(this.remainingTime));
    }

    showWarning() {
        this.panel.setTint(0xFFB06A);
        this.text.setColor("#FFF2C2").setScale(1.08);

        if (this.scene.cache.audio.exists(this.warningSoundKey)) {
            this.warningSound = this.scene.sound.add(
                this.warningSoundKey,
                { volume: 0.6 }
            );
            this.warningSound.play();
        }
    }

    formatTime(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    pause() {
        if (this.timerEvent) this.timerEvent.paused = true;
        if (this.warningSound?.isPlaying) this.warningSound.pause();
    }

    resume() {
        if (this.timerEvent) this.timerEvent.paused = false;
        if (this.warningSound?.isPaused) this.warningSound.resume();
    }

    stop() {
        if (this.timerEvent) {
            this.timerEvent.remove();
            this.timerEvent = null;
        }

        if (this.warningSound) {
            this.warningSound.stop();
            this.warningSound.destroy();
            this.warningSound = null;
        }
    }

    destroy(fromScene) {
        this.stop();
        super.destroy(fromScene);
    }

}
