import Phaser from "phaser";

export default class ResultPanel extends Phaser.GameObjects.Container {

    constructor(scene, config) {
        super(scene, scene.scale.width / 2, scene.scale.height / 2);
        scene.add.existing(this);

        this.config = config;
        this.widthRef = scene.scale.width;
        this.heightRef = scene.scale.height;
        this.setDepth(2800);

        this.createBackground();
        this.createWindow();
        this.createTitle();
        this.createStars();
        this.createButtons();

        this.setScale(0.88).setAlpha(0);
        scene.tweens.add({
            targets: this,
            scale: 1,
            alpha: 1,
            duration: 320,
            ease: "Back.Out"
        });
    }

    createBackground() {
        const overlay = this.scene.add.rectangle(
            0, 0, this.widthRef, this.heightRef, 0x14220F, 0.62
        ).setInteractive();
        this.add(overlay);
    }

    createWindow() {
        const panel = this.scene.add.rectangle(
            0, 0, this.widthRef * 0.43, this.heightRef * 0.43, 0xFFF3CF, 1
        );
        panel.setStrokeStyle(9, 0x75401C, 1);
        this.add(panel);
    }

    createTitle() {
        const title = this.scene.add.text(0, -this.heightRef * 0.115, this.config.title, {
            fontFamily: "Trebuchet MS",
            fontSize: `${this.heightRef * 0.042}px`,
            color: "#603215",
            fontStyle: "bold",
            align: "center",
            wordWrap: { width: this.widthRef * 0.36 }
        }).setOrigin(0.5);
        this.add(title);
    }

    createStars() {
        const earnedStars = Phaser.Math.Clamp(
            Math.floor(this.config.stars ?? 0),
            0,
            3
        );

        for (let index = 0; index < 3; index++) {
            const x = (index - 1) * this.widthRef * 0.055;
            const y = -this.heightRef * 0.015;
            const emptyStar = this.scene.add.image(x, y, "EstrellaVacia");
            const baseScale = (this.widthRef * 0.043) / emptyStar.width;

            emptyStar.setScale(baseScale);
            this.add(emptyStar);

            if (index < earnedStars) {
                const fullStar = this.scene.add.image(x, y, "EstrellaLlena");
                const fullScale = (this.widthRef * 0.043) / fullStar.width;

                fullStar
                    .setScale(fullScale * 0.15)
                    .setAlpha(0)
                    .setAngle(-18);

                this.add(fullStar);

                this.scene.time.delayedCall(420 + index * 380, () => {
                    if (!this.scene || !fullStar.active) return;

                    if (this.scene.cache.audio.exists("sfxEstrellaResultado")) {
                        this.scene.sound.play("sfxEstrellaResultado", { volume: 0.45 });
                    }

                    this.scene.tweens.add({
                        targets: fullStar,
                        scale: fullScale,
                        alpha: 1,
                        angle: 0,
                        duration: 420,
                        ease: "Back.Out"
                    });
                });
            }
        }
    }

    createButtons() {
        this.createButton(
            -this.widthRef * 0.09,
            this.heightRef * 0.125,
            this.config.retryText ?? "Reintentar",
            this.config.onRetry,
            0x4B9B49
        );
        this.createButton(
            this.widthRef * 0.09,
            this.heightRef * 0.125,
            this.config.nextText ?? "Siguiente",
            this.config.onNext,
            0xE57B25
        );
    }

    createButton(x, y, label, callback, color) {
        const container = this.scene.add.container(x, y);
        const background = this.scene.add.rectangle(
            0, 0, this.widthRef * 0.145, this.heightRef * 0.078, color, 1
        );

        background
            .setStrokeStyle(5, 0x673716, 1)
            .setInteractive({ useHandCursor: true });

        const text = this.scene.add.text(0, 0, label, {
            fontFamily: "Trebuchet MS",
            fontSize: `${this.heightRef * 0.024}px`,
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
