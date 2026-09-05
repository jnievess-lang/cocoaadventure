import Phaser from "phaser";
import TutorialPanel from "../ui/TutorialPanel";
import ResultPanel from "../ui/ResultPanel";
import HudMinijuego from "../ui/HudMinijuego";
import GestorAudioMinijuego from "../managers/GestorAudioMinijuego";
import ProgressManager from "../managers/ProgressManager";

const LEVEL_CONFIG = Object.freeze({
    durationSeconds: 30,
    maxLives: 3,
    totalSeedlings: 5,
    initialSpeed: 600,
    speedIncrease: 500,
    maximumStars: 3
});

export default class PlantarPlantula extends Phaser.Scene {

    constructor() {
        super("PlantarPlantulaScene");
    }

    create() {
        const { width, height } = this.scale;

        this.width = width;
        this.height = height;
        this.levelState = "tutorial";
        this.currentTurn = 0;
        this.currentSpeed = LEVEL_CONFIG.initialSpeed;
        this.holes = [];
        this.currentSeedling = null;
        this.seedlingTween = null;
        this.audio = new GestorAudioMinijuego(this);

        this.createBackground();
        this.createHoles();
        this.createProgress();
        this.createHud();
        this.audio.ensureMusic();
        this.showTutorial();
        this.setupLifecycleEvents();
    }

    createBackground() {
        this.cameras.main.setBackgroundColor("#8FD3FF");

        const groundHeight = this.height * 0.21;
        this.add.tileSprite(
            this.width / 2,
            this.height - groundHeight / 2,
            this.width,
            groundHeight,
            "MosaicoTierra"
        ).setDepth(1);
    }

    createHoles() {
        const positions = [0.13, 0.31, 0.50, 0.69, 0.87];
        const y = this.height * 0.87;

        this.holes = positions.map(xRatio => {
            const hole = this.add.image(this.width * xRatio, y, "HuecoTierra");
            hole.setScale((this.width * 0.12) / hole.width).setDepth(3);
            hole.planted = false;
            return hole;
        });
    }

