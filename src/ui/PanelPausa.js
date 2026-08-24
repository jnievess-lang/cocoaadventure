import Phaser from "phaser";

export default class PanelPausa extends Phaser.GameObjects.Container {

    constructor(scene, config = {}) {
        super(scene, 0, 0);
        scene.add.existing(this);

        this.config = config;
        this.widthRef = scene.scale.width;
        this.heightRef = scene.scale.height;
        this.setDepth(config.depth ?? 3000);

        this.createBackground();
        this.createPanel();
        this.createActions();
    }

    createBackground() {
        const blocker = this.scene.add.rectangle(
            this.widthRef / 2,
            this.heightRef / 2,
            this.widthRef,
            this.heightRef,
            0x14220F,
            0.72
        ).setInteractive();

        this.add(blocker);
    }

    createPanel() {
        const panel = this.scene.add.rectangle(
            this.widthRef / 2,
            this.heightRef / 2,
            this.widthRef * 0.38,
            this.heightRef * 0.40,
            0xFFF2CB,
            1
        );
        panel.setStrokeStyle(9, 0x7B431D, 1);

        const title = this.scene.add.text(
            this.widthRef / 2,
            this.heightRef * 0.40,
            this.config.title ?? "JUEGO EN PAUSA",
            {
                fontFamily: "Trebuchet MS",
                fontSize: `${this.heightRef * 0.045}px`,
                color: "#603215",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        this.add([panel, title]);
    }

    createActions() {
        this.createButton(
            this.widthRef * 0.42,
            this.heightRef * 0.58,
            this.config.resumeText ?? "Continuar",
            this.config.onResume,
            0x4B9B49
        );

        this.createButton(
            this.widthRef * 0.58,
            this.heightRef * 0.58,
            this.config.exitText ?? "Niveles",
            this.config.onExit,
            0xE77E24
        );
    }

    createButton(x, y, label, callback, color) {
        const container = this.scene.add.container(x, y);
        const background = this.scene.add.rectangle(
            0,
            0,
            this.widthRef * 0.14,
            this.heightRef * 0.085,
            color,
            1
        );
        background
            .setStrokeStyle(5, 0x7B431D, 1)
            .setInteractive({ useHandCursor: true });

        const text = this.scene.add.text(0, 0, label, {
            fontFamily: "Trebuchet MS",
            fontSize: `${this.heightRef * 0.025}px`,
            color: "#FFFFFF",
            fontStyle: "bold"
        }).setOrigin(0.5);

        background.on("pointerdown", () => {
            if (this.scene.cache.audio.exists("sfxBotonTocar")) {
                this.scene.sound.play("sfxBotonTocar", { volume: 1 });
            }
            container.setScale(0.96);
        });
        background.on("pointerout", () => container.setScale(1));
        background.on("pointerup", () => {
            container.setScale(1);
            callback?.();
        });

        container.add([background, text]);
        this.add(container);
    }

}
