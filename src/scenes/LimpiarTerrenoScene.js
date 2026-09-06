import Phaser from "phaser";
import ResultPanel from "../ui/ResultPanel";
import ProgressManager from "../managers/ProgressManager";
import TutorialPanel from "../ui/TutorialPanel";
import HudMinijuego from "../ui/HudMinijuego";
import GestorAudioMinijuego from "../managers/GestorAudioMinijuego";

const LEVEL_CONFIG = Object.freeze({
    totalTrash: 20,
    durationSeconds: 60,
    maximumStars: 3,
    maximumLives: 3,
    optimalTimeSeconds: 30,
    twoStarTimeSeconds: 40
});

export default class LimpiarTerrenoScene extends Phaser.Scene {

    constructor() {
        super("LimpiarTerrenoScene");
    }

        create() {
        const { width, height } = this.scale;

        this.width = width;
        this.height = height;

        this.totalTrash = LEVEL_CONFIG.totalTrash;
        this.cleanedTrash = 0;
        this.levelState = "tutorial";
        this.trashItems = [];
        this.remainingByType = { Hoja: 0, Piedra: 0 };
        this.requiredType = "Hoja";
        this.audio = new GestorAudioMinijuego(this);

        this.createBackground();
        this.createTerrain();
        this.crearHudMinijuego();
        this.createTurnIndicator();
        this.audio.ensureMusic();
        this.showTutorial();
        this.setupLifecycleEvents();

        console.log("LimpiarTerrenoScene iniciada");
    }

    createBackground() {

        this.cameras.main.setBackgroundColor("#67CEEB");

    }

    createTerrain() {

        const grassWidth = this.width * 0.035;

        // ==========================
        // Césped izquierdo
        // ==========================

        this.add.tileSprite(

            grassWidth / 2,
            this.height / 2,

            grassWidth,
            this.height,

            "MosaicoCesped"

        );

        // ==========================
        // Césped derecho
        // ==========================

        this.add.tileSprite(

            this.width - grassWidth / 2,
            this.height / 2,

            grassWidth,
            this.height,

            "MosaicoCesped"

        );

        // ==========================
        // Tierra
        // ==========================

        this.add.tileSprite(

            this.width / 2,
            this.height / 2,

            this.width - grassWidth * 2,
            this.height,

            "MosaicoTierra"

        );

    }

    crearHudMinijuego() {

        this.hud = new HudMinijuego(this, {
            lives: {
                maxLives: LEVEL_CONFIG.maximumLives,
                centerX: 0.79,
                centerY: 0.075
            },
            timer: {
                durationSeconds: LEVEL_CONFIG.durationSeconds,
                centerX: 0.5,
                centerY: 0.075
            },
            controls: {},
            instructionAudio: "vozLimpiarTerreno",
            audioManager: this.audio,
            onTimeUp: () => this.failLevel("tiempo"),
            onLivesEmpty: () => this.failLevel("vidas"),
            onGameplaySuspended: () => this.suspendGameplay(),
            onGameplayResumed: () => this.resumeGameplay(),
            onExit: () => this.scene.start("SembrarScene")
        });

    }

    showTutorial() {

        this.audio.duckMusic();

        new TutorialPanel(this, {

            character: "CacaitoIndicaciones",

            text: "Hora de preparar el terreno! Sigue el ritmo: alterna siempre entre una hoja y una roca. Las hojas se van con un toque, pero a las rocas tendrás que darles dos golpes para romperlas. ¡Cuidado dónde pisas! Tocar la tierra vacía o equivocarte de turno te costará un corazón.",

            audio: "vozLimpiarTerreno",

            onVoiceStart: () => this.audio.duckMusic(),

            onComplete: () => {

                this.audio.restoreMusic();
                this.startLevel();

            }

        });

    }

    startLevel() {

        this.levelState = "playing";
        this.createTrash();
        this.hud.start();
        this.turnIndicator.setVisible(true);
        this.updateTurnIndicator();

    }

