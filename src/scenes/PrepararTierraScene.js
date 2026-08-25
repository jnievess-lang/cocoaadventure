import Phaser from "phaser";
import TutorialPanel from "../ui/TutorialPanel";
import ResultPanel from "../ui/ResultPanel";
import HudMinijuego from "../ui/HudMinijuego";
import GestorAudioMinijuego from "../managers/GestorAudioMinijuego";
import ProgressManager from "../managers/ProgressManager";

const LEVEL_CONFIG = Object.freeze({
    durationSeconds: 60,
    maxLives: 3,
    requiredSupplies: 12,
    spawnDelay: 1050,
    maximumStars: 3
});

export default class PrepararTierraScene extends Phaser.Scene {

    constructor() {
        super("PrepararTierraScene");
    }

    create() {
        const { width, height } = this.scale;

        this.width = width;
        this.height = height;
        this.levelState = "tutorial";
        this.suppliesPrepared = 0;
        this.targets = [];
        this.spawnEvent = null;
        this.pointerIsDown = false;
        this.audio = new GestorAudioMinijuego(this);

        this.createBackground();
        this.createProgress();
        this.createHud();
        this.audio.ensureMusic();
        this.showTutorial();
        this.setupLifecycleEvents();
    }

    createBackground() {
        this.cameras.main.setBackgroundColor("#8FD3FF");

        const groundHeight = this.height * 0.19;
        this.add.tileSprite(
            this.width / 2,
            this.height - groundHeight / 2,
            this.width,
            groundHeight,
            "MosaicoTierra"
        ).setDepth(1);
    }

    createProgress() {
        const x = this.width * 0.16;
        const y = this.height * 0.075;

        const panel = this.add.rectangle(
            x, y, this.width * 0.16, this.height * 0.065, 0xFFF1C6, 0.96
        ).setDepth(50);
        panel.setStrokeStyle(Math.max(3, this.height * 0.004), 0x7C431B, 1);

        const icon = this.add.image(x - this.width * 0.05, y, "Fertilizante");
        icon.setScale((this.height * 0.048) / icon.height).setDepth(51);

        this.progressText = this.add.text(x + this.width * 0.022, y,
            `0 / ${LEVEL_CONFIG.requiredSupplies}`,
            {
                fontFamily: "Trebuchet MS",
                fontSize: `${this.height * 0.03}px`,
                color: "#5F3215",
                fontStyle: "bold"
            }
        ).setOrigin(0.5).setDepth(51);
    }

    createHud() {
        this.hud = new HudMinijuego(this, {
            lives: {
                maxLives: LEVEL_CONFIG.maxLives,
                centerX: 0.61,
                availableWidth: 0.16
            },
            timer: {
                durationSeconds: LEVEL_CONFIG.durationSeconds,
                centerX: 0.43,
                // El reloj ocupa el lado izquierdo del panel.
                textX: 0.457
            },
            controls: {},
            instructionAudio: "vozPrepararTierra",
            audioManager: this.audio,
            onTimeUp: () => this.failLevel("time"),
            onLivesEmpty: () => this.failLevel("lives"),
            onGameplaySuspended: () => this.suspendGameplay(),
            onGameplayResumed: () => this.resumeGameplay(),
            onExit: () => this.scene.start("SembrarScene")
        });
    }

    showTutorial() {
        this.audio.duckMusic();

        new TutorialPanel(this, {
            character: "CacaitoIndicaciones",
            text: "Debes poner fertilizante e insecticida para tener la tierra lista para sembrar, cuidado con las bombas.",
            audio: "vozPrepararTierra",
            onVoiceStart: () => this.audio.duckMusic(),
            onComplete: () => {
                this.audio.restoreMusic();
                this.startLevel();
            }
        });
    }

    startLevel() {
        this.levelState = "playing";
        this.hud.start();
        this.spawnTarget();
        this.spawnEvent = this.time.addEvent({
            delay: LEVEL_CONFIG.spawnDelay,
            callback: this.spawnTarget,
            callbackScope: this,
            loop: true
        });

        this.input.on("pointerdown", this.handlePointerDown, this);
        this.input.on("pointermove", this.handlePointerMove, this);
        this.input.on("pointerup", this.handlePointerUp, this);
        this.input.on("pointerupoutside", this.handlePointerUp, this);
    }

    spawnTarget() {
        if (this.levelState !== "playing") return;

        const activeTargets = this.targets.filter(target => target.active && !target.sliced);
        if (activeTargets.length >= 6) return;

        const isBomb = Phaser.Math.Between(1, 100) <= 24;
        const texture = isBomb
            ? "Bomba"
            : Phaser.Utils.Array.GetRandom(["Fertilizante", "Insecticida"]);
        const x = Phaser.Math.Between(this.width * 0.13, this.width * 0.87);
        const y = this.height * 0.84;
        const target = this.add.image(x, y, texture).setDepth(10);
        const displayWidth = isBomb ? this.width * 0.055 : this.width * 0.072;

        target.setScale(displayWidth / target.width);
        target.kind = isBomb ? "bomb" : "supply";
        target.sliced = false;
        target.setInteractive({ useHandCursor: true });
        target.on("pointerdown", () => this.sliceTarget(target));
        this.targets.push(target);

        const peakY = Phaser.Math.Between(this.height * 0.22, this.height * 0.57);
        const endX = Phaser.Math.Clamp(
            x + Phaser.Math.Between(-this.width * 0.19, this.width * 0.19),
            this.width * 0.09,
            this.width * 0.91
        );
        const flightDuration = Phaser.Math.Between(1600, 2300);

        this.tweens.add({
            targets: target,
            x: endX,
            y: peakY,
            angle: Phaser.Math.Between(-150, 150),
            duration: flightDuration * 0.48,
            ease: "Quad.Out",
            onComplete: () => {
                if (!target.active || target.sliced) return;
                this.tweens.add({
                    targets: target,
                    y: this.height * 1.08,
                    angle: target.angle + Phaser.Math.Between(-180, 180),
                    duration: flightDuration * 0.52,
                    ease: "Quad.In",
                    onComplete: () => target.destroy()
                });
            }
        });
    }

