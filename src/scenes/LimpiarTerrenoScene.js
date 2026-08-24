import Phaser from "phaser";
import TrashItem from "../objects/TrashItem";
import ResultPanel from "../ui/ResultPanel";
import ProgressManager from "../managers/ProgressManager";
import TutorialPanel from "../ui/TutorialPanel";
import HudMinijuego from "../ui/HudMinijuego";
import GestorAudioMinijuego from "../managers/GestorAudioMinijuego";

const LEVEL_CONFIG = Object.freeze({
    totalTrash: 20,
    durationSeconds: 60,
    maximumStars: 3
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
        this.audio = new GestorAudioMinijuego(this);

        this.createBackground();
        this.createTerrain();
        this.crearHudMinijuego();
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
                enabled: false
            },
            timer: {
                durationSeconds: LEVEL_CONFIG.durationSeconds
            },
            controls: {},
            instructionAudio: "vozLimpiarTerreno",
            audioManager: this.audio,
            onTimeUp: () => this.failLevel(),
            onGameplaySuspended: () => this.suspendGameplay(),
            onGameplayResumed: () => this.resumeGameplay(),
            onExit: () => this.scene.start("SembrarScene")
        });

    }

    showTutorial() {

        this.audio.duckMusic();

        new TutorialPanel(this, {

            character: "CacaitoIndicaciones",

            text: "Hay que limpiar el terreno quitando las hojas y piedras que nos estorben.",

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

    }

    createTrash() {

        const textures = [
            "Hoja",
            "Piedra"
        ];

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

            const texture = Phaser.Utils.Array.GetRandom(textures);

            const trash = new TrashItem(

                this,
                x,
                y,
                texture,

                () => {

                    this.cleanedTrash++;

                    console.log(`${this.cleanedTrash}/${this.totalTrash}`);

                    if (this.cleanedTrash >= this.totalTrash) {

                        this.completeLevel();

                    }

                }

            );

            const targetWidth = this.width * 0.045;

            trash.setScale(targetWidth / trash.width);
            this.trashItems.push(trash);

        }

    }
    

    completeLevel() {

        if (this.levelState !== "playing") return;

        this.levelState = "complete";
        this.hud.stop();
        this.disableTrash();

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

    failLevel() {

        if (this.levelState !== "playing") return;

        this.levelState = "failed";
        this.hud.stop();
        this.disableTrash();
        this.sound.play("sfxDerrota", { volume: 0.65 });

            new ResultPanel(this, {

        title: "Tiempo agotado",

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

        if (this.hud.getRemainingTime() >= 50) {

            return 3;

        }

        if (this.hud.getRemainingTime() >= 40) {

            return 2;

        }

        return 1;

    }

    suspendGameplay(reason) {

        this.levelState = reason;
        this.disableTrash();

    }

    resumeGameplay() {

        this.levelState = "playing";
        this.trashItems.forEach(item => item.restoreInteraction());

    }

    disableTrash() {

        this.trashItems.forEach(item => {
            if (item.active) item.disableInteractive();
        });

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
