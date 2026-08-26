import Phaser from "phaser";

export default class ModulesScene extends Phaser.Scene {

    constructor() {
        super("ModulesScene");
    }

    create() {

        const { width, height } = this.scale;

        this.width = width;
        this.height = height;

        this.initializeLayout();

        this.createBackground();
        this.createPanel();
        this.createDecorations();
        this.createModuleButtons();
        this.createBackButton();

        console.log("ModulesScene iniciada");

    }

    initializeLayout() {

        this.pos = {

            backButton: {
                x: this.width * 0.07,
                y: this.height * 0.09
            },

            guide: {
                x: this.width * 0,
                y: this.height * 1
            },

            tree: {
                x: this.width * 1.00,
                y: this.height * 0
            },

            panel: {
                x: this.width * 0.21,
                y: this.height * 0.09,
                width: this.width * 0.60,
                height: this.height * 0.82,
                radius: 35
            },

            modules: {

                sembrar: {
                    x: this.width * 0.39,
                    y: this.height * 0.30
                },

                mantener: {
                    x: this.width * 0.64,
                    y: this.height * 0.30
                },

                cosechar: {
                    x: this.width * 0.39,
                    y: this.height * 0.67
                },

                procesar: {
                    x: this.width * 0.64,
                    y: this.height * 0.67
                }

            }

        };

    }

    createBackground() {

        this.cameras.main.setBackgroundColor("#8FD3FF");

    }

    createPanel() {

        const graphics = this.add.graphics();

        graphics.fillStyle(0xC98A3A, 1);

        graphics.fillRoundedRect(

            this.pos.panel.x,
            this.pos.panel.y,
            this.pos.panel.width,
            this.pos.panel.height,
            this.pos.panel.radius

        );

    }

    createDecorations() {

        // Árbol

        this.tree = this.add.image(

            this.pos.tree.x,
            this.pos.tree.y,
            "ArbolEsquinaSuperiorDerecha"

        );

        this.tree.setOrigin(1, 0);

        const treeWidth = this.width * 0.25;

        this.treeScale = treeWidth / this.tree.width;

        this.tree.setScale(this.treeScale);

        // Personaje guía

        this.guide = this.add.image(

            this.pos.guide.x,
            this.pos.guide.y,
            "CacaitoModulo"

        );

        this.guide.setOrigin(0, 1);

        const guideHeight = this.height * 0.55;

        this.guideScale = guideHeight / this.guide.height;

        this.guide.setScale(this.guideScale);

    }

    createModuleButtons() {

        // ==========================
        // SEMBRAR
        // ==========================

        this.btnSembrar = this.createModuleButton(

            this.pos.modules.sembrar.x,
            this.pos.modules.sembrar.y,
            "btnSembrarModulo",

            () => {

                this.scene.start("SembrarScene");

            }

        );

        // ==========================
        // MANTENER
        // ==========================

        this.btnMantener = this.createModuleButton(

            this.pos.modules.mantener.x,
            this.pos.modules.mantener.y,
            "btnMantenerModulo",

            () => {

                this.scene.start("MantenerScene");

            }

        );

        // ==========================
        // COSECHAR
        // ==========================

        this.btnCosechar = this.createModuleButton(

            this.pos.modules.cosechar.x,
            this.pos.modules.cosechar.y,
            "btnCosecharModulo",

            () => {

                this.scene.start("CosecharScene");

            }

        );

        // ==========================
        // PROCESAR
        // ==========================

        this.btnProcesar = this.createModuleButton(

            this.pos.modules.procesar.x,
            this.pos.modules.procesar.y,
            "btnProcesarModulo",

            () => {

                this.scene.start("ProcesarScene");

            }

        );

    }

    createModuleButton(x, y, texture, onClick) {

        const button = this.add.image(x, y, texture);

        const moduleWidth = this.width * 0.18;

        this.moduleScale = moduleWidth / button.width;

        button
            .setScale(this.moduleScale)
            .setInteractive({ useHandCursor: true });

        button.on("pointerdown", () => {

            button.setScale(this.moduleScale * 0.95);

        });

        button.on("pointerup", () => {

        button.setScale(this.moduleScale);

        if (onClick) {

            onClick();

        }

        });

        return button;

    }
    createBackButton() {

        this.btnBack = this.add.image(

            this.pos.backButton.x,
            this.pos.backButton.y,
            "btnRegresar"

        );

        const backWidth = this.width * 0.075;

        this.backScale = backWidth / this.btnBack.width;

        this.btnBack
            .setScale(this.backScale)
            .setInteractive({ useHandCursor: true });

        this.btnBack.on("pointerdown", () => {

            this.btnBack.setScale(this.backScale * 0.95);

        });

        this.btnBack.on("pointerup", () => {

            this.btnBack.setScale(this.backScale);

            this.scene.start("MainMenuScene");

        });

    }

}
