import Phaser from "phaser";
import AudioSettingsManager from "../managers/AudioSettingsManager";

export default class ModulesScene extends Phaser.Scene {

    constructor() {
        super("ModulesScene");
    }

    create() {

        const { width, height } = this.scale;

        this.width = width;
        this.height = height;

        this.createBackground();
        this.createPanel();
        this.createDecorations();
        this.createTitle();
        this.createBackButton();
        this.createModules();
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

        const guide = this.add.image(0, this.height, "CacaitoModulo");

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
            "MÓDULOS",
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
            this.scene.start("MainMenuScene");
        });

    }

    createModules() {

        const modules = [
            {
                x: this.width * 0.42,
                y: this.height * 0.34,
                texture: "btnSembrarModulo",
                onClick: () => this.scene.start("SembrarScene")
            },
            {
                x: this.width * 0.63,
                y: this.height * 0.34,
                texture: "btnMantenerModulo",
                onClick: () => this.scene.start("MantenerScene")
            },
            {
                x: this.width * 0.42,
                y: this.height * 0.69,
                texture: "btnCosecharModulo",
                onClick: () => this.scene.start("CosecharScene")
            },
            {
                x: this.width * 0.63,
                y: this.height * 0.69,
                texture: "btnProcesarModulo",
                onClick: () => this.scene.start("ProcesarScene")
            }
        ];

        modules.forEach((module, index) => {
            this.createModuleCard({
                ...module,
                delay: 90 * index
            });
        });

    }

    createModuleCard(config) {

        const cardWidth = this.width * 0.18;
        const cardHeight = this.height * 0.27;
        const card = this.add.container(config.x, config.y).setDepth(20);

        const shadow = this.add.rectangle(
            8,
            12,
            cardWidth,
            cardHeight,
            0x65320E,
            0.35
        );

        shadow.setStrokeStyle(5, 0x65320E, 0.4);

        const background = this.add.rectangle(
            0,
            0,
            cardWidth,
            cardHeight,
            0xB96D2A,
            1
        );

        background.setStrokeStyle(7, 0x7D3F14, 1);

        const button = this.add.image(0, 0, config.texture);
        const iconScale = Math.min(
            (cardWidth * 0.80) / button.width,
            (cardHeight * 0.72) / button.height
        );

        button.setScale(iconScale);

        const hitTarget = this.add.rectangle(
            0,
            0,
            cardWidth,
            cardHeight,
            0xFFFFFF,
            0.001
        );

        hitTarget.setInteractive({ useHandCursor: true });
        card.add([shadow, background, button, hitTarget]);

        card.setAlpha(0).setScale(0.86);

        this.tweens.add({
            targets: card,
            alpha: 1,
            scale: 1,
            duration: 360,
            delay: config.delay,
            ease: "Back.Out"
        });

        hitTarget.on("pointerdown", () => {
            this.sound.play("sfxBotonTocar", { volume: 1 });
            card.setScale(0.96);
        });

        hitTarget.on("pointerout", () => card.setScale(1));

        hitTarget.on("pointerup", () => {
            card.setScale(1);
            config.onClick();
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
        AudioSettingsManager.applyToMusic(music);

    }

    stopMusic() {

        const music = this.sound.get("musicaFondo");

        if (music) {
            music.stop();
            music.destroy();
        }

    }

}
