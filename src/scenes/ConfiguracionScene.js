import Phaser from "phaser";
import AudioSettingsManager from "../managers/AudioSettingsManager";

export default class ConfiguracionScene extends Phaser.Scene {

    constructor() {
        super("ConfiguracionScene");
    }

    create() {

        const { width, height } = this.scale;

        this.width = width;
        this.height = height;

        this.initializeLayout();
        this.createBackground();
        this.createBoard();
        this.createMusicControl();
        this.createBackButton();
        this.ensureMusic();

    }

    initializeLayout() {

        this.pos = {
            board: {
                x: this.width * 0.50,
                y: this.height * 0.51,
                width: this.width * 0.66
            },
            title: {
                x: this.width * 0.50,
                y: this.height * 0.29
            },
            musicButton: {
                x: this.width * 0.50,
                y: this.height * 0.51,
                width: this.width * 0.17
            },
            musicLabel: {
                x: this.width * 0.50,
                y: this.height * 0.70
            },
            backButton: {
                x: this.width * 0.07,
                y: this.height * 0.09
            }
        };

    }

    createBackground() {

        const background = this.add.image(
            this.width * 0.50,
            this.height * 0.50,
            "fondoConfiguracion"
        );

        background.setScale(Math.max(
            this.width / background.width,
            this.height / background.height
        ));

    }

    createBoard() {

        const board = this.add.image(
            this.pos.board.x,
            this.pos.board.y,
            "TableroConfiguracion"
        );

        board.setScale(this.pos.board.width / board.width);

        this.add.text(this.pos.title.x, this.pos.title.y, "CONFIGURACIÓN", {
            fontFamily: "Arial, sans-serif",
            fontSize: `${this.height * 0.055}px`,
            fontStyle: "bold",
            color: "#FFF2C7",
            stroke: "#5A2D14",
            strokeThickness: this.height * 0.008
        }).setOrigin(0.5);

    }

    createMusicControl() {

        this.musicEnabled = AudioSettingsManager.isMusicEnabled();
        this.musicButton = this.add.image(
            this.pos.musicButton.x,
            this.pos.musicButton.y,
            "btnRepetirAudio"
        );

        this.musicButtonScale = this.pos.musicButton.width / this.musicButton.width;

        this.musicButton
            .setScale(this.musicButtonScale)
            .setInteractive({ useHandCursor: true });

        this.musicLabel = this.add.text(
            this.pos.musicLabel.x,
            this.pos.musicLabel.y,
            "",
            {
                fontFamily: "Arial, sans-serif",
                fontSize: `${this.height * 0.038}px`,
                fontStyle: "bold",
                color: "#FFF2C7",
                stroke: "#4A2410",
                strokeThickness: this.height * 0.005,
                align: "center"
            }
        ).setOrigin(0.5);

        this.updateMusicControl();

        this.musicButton.on("pointerdown", () => {
            this.musicButton.setScale(this.musicButtonScale * 0.95);
        });

        this.musicButton.on("pointerout", () => {
            this.musicButton.setScale(this.musicButtonScale);
        });

        this.musicButton.on("pointerup", () => {
            this.musicButton.setScale(this.musicButtonScale);
            this.musicEnabled = AudioSettingsManager.setMusicEnabled(
                !this.musicEnabled
            );
            this.ensureMusic();
            this.updateMusicControl();
        });

    }

    updateMusicControl() {

        this.musicButton.setAlpha(this.musicEnabled ? 1 : 0.52);
        this.musicLabel.setText(
            `MÚSICA DE FONDO\n${this.musicEnabled ? "ENCENDIDA" : "APAGADA"}`
        );

    }

    ensureMusic() {

        let music = this.sound.get("musicaFondo");

        if (!music) {
            music = this.sound.add("musicaFondo", {
                loop: true,
                volume: 0.22
            });
        }

        if (!music.isPlaying && this.musicEnabled) music.play();
        AudioSettingsManager.applyToMusic(music);

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
