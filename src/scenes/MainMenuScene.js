import Phaser from "phaser";

export default class MainMenuScene extends Phaser.Scene {

    constructor() {
        super("MainMenuScene");
    }

    create() {

        const { width, height } = this.scale;

        this.width = width;
        this.height = height;

        // Posiciones de la interfaz
        this.pos = {

            logo: {
                x: this.width * 0.50,
                y: this.height * 0.18
            },

            play: {
                x: this.width * 0.50,
                y: this.height * 0.62
            },

            achievements: {
                x: this.width * 0.22,
                y: this.height * 0.62
            },

            settings: {
                x: this.width * 0.78,
                y: this.height * 0.62
            }

        };

        this.createBackground();
        this.createDecorations();
        this.createLogo();
        this.createButtons();

        console.log("MainMenuScene iniciada");
    }

    createBackground() {

        this.cameras.main.setBackgroundColor("#8FD3FF");

    }

    createDecorations() {

        // Árbol izquierdo
        this.treeLeft = this.add.image(

            0,
            0,
            "ArbolEsquinaSuperiorIzquierda"

        );

        this.treeLeft.setOrigin(0, 0);

        const treeWidth = this.width * 0.25;

        this.treeScale = treeWidth / this.treeLeft.width;

        this.treeLeft.setScale(this.treeScale);

        // Árbol derecho
        this.treeRight = this.add.image(

            this.width,
            0,
            "ArbolEsquinaSuperiorDerecha"

        );

        this.treeRight
            .setOrigin(1, 0)
            .setScale(this.treeScale);

    }

    createLogo() {

        this.logo = this.add.image(

            this.pos.logo.x,
            this.pos.logo.y,
            "logo"

        );

        const desiredLogoWidth = this.width * 0.35;

        this.logo.setScale(

            desiredLogoWidth / this.logo.width

        );

    }

    createButtons() {

        //==========================
        // PLAY
        //==========================

        this.btnPlay = this.add.image(

            this.pos.play.x,
            this.pos.play.y,
            "btnPlay"

        );

        const playWidth = this.width * 0.20;

        this.playScale = playWidth / this.btnPlay.width;

        this.btnPlay
            .setScale(this.playScale)
            .setInteractive({ useHandCursor: true });

        //==========================
        // LOGROS
        //==========================

        this.btnLogros = this.add.image(

            this.pos.achievements.x,
            this.pos.achievements.y,
            "btnLogros"

        );

        const secondaryWidth = this.width * 0.15;

        this.secondaryScale = secondaryWidth / this.btnLogros.width;

        this.btnLogros
            .setScale(this.secondaryScale)
            .setInteractive({ useHandCursor: true });

        //==========================
        // CONFIGURACIÓN
        //==========================

        this.btnConfiguracion = this.add.image(

            this.pos.settings.x,
            this.pos.settings.y,
            "btnConfiguracion"

        );

        this.btnConfiguracion
            .setScale(this.secondaryScale)
            .setInteractive({ useHandCursor: true });

        this.setupButtonEvents();
    }

    setupButtonEvents() {

        //==========================
        // PLAY
        //==========================

        this.btnPlay.on("pointerdown", () => {

            this.btnPlay.setScale(this.playScale * 0.95);

        });

        this.btnPlay.on("pointerup", () => {

        this.btnPlay.setScale(this.playScale);

        this.scene.start("ModulesScene");

        });

        //==========================
        // LOGROS
        //==========================

        this.btnLogros.on("pointerdown", () => {

            this.btnLogros.setScale(this.secondaryScale * 0.95);

        });

        this.btnLogros.on("pointerup", () => {

            this.btnLogros.setScale(this.secondaryScale);

            this.scene.start("LogrosScene");

        });

        //==========================
        // CONFIGURACIÓN
        //==========================

        this.btnConfiguracion.on("pointerdown", () => {

            this.btnConfiguracion.setScale(this.secondaryScale * 0.95);

        });

        this.btnConfiguracion.on("pointerup", () => {

            this.btnConfiguracion.setScale(this.secondaryScale);

            this.scene.start("ConfiguracionScene");

        });

    }

}