    createProgress() {
        this.progressText = this.add.text(
            this.width * 0.16,
            this.height * 0.075,
            `0 / ${LEVEL_CONFIG.totalSeedlings}`,
            {
                fontFamily: "Trebuchet MS",
                fontSize: `${this.height * 0.03}px`,
                color: "#5F3215",
                fontStyle: "bold"
            }
        ).setOrigin(0.5).setDepth(51);

        const panel = this.add.rectangle(
            this.progressText.x,
            this.progressText.y,
            this.width * 0.15,
            this.height * 0.065,
            0xFFF1C6,
            0.96
        ).setDepth(50);
        panel.setStrokeStyle(Math.max(3, this.height * 0.004), 0x7C431B, 1);
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
                textX: 0.453
            },
            controls: {},
            instructionAudio: "vozPlantarPlantula",
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
            text: "Planta las plántulas de cacao en los huecos, cuidado con equivocarte.",
            audio: "vozPlantarPlantula",
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
        this.input.on("pointerdown", this.handleTap, this);
        this.spawnSeedling();
    }

    spawnSeedling() {
        if (this.levelState !== "playing" || this.currentTurn >= LEVEL_CONFIG.totalSeedlings) return;

        const y = this.height * 0.32;
        const direction = this.currentTurn % 2 === 0 ? 1 : -1;
        const startX = direction === 1 ? this.width * 0.08 : this.width * 0.92;
        const endX = direction === 1 ? this.width * 0.92 : this.width * 0.08;
        const seedling = this.add.image(startX, y, "PlantulaCacao").setDepth(10);
        seedling.setScale((this.width * 0.09) / seedling.width);
        this.currentSeedling = seedling;

        const distance = Math.abs(endX - startX);
        this.seedlingTween = this.tweens.add({
            targets: seedling,
            x: endX,
            duration: (distance / this.currentSpeed) * 1000,
            ease: "Linear",
            yoyo: true,
            repeat: -1
        });
    }

    handleTap(pointer) {
        if (
            this.levelState !== "playing" ||
            !this.currentSeedling ||
            !this.currentSeedling.active ||
            pointer.y < this.height * 0.18 ||
            pointer.y > this.height * 0.68
        ) return;

        this.dropSeedling();
    }

    dropSeedling() {
        const seedling = this.currentSeedling;
        if (!seedling) return;

        this.currentSeedling = null;
        this.seedlingTween?.stop();
        this.seedlingTween = null;
        seedling.setTexture("PlantulaCacaoCayendo");
        seedling.setScale((this.width * 0.09) / seedling.width);

        const closestHole = this.getClosestAvailableHole(seedling.x);
        const hitTolerance = this.width * 0.035;
        const isCorrect = closestHole && Math.abs(seedling.x - closestHole.x) <= hitTolerance;
        const landingX = isCorrect ? closestHole.x : seedling.x;
        const landingY = isCorrect ? closestHole.y - closestHole.displayHeight * 0.08 : this.height * 0.91;

        this.tweens.add({
            targets: seedling,
            x: landingX,
            y: landingY,
            duration: 540,
            ease: "Quad.In",
            onComplete: () => this.resolveDrop(seedling, closestHole, isCorrect)
        });
    }

    getClosestAvailableHole(x) {
        return this.holes
            .filter(hole => !hole.planted)
            .sort((first, second) => Math.abs(first.x - x) - Math.abs(second.x - x))[0];
    }

    resolveDrop(seedling, hole, isCorrect) {
        if (this.levelState !== "playing" || !seedling.active) return;

        if (isCorrect) {
            hole.planted = true;
            seedling.setTexture("PlantulaCacaoCaida");
            seedling.setScale((this.width * 0.105) / seedling.width);
            // La plántula se muestra sobre el hueco, centrada como una planta
            // ya sembrada; el asset incluye visualmente su base de tierra.
            seedling
                .setPosition(hole.x, hole.y - hole.displayHeight * 0.90)
                .setDepth(hole.depth + 0.1);
            this.sound.play("sfxSeleccionCorrecta", { volume: 0.65 });
            this.tweens.add({
                targets: seedling,
                scale: seedling.scaleX * 1.08,
                duration: 130,
                yoyo: true,
                ease: "Back.Out"
            });
        }
        else {
            this.sound.play("sfxSeleccionIncorrecta", { volume: 0.5 });
            this.hud.loseLife();
            this.tweens.add({
                targets: seedling,
                alpha: 0,
                duration: 260,
                onComplete: () => seedling.destroy()
            });
        }

        this.currentTurn++;
        this.currentSpeed += LEVEL_CONFIG.speedIncrease;
        this.progressText.setText(`${this.currentTurn} / ${LEVEL_CONFIG.totalSeedlings}`);

        if (this.levelState !== "playing") return;

        if (this.currentTurn >= LEVEL_CONFIG.totalSeedlings) {
            this.time.delayedCall(650, () => this.completeLevel());
        }
        else {
            this.time.delayedCall(500, () => this.spawnSeedling());
        }
    }

    completeLevel() {
        if (this.levelState !== "playing") return;

        this.levelState = "complete";
        this.hud.stop();
        this.stopGameplay();

        const stars = this.hud.calculateStars(LEVEL_CONFIG.maximumStars);
        ProgressManager.completePlantarPlantula(stars);

        new ResultPanel(this, {
            title: "¡Plántulas sembradas!",
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
        this.stopGameplay();
        this.sound.play("sfxDerrota", { volume: 0.65 });

        new ResultPanel(this, {
            title: reason === "lives" ? "¡Intenta caer en los huecos!" : "Tiempo agotado",
            stars: 0,
            retryText: "Reintentar",
            nextText: "Niveles",
            onRetry: () => this.scene.restart(),
            onNext: () => this.scene.start("SembrarScene")
        });
    }

    suspendGameplay() {
        this.levelState = "paused";
        this.seedlingTween?.pause();
        this.tweens.pauseAll();
    }

    resumeGameplay() {
        this.levelState = "playing";
        this.seedlingTween?.resume();
        this.tweens.resumeAll();
    }

    stopGameplay() {
        this.seedlingTween?.stop();
        this.seedlingTween = null;
        this.input.off("pointerdown", this.handleTap, this);
    }

    setupLifecycleEvents() {
        this.handleVisibilityChange = () => {
            if (document.hidden && this.levelState === "playing") this.hud.pause();
        };

        document.addEventListener("visibilitychange", this.handleVisibilityChange);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            document.removeEventListener("visibilitychange", this.handleVisibilityChange);
            this.stopGameplay();
            this.hud.destroy();
            this.audio.destroy();
        });
    }
}
