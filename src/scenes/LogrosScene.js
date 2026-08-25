import Phaser from "phaser";
import ProgressManager from "../managers/ProgressManager";

export default class LogrosScene extends Phaser.Scene {

    constructor() {
        super("LogrosScene");
    }

    create() {

        const { width, height } = this.scale;

        this.width = width;
        this.height = height;

        this.initializeLayout();
        this.createBackground();
        this.createStand();
        this.createUnlockedTrophies();
        this.createBackButton();

    }

    initializeLayout() {

        this.pos = {
            stand: {
                x: this.width * 0.50,
                y: this.height * 0.53,
                height: this.height * 0.94
            },
            backButton: {
                x: this.width * 0.07,
                y: this.height * 0.09
            },
            trophies: {
                sembrar: { x: this.width * 0.405, y: this.height * 0.398 },
                mantener: { x: this.width * 0.595, y: this.height * 0.398 },
                cosechar: { x: this.width * 0.405, y: this.height * 0.72 },
                procesar: { x: this.width * 0.595, y: this.height * 0.72 }
            }
        };

    }

    createBackground() {

        const background = this.add.image(
            this.width * 0.50,
            this.height * 0.50,
            "FondoTrofeos"
        );

        // Conserva la proporción y cubre por completo el lienzo 1920 x 1080.
        background.setScale(Math.max(
            this.width / background.width,
            this.height / background.height
        ));

    }

    createStand() {

        this.stand = this.add.image(
            this.pos.stand.x,
            this.pos.stand.y,
            "StandTrofeos"
        );

        this.stand.setScale(this.pos.stand.height / this.stand.height);

    }

    createUnlockedTrophies() {

        const progress = ProgressManager.load();
        const trophies = [
            { module: "sembrar", texture: "trofeoSembrar" },
            { module: "mantener", texture: "trofeoMantener" },
            { module: "cosechar", texture: "trofeoCosechar" },
            { module: "procesar", texture: "trofeoProcesar" }
        ];

        trophies.forEach(({ module, texture }) => {
            if (!ProgressManager.isModulePerfect(module, progress)) return;

            const position = this.pos.trophies[module];
            const trophy = this.add.image(position.x, position.y, texture);

            trophy.setScale((this.width * 0.155) / trophy.width);
        });

    }

    createBackButton() {

        this.btnBack = this.add.image(
            this.pos.backButton.x,
            this.pos.backButton.y,
            "btnRegresar"
        );

        this.backScale = (this.width * 0.075) / this.btnBack.width;

        this.btnBack
            .setScale(this.backScale)
            .setInteractive({ useHandCursor: true });

        this.btnBack.on("pointerdown", () => {
            this.btnBack.setScale(this.backScale * 0.95);
        });

        this.btnBack.on("pointerout", () => {
            this.btnBack.setScale(this.backScale);
        });

        this.btnBack.on("pointerup", () => {
            this.btnBack.setScale(this.backScale);
            this.scene.start("MainMenuScene");
        });

    }

}
