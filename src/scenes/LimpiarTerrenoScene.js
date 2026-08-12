import Phaser from "phaser";
import TrashItem from "../objects/TrashItem";
import ResultPanel from "../ui/ResultPanel";
import ProgressManager from "../managers/ProgressManager";
import TutorialPanel from "../ui/TutorialPanel";

export default class LimpiarTerrenoScene extends Phaser.Scene {

    constructor() {
        super("LimpiarTerrenoScene");
    }

        create() {
        const { width, height } = this.scale;

        this.width = width;
        this.height = height;

        // Inicializar primero
        this.totalTrash = 20;
        this.cleanedTrash = 0;

        this.initializeLayout();

        this.createBackground();
        this.createTerrain();
        this.createPauseButton();

        this.showTutorial();

        console.log("LimpiarTerrenoScene iniciada");
    }

    initializeLayout() {

        this.pos = {

            timer: {
                x: this.width * 0.50,
                y: this.height * 0.07
            },

            pause: {
                x: this.width * 0.95,
                y: this.height * 0.07
            }

        };

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

    createTimer() {

        // Panel del temporizador

        const timerWidth = this.width * 0.13;
        const timerHeight = this.height * 0.075;

        const graphics = this.add.graphics();

        graphics.fillStyle(0x4A8FE7, 1);

        graphics.fillRoundedRect(

            this.pos.timer.x - timerWidth / 2,
            this.pos.timer.y - timerHeight / 2,

            timerWidth,
            timerHeight,

            18

        );

        // Tiempo inicial

        this.remainingTime = 60;

        this.timerText = this.add.text(

            this.pos.timer.x,
            this.pos.timer.y,

            "01:00",

            {

                fontFamily: "Arial",
                fontSize: `${this.height * 0.035}px`,
                color: "#FFFFFF",
                fontStyle: "bold"

            }

        );

        this.timerText.setOrigin(0.5);

        // Cuenta regresiva

        this.timerEvent = this.time.addEvent({

            delay: 1000,

            callback: this.updateTimer,

            callbackScope: this,

            loop: true

        });

    }

    updateTimer() {

        this.remainingTime--;

        if (this.remainingTime <= 0) {

            this.remainingTime = 0;

            this.timerText.setText("00:00");

            this.failLevel();

            return;

        }

        const minutes = Math.floor(this.remainingTime / 60);
        const seconds = this.remainingTime % 60;

        this.timerText.setText(

            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`

        );

    }

    createPauseButton() {

        this.btnPause = this.add.image(

            this.pos.pause.x,
            this.pos.pause.y,
            "btnPausa"

        );

        // Tamaño responsive
        const pauseWidth = this.width * 0.055;

        this.pauseScale = pauseWidth / this.btnPause.width;

        this.btnPause.setScale(this.pauseScale);

        this.btnPause.disableInteractive();

        // Al presionar

        this.btnPause.on("pointerdown", () => {

            this.btnPause.setScale(this.pauseScale * 0.95);

        });

        // Al soltar

        this.btnPause.on("pointerup", () => {

            this.btnPause.setScale(this.pauseScale);

            console.log("Pausa");

        });

    }

    showTutorial() {

        new TutorialPanel(this, {

            character: "CacaitoIndicaciones",

            text: "Hay que limpiar el terreno quitando las hojas y piedras que nos estorben.",

            audio: "vozLimpiarTerreno",

            onComplete: () => {

                this.startLevel();

            }

        });

    }

    startLevel() {

        this.createTrash();

        this.createTimer();

        this.btnPause.setInteractive({

            useHandCursor: true

        });

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

        }

    }
    

    completeLevel() {

        if (this.timerEvent) {

            this.timerEvent.remove();

        }

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

        if (this.timerEvent) {

            this.timerEvent.remove();

        }

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

        if (this.remainingTime >= 50) {

            return 3;

        }

        if (this.remainingTime >= 40) {

            return 2;

        }

        return 1;

    }

    
}