    handlePointerDown(pointer) {
        this.pointerIsDown = true;
        this.trySliceAt(pointer);
    }

    handlePointerMove(pointer) {
        if (this.pointerIsDown) this.trySliceAt(pointer);
    }

    handlePointerUp() {
        this.pointerIsDown = false;
    }

    trySliceAt(pointer) {
        if (this.levelState !== "playing") return;

        const target = this.targets.find(candidate =>
            candidate.active && !candidate.sliced &&
            Phaser.Geom.Rectangle.Contains(candidate.getBounds(), pointer.x, pointer.y)
        );

        if (target) this.sliceTarget(target);
    }

    sliceTarget(target) {
        if (this.levelState !== "playing" || !target.active || target.sliced) return;

        target.sliced = true;
        target.disableInteractive();
        this.tweens.killTweensOf(target);

        if (target.kind === "bomb") {
            target.setTexture("Explosion");
            target.setScale((this.width * 0.085) / target.width);
            this.sound.play("sfxSeleccionIncorrecta", { volume: 0.55 });
            this.hud.loseLife();
            this.tweens.add({
                targets: target,
                scale: target.scaleX * 1.18,
                alpha: 0,
                duration: 440,
                onComplete: () => target.destroy()
            });
            return;
        }

        target.setTexture(target.texture.key === "Fertilizante"
            ? "FertilizanteCortado"
            : "InsecticidaCortado");
        target.setScale((this.width * 0.082) / target.width);
        this.sound.play("sfxSeleccionCorrecta", { volume: 0.62 });
        this.suppliesPrepared++;
        this.progressText.setText(`${this.suppliesPrepared} / ${LEVEL_CONFIG.requiredSupplies}`);
        this.tweens.add({
            targets: target,
            scale: `+=${target.scaleX * 0.12}`,
            duration: 110,
            yoyo: true,
            ease: "Back.Out"
        });
        this.tweens.add({
            targets: this.progressText,
            scale: 1.14,
            duration: 110,
            yoyo: true,
            ease: "Back.Out"
        });
        this.time.delayedCall(420, () => target.destroy());

        if (this.suppliesPrepared >= LEVEL_CONFIG.requiredSupplies) {
            this.completeLevel();
        }
    }

    completeLevel() {
        if (this.levelState !== "playing") return;

        this.levelState = "complete";
        this.hud.stop();
        this.stopGameplayEvents();
        this.disableTargets();

        const stars = this.hud.calculateStars(LEVEL_CONFIG.maximumStars);
        ProgressManager.completePrepararTierra(stars);

        new ResultPanel(this, {
            title: "¡Tierra lista para sembrar!",
            stars,
            retryText: "Reintentar",
            nextText: "Niveles",
            onRetry: () => this.scene.restart(),
            onNext: () => this.scene.start("SembrarScene")
        });
    }

    failLevel(reason) {
        if (this.levelState !== "playing") return;

        this.levelState = "failed";
        this.hud.stop();
        this.stopGameplayEvents();
        this.disableTargets();
        this.sound.play("sfxDerrota", { volume: 0.65 });

        new ResultPanel(this, {
            title: reason === "lives" ? "¡Cuidado con las bombas!" : "Tiempo agotado",
            stars: 0,
            retryText: "Reintentar",
            nextText: "Niveles",
            onRetry: () => this.scene.restart(),
            onNext: () => this.scene.start("SembrarScene")
        });
    }

    suspendGameplay() {
        this.levelState = "paused";
        if (this.spawnEvent) this.spawnEvent.paused = true;
        this.disableTargets();
    }

    resumeGameplay() {
        this.levelState = "playing";
        if (this.spawnEvent) this.spawnEvent.paused = false;
        this.targets.forEach(target => {
            if (target.active && !target.sliced) target.setInteractive({ useHandCursor: true });
        });
    }

    disableTargets() {
        this.targets.forEach(target => {
            if (target.active) target.disableInteractive();
        });
    }

    stopGameplayEvents() {
        if (this.spawnEvent) {
            this.spawnEvent.remove();
            this.spawnEvent = null;
        }

        this.input.off("pointerdown", this.handlePointerDown, this);
        this.input.off("pointermove", this.handlePointerMove, this);
        this.input.off("pointerup", this.handlePointerUp, this);
        this.input.off("pointerupoutside", this.handlePointerUp, this);
    }

    setupLifecycleEvents() {
        this.handleVisibilityChange = () => {
            if (document.hidden && this.levelState === "playing") this.hud.pause();
        };

        document.addEventListener("visibilitychange", this.handleVisibilityChange);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            document.removeEventListener("visibilitychange", this.handleVisibilityChange);
            this.stopGameplayEvents();
            this.hud.destroy();
            this.audio.destroy();
        });
    }
}
