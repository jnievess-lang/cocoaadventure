import TemporizadorRegresivo from "./TemporizadorRegresivo";
import BotonIconoHud from "./BotonIconoHud";
import IndicadorVidas from "./IndicadorVidas";
import PanelPausa from "./PanelPausa";

export default class HudMinijuego {

    constructor(scene, config) {
        this.scene = scene;
        this.config = config;
        this.audio = config.audioManager;
        this.state = "idle";
        this.pauseOverlay = null;

        this.createLives(config.lives);
        this.createTimer(config.timer);
        this.createControls(config.controls);
    }

    createLives(config = {}) {
        if (config.enabled === false) {
            this.livesDisplay = null;
            return;
        }

        this.livesDisplay = new IndicadorVidas(this.scene, {
            ...config,
            maxLives: config.maxLives ?? 3
        });
    }

    createTimer(config = {}) {
        this.timer = new TemporizadorRegresivo(this.scene, {
            ...config,
            durationSeconds: config.durationSeconds ?? 60,
            onTimeUp: () => this.handleTimeUp()
        });
    }

    createControls(config = {}) {
        const width = this.scene.scale.width;
        const height = this.scene.scale.height;
        const buttonWidth = Math.min(width * 0.055, height * 0.09);
        const common = {
            displayWidth: buttonWidth,
            hitWidth: width * 0.085,
            hitHeight: height * 0.12,
            depth: 51
        };

        this.pauseButton = new BotonIconoHud(this.scene, {
            ...common,
            x: width * (config.pauseX ?? 0.925),
            y: height * (config.pauseY ?? 0.085),
            texture: "btnPausa",
            onActivate: () => this.pause()
        }).setIconAlpha(0.78);

        this.replayButton = new BotonIconoHud(this.scene, {
            ...common,
            x: width * (config.replayX ?? 0.94),
            y: height * (config.replayY ?? 0.90),
            texture: "btnRepetirAudio",
            onActivate: () => this.replayInstruction()
        });

        this.replayButton.setVisible(false);
    }

    start() {
        if (this.state !== "idle") return;

        this.state = "running";
        this.timer.start();
        this.pauseButton.setIconAlpha(1).setEnabled(true);

        if (this.config.instructionAudio) {
            this.replayButton.setVisible(true).setEnabled(true);
        }
    }

    loseLife() {
        if (this.state !== "running" || !this.livesDisplay) {
            return this.livesDisplay?.remainingLives ?? 0;
        }

        const remainingLives = this.livesDisplay.loseLife();

        if (remainingLives <= 0) {
            this.stop();
            this.config.onLivesEmpty?.();
        }

        return remainingLives;
    }

    calculateStars(maximumStars = 3) {
        return this.livesDisplay
            ? this.livesDisplay.calculateStars(maximumStars)
            : maximumStars;
    }

    getRemainingLives() {
        return this.livesDisplay?.remainingLives ?? null;
    }

    getRemainingTime() {
        return this.timer.remainingTime;
    }

    pause() {
        if (this.state !== "running") return;

        this.suspend("paused");
        this.audio?.pauseAll();

        this.pauseOverlay = new PanelPausa(this.scene, {
            onResume: () => this.resume(),
            onExit: () => this.exit()
        });
    }

    resume() {
        if (this.state !== "paused") return;

        this.pauseOverlay?.destroy(true);
        this.pauseOverlay = null;
        this.audio?.resumeAll();
        this.restoreRunningState("pause");
    }

    replayInstruction() {
        if (this.state !== "running" || !this.config.instructionAudio) return;

        this.suspend("replayingInstruction");
        this.audio?.playVoice(
            this.config.instructionAudio,
            () => this.finishInstructionReplay()
        );
    }

    finishInstructionReplay() {
        if (this.state !== "replayingInstruction") return;
        this.restoreRunningState("instruction");
    }

    suspend(nextState) {
        this.state = nextState;
        this.timer.pause();
        this.scene.tweens.pauseAll();
        this.setControlsEnabled(false);
        this.config.onGameplaySuspended?.(nextState);
    }

    restoreRunningState(reason) {
        this.scene.tweens.resumeAll();
        this.state = "running";
        this.timer.resume();
        this.setControlsEnabled(true);
        this.config.onGameplayResumed?.(reason);
    }

    setControlsEnabled(enabled) {
        this.pauseButton.setEnabled(enabled);

        if (this.config.instructionAudio) {
            this.replayButton.setEnabled(enabled);
        }
    }

    handleTimeUp() {
        if (this.state !== "running") return;
        this.stop();
        this.config.onTimeUp?.();
    }

    exit() {
        this.stop();
        this.audio?.resumeAll();
        this.config.onExit?.();
    }

    stop() {
        if (this.state === "stopped") return;

        if (this.state === "paused" || this.state === "replayingInstruction") {
            this.scene.tweens.resumeAll();
        }

        this.state = "stopped";
        this.timer.stop();
        this.setControlsEnabled(false);
        this.pauseOverlay?.destroy(true);
        this.pauseOverlay = null;
    }

    destroy() {
        this.stop();
        this.timer.destroy(true);
        this.livesDisplay?.destroy(true);
        this.pauseButton.destroy(true);
        this.replayButton.destroy(true);
        this.scene = null;
        this.audio = null;
    }

}
