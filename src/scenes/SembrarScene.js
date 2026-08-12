import Phaser from "phaser";

import LevelCard from "../ui/LevelCard";
import ProgressManager from "../managers/ProgressManager";

export default class SembrarScene extends Phaser.Scene {

    constructor() {
        super("SembrarScene");
    }

    create() {
        console.log(this.progress);

        const { width, height } = this.scale;

        this.width = width;
        this.height = height;

        this.progress = ProgressManager.load();

        this.initializeLayout();

        this.createBackground();
        this.createPanel();
        this.createDecorations();
        this.createBackButton();
        this.createLevels();

        console.log("SembrarScene iniciada");
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

            levels: {

                level1: {
                    x: this.width * 0.42,
                    y: this.height * 0.32
                },

                level2: {
                    x: this.width * 0.62,
                    y: this.height * 0.32
                },

                level3: {
                    x: this.width * 0.42,
                    y: this.height * 0.64
                }

            }

        };

    }

    createBackground() {

        this.cameras.main.setBackgroundColor("#8FD3FF");

    }

    createPanel() {

        const graphics = this.add.graphics();

        graphics.fillStyle(0x39B86B, 1);

        graphics.fillRoundedRect(

            this.pos.panel.x,
            this.pos.panel.y,
            this.pos.panel.width,
            this.pos.panel.height,
            this.pos.panel.radius

        );

    }

    createDecorations() {

        //==========================
        // Árbol
        //==========================

        this.tree = this.add.image(

            this.pos.tree.x,
            this.pos.tree.y,
            "ArbolEsquinaSuperiorDerecha"

        );

        this.tree.setOrigin(1, 0);

        const treeWidth = this.width * 0.25;

        this.treeScale = treeWidth / this.tree.width;

        this.tree.setScale(this.treeScale);

        //==========================
        // Personaje guía
        //==========================

        this.guide = this.add.image(

            this.pos.guide.x,
            this.pos.guide.y,
            "CacaitoSembrando"

        );

        this.guide.setOrigin(0, 1);

        const guideHeight = this.height * 0.55;

        this.guideScale = guideHeight / this.guide.height;

        this.guide.setScale(this.guideScale);

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

            this.scene.start("ModulesScene");

        });

    }

    createLevels() {

        new LevelCard(this, {

            x: this.pos.levels.level1.x,
            y: this.pos.levels.level1.y,

            texture: "btnLimpiarTerreno",

            stars: this.progress.sembrar.limpiarTerreno.stars,

            unlocked: this.progress.sembrar.limpiarTerreno.unlocked,

            onClick: () => {

                this.scene.start("LimpiarTerrenoScene");

            }

        });

        new LevelCard(this, {

            x: this.pos.levels.level2.x,
            y: this.pos.levels.level2.y,

            texture: "btnPrepararTierra",

            stars: this.progress.sembrar.prepararTierra.stars,

            unlocked: this.progress.sembrar.prepararTierra.unlocked,

            onClick: () => {

                console.log("Nivel 2");

            }

        });

        new LevelCard(this, {

            x: this.pos.levels.level3.x,
            y: this.pos.levels.level3.y,

            texture: "btnPlantarPlantula",

            stars: this.progress.sembrar.plantarPlantula.stars,

            unlocked: this.progress.sembrar.plantarPlantula.unlocked,

            onClick: () => {

                console.log("Nivel 3");

            }

        });

    }

}