    createTrash() {

        const textures = ["Hoja", "Piedra"];

        const positions = [];

        const minDistance = this.width * 0.06;

        for (let i = 0; i < this.totalTrash; i++) {

            let validPosition = false;

            let x;
            let y;

            while (!validPosition) {

                x = Phaser.Math.Between(
                    this.width * 0.10,
                    this.width * 0.90
                );

                y = Phaser.Math.Between(
                    this.height * 0.18,
                    this.height * 0.92
                );

                validPosition = true;

                for (const pos of positions) {

                    const distance = Phaser.Math.Distance.Between(
                        x,
                        y,
                        pos.x,
                        pos.y
                    );

                    if (distance < minDistance) {

                        validPosition = false;
                        break;

                    }

                }

            }

            positions.push({ x, y });

            const type = Phaser.Utils.Array.GetRandom(textures);
            const trash = this.add.image(x, y, type)
                .setInteractive({ useHandCursor: true })
                .setDepth(2);

            trash.itemType = type;
            trash.rockHits = 0;
            trash.removing = false;
            this.remainingByType[type]++;
            trash.on("pointerdown", () => this.handleTrashTouch(trash));

            const targetWidth = this.width * 0.045;

            trash.setScale(targetWidth / trash.width);
            this.trashItems.push(trash);

        }

        // Esta capa solo recibe toques que no hayan alcanzado una hoja o roca.
        this.emptyTerrainTouch = this.add.rectangle(
            this.width / 2,
            this.height / 2,
            this.width,
            this.height,
            0x000000,
            0
        ).setInteractive().setDepth(1);
        this.emptyTerrainTouch.on("pointerdown", () => this.registerMistake());

        // La alternancia siempre comienza con hoja, salvo que no se haya
        // generado ninguna; en ese caso solo quedan rocas por limpiar.
        if (this.remainingByType.Hoja === 0) this.requiredType = "Piedra";

    }

    createTurnIndicator() {
        const x = this.width * 0.16;
        const y = this.height * 0.075;
        const panel = this.add.rectangle(
            x,
            y,
            this.width * 0.25,
            this.height * 0.085,
            0xFFF1C6,
            0.96
        ).setStrokeStyle(Math.max(2, this.height * 0.003), 0x7C431B);
        const label = this.add.text(x - this.width * 0.04, y, "Sigue:", {
            fontFamily: "Trebuchet MS",
            fontSize: `${this.height * 0.027}px`,
            color: "#5F3215",
            fontStyle: "bold"
        }).setOrigin(0.5);
        this.turnIcon = this.add.image(x + this.width * 0.055, y, "Hoja");
        this.turnIcon.setDisplaySize(this.height * 0.055, this.height * 0.055);
        this.turnIndicator = this.add.container(0, 0, [panel, label, this.turnIcon])
            .setDepth(50)
            .setVisible(false);
    }

    updateTurnIndicator() {
        if (!this.turnIcon) return;
        this.turnIcon.setTexture(this.requiredType);
    }

    handleTrashTouch(trash) {
        if (this.levelState !== "playing" || trash.removing) return;

        if (trash.itemType !== this.requiredType) {
            this.registerMistake();
            return;
        }

        if (trash.itemType === "Piedra") {
            this.handleRockTouch(trash);
            return;
        }

        this.sound.play("sfxSeleccionCorrecta", { volume: 0.68 });
        this.removeTrash(trash);
        this.switchTurnAfterSuccess("Hoja");
    }

    handleRockTouch(rock) {
        rock.rockHits++;

        if (rock.rockHits === 1) {
            rock.setTexture("PiedraCuarteada");
            rock.setDisplaySize(this.width * 0.045, this.width * 0.045);
            this.tweens.add({
                targets: rock,
                angle: { from: -7, to: 7 },
                duration: 90,
                yoyo: true
            });
            return;
        }

        this.sound.play("sfxSeleccionCorrecta", { volume: 0.68 });
        this.removeTrash(rock);
        this.switchTurnAfterSuccess("Piedra");
    }

