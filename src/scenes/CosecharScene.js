import Phaser from "phaser";
import HarvestLevelCard from "../ui/HarvestLevelCard";
import ProgressManager from "../managers/ProgressManager";

export default class CosecharScene extends Phaser.Scene {

    constructor() {
        super("CosecharScene");
    }

    create() {

        const { width, height } = this.scale;

        this.width = width;
        this.height = height;
        this.progress = ProgressManager.load();

        this.createBackground();
        this.createPanel();
        this.createDecorations();
        this.createTitle();
        this.createBackButton();
        this.createLevels();
        this.ensureMusic();

    }

    createBackground() {

        this.cameras.main.setBackgroundColor("#8FD3FF");

        const sun = this.add.circle(
            this.width * 0.09,
            this.height * 0.13,
            this.height * 0.075,
            0xFFF2A8,
            0.8
        );

        sun.setStrokeStyle(12, 0xFFFFFF, 0.25);

    }

    createPanel() {

        const shadow = this.add.rectangle(
            this.width * 0.53,
            this.height * 0.51,
            this.width * 0.63,
            this.height * 0.84,
            0x6F360F,
            0.22
        );

        shadow.setStrokeStyle(9, 0x8D491A, 0.35);

        const panel = this.add.rectangle(
            this.width * 0.52,
            this.height * 0.49,
            this.width * 0.62,
            this.height * 0.82,
            0xD77B27,
            1
        );

        panel.setStrokeStyle(9, 0x8D491A, 1);

    }

    createDecorations() {

        const tree = this.add.image(
            this.width,
            0,
            "ArbolEsquinaSuperiorDerecha"
        );

        tree
            .setOrigin(1, 0)
            .setScale((this.width * 0.24) / tree.width);

        const guide = this.add.image(
            0,
            this.height,
            "CacaitoCosechando"
        );

        guide
            .setOrigin(0, 1)
            .setScale((this.height * 0.61) / guide.height);

        this.tweens.add({
            targets: guide,
            y: guide.y - this.height * 0.012,
            duration: 1800,
            ease: "Sine.InOut",
            yoyo: true,
            repeat: -1
        });

    }

    createTitle() {

        const title = this.add.text(
            this.width * 0.52,
            this.height * 0.125,
            "COSECHA",
            {
                fontFamily: "Trebuchet MS",
                fontSize: `${this.height * 0.055}px`,
                color: "#FFF7D8",
                fontStyle: "bold",
                stroke: "#73350F",
                strokeThickness: 8
            }
        );

        title.setOrigin(0.5);

    }

    createBackButton() {

        const button = this.add.image(
            this.width * 0.07,
            this.height * 0.09,
            "btnRegresar"
        );

        const baseScale = (this.width * 0.085) / button.width;

        button
            .setScale(baseScale)
            .setInteractive({ useHandCursor: true });

        button.on("pointerdown", () => {
            this.sound.play("sfxBotonTocar", { volume: 1 });
            button.setScale(baseScale * 0.95);
        });

        button.on("pointerout", () => button.setScale(baseScale));

        button.on("pointerup", () => {
            button.setScale(baseScale);
            this.stopMusic();
            this.scene.start("ModulesScene");
        });

    }

    createLevels() {

        const levels = [
            {
                x: this.width * 0.42,
                y: this.height * 0.34,
                label: "MAZORCAS LISTAS",
                iconTexture: "btnIconoMazorcasListas",
                unlocked: this.progress.cosechar.seleccionarMaduras.unlocked,
                stars: this.progress.cosechar.seleccionarMaduras.stars,
                onClick: () => this.scene.start("SeleccionarMadurasScene")
            },
            {
                x: this.width * 0.63,
                y: this.height * 0.34,
                label: "CORTE CUIDADOSO",
                iconTexture: "btnIconoCorteCuidadoso",
                unlocked: this.progress.cosechar.corteCuidadoso.unlocked,
                stars: this.progress.cosechar.corteCuidadoso.stars,
                onClick: () => this.scene.start("CorteCuidadosoScene")
            },
            {
                x: this.width * 0.42,
                y: this.height * 0.69,
                label: "ABRIR MAZORCAS",
                iconTexture: "btnIconoAbrirMazorcas",
                unlocked: this.progress.cosechar.abrirMazorcas.unlocked,
                stars: this.progress.cosechar.abrirMazorcas.stars,
                onClick: () => this.scene.start("AbrirMazorcasScene")
            },
            {
                x: this.width * 0.63,
                y: this.height * 0.69,
                label: "CLASIFICAR SEMILLAS",
                iconTexture: "btnIconoClasificarSemillas",
                unlocked: this.progress.cosechar.revisionAcopio.unlocked,
                stars: this.progress.cosechar.revisionAcopio.stars,
                onClick: () => this.scene.start("ClasificarSemillasScene")
            }
        ];

        levels.forEach((level, index) => {
            new HarvestLevelCard(this, {
                ...level,
                delay: 90 * index
            });
        });

    }

    ensureMusic() {

        let music = this.sound.get("musicaFondo");

        if (!music) {
            music = this.sound.add("musicaFondo", {
                loop: true,
                volume: 0.22
            });
        }

        if (!music.isPlaying) {
            music.play();
        }

        music.setVolume(0.22);

    }

    stopMusic() {

        const music = this.sound.get("musicaFondo");

        if (music) {
            music.stop();
            music.destroy();
        }

    }

}