    removeTrash(trash) {
        trash.removing = true;
        trash.disableInteractive();
        this.remainingByType[trash.itemType]--;
        this.cleanedTrash++;

        this.tweens.add({
            targets: trash,
            scale: 0,
            angle: 180,
            duration: 180,
            onComplete: () => trash.destroy()
        });
    }

    switchTurnAfterSuccess(completedType) {
        const nextType = completedType === "Hoja" ? "Piedra" : "Hoja";
        // Si el siguiente tipo ya se agotó, se conserva el tipo que queda.
        this.requiredType = this.remainingByType[nextType] > 0
            ? nextType
            : completedType;
        this.updateTurnIndicator();

        if (this.cleanedTrash >= this.totalTrash) this.completeLevel();
    }

    registerMistake() {
        if (this.levelState !== "playing") return;

        this.sound.play("sfxSeleccionIncorrecta", { volume: 0.72 });
        this.hud.loseLife();
    }

    completeLevel() {

        if (this.levelState !== "playing") return;

        this.levelState = "complete";
        this.hud.stop();
        this.disableTrash();
        this.turnIndicator.setVisible(false);

        const stars = this.calculateStars();

        ProgressManager.completeLimpiarTerreno(stars);
        console.log(ProgressManager.load());

        new ResultPanel(this, {

            title: "¡Nivel completado!",

            stars: stars,

            onRetry: () => {

                this.scene.restart();

            },

            onNext: () => {

                this.scene.start("SembrarScene");

            }

        });

    }

    failLevel(reason) {

        if (this.levelState !== "playing") return;

        this.levelState = "failed";
        this.hud.stop();
        this.disableTrash();
        this.turnIndicator.setVisible(false);
        this.sound.play("sfxDerrota", { volume: 0.65 });

            new ResultPanel(this, {

        title: reason === "vidas" ? "¡Practiquemos otra vez!" : "Tiempo agotado",

        stars: 0,

        onRetry: () => {

            this.scene.restart();

        },

        onNext: () => {

            this.scene.start("SembrarScene");

        }

    });
    }

    calculateStars() {
        const elapsed = LEVEL_CONFIG.durationSeconds - this.hud.getRemainingTime();
        const lives = this.hud.getRemainingLives();

        if (elapsed < LEVEL_CONFIG.optimalTimeSeconds && lives === LEVEL_CONFIG.maximumLives) {
            return 3;
        }

        // Con una sola vida restante la regla del nivel siempre otorga una estrella.
        if (lives === 1) return 1;

        if (lives === 2 || elapsed <= LEVEL_CONFIG.twoStarTimeSeconds) return 2;

        return 1;

    }

    suspendGameplay(reason) {

        this.levelState = reason;
        this.disableTrash();

    }

    resumeGameplay() {

        this.levelState = "playing";
        this.trashItems.forEach(item => {
            if (item.active && !item.removing) item.setInteractive({ useHandCursor: true });
        });
        if (this.emptyTerrainTouch?.active) this.emptyTerrainTouch.setInteractive();

    }

    disableTrash() {

        this.trashItems.forEach(item => {
            if (item.active) item.disableInteractive();
        });
        if (this.emptyTerrainTouch?.active) this.emptyTerrainTouch.disableInteractive();

    }

    setupLifecycleEvents() {

        this.handleVisibilityChange = () => {
            if (document.hidden && this.levelState === "playing") {
                this.hud.pause();
            }
        };

        document.addEventListener("visibilitychange", this.handleVisibilityChange);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            document.removeEventListener("visibilitychange", this.handleVisibilityChange);
            this.hud.destroy();
            this.audio.destroy();
        });

    }

    
}
