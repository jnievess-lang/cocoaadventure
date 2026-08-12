import Phaser from "phaser";

export default class ResultPanel extends Phaser.GameObjects.Container {

    constructor(scene, config) {

        super(
            scene,
            scene.scale.width / 2,
            scene.scale.height / 2
        );

        scene.add.existing(this);

        this.scene = scene;
        this.config = config;

        this.initializeLayout();

        this.createBackground();
        this.createWindow();
        this.createTitle();
        this.createStars();
        this.createButtons();

    }

    initializeLayout() {

        this.pos = {

            title: {
                x: 0,
                y: -this.scene.scale.height * 0.10
            },

            stars: {
                y: -this.scene.scale.height * 0.02,
                spacing: this.scene.scale.width * 0.045
            },

            buttons: {

                retry: {
                    x: -this.scene.scale.width * 0.08,
                    y: this.scene.scale.height * 0.11
                },

                next: {
                    x: this.scene.scale.width * 0.08,
                    y: this.scene.scale.height * 0.11
                }

            }

        };

        this.uiScale = {

            window: {
                width: this.scene.scale.width * 0.42,
                height: this.scene.scale.height * 0.42,
                radius: 25
            },

            starWidth: this.scene.scale.width * 0.035,

            titleFont: `${this.scene.scale.height * 0.04}px`

        };


    }

    createButtons() {

        this.createButton(

            this.pos.buttons.retry.x,
            this.pos.buttons.retry.y,

            "Reintentar",

            () => {

                if (this.config.onRetry) {

                    this.config.onRetry();

                }

            }

        );

        this.createButton(

            this.pos.buttons.next.x,
            this.pos.buttons.next.y,

            "Siguiente",

            () => {

                if (this.config.onNext) {

                    this.config.onNext();

                }

            }

        );

    }

    createButton(x, y, text, callback) {

        const width = this.scene.scale.width * 0.12;
        const height = this.scene.scale.height * 0.07;

        const background = this.scene.add.rectangle(

            x,
            y,

            width,
            height,

            0x4A8FE7

        );

        background.setInteractive({ useHandCursor: true });

        background.on("pointerdown", callback);

        const label = this.scene.add.text(

            x,
            y,

            text,

            {

                fontFamily: "Arial",
                fontSize: `${this.scene.scale.height * 0.025}px`,
                color: "#FFFFFF",
                fontStyle: "bold"

            }

        );

        label.setOrigin(0.5);

        this.add(background);
        this.add(label);

    }

    createBackground() {

        const overlay = this.scene.add.rectangle(

            0,
            0,

            this.scene.scale.width,
            this.scene.scale.height,

            0x000000,
            0.45

        );

        this.add(overlay);

    }

    createTitle() {

        const title = this.scene.add.text(

            this.pos.title.x,
            this.pos.title.y,

            this.config.title,

            {

                fontFamily: "Arial",
                fontSize: this.uiScale.titleFont,
                color: "#3B2416",
                fontStyle: "bold"

            }

        );

        title.setOrigin(0.5);

        this.add(title);

    }

    createWindow() {

        const graphics = this.scene.add.graphics();

        graphics.fillStyle(0xFFFFFF, 1);

        graphics.fillRoundedRect(

            -this.uiScale.window.width / 2,
            -this.uiScale.window.height / 2,

            this.uiScale.window.width,
            this.uiScale.window.height,

            this.uiScale.window.radius

        );

        this.add(graphics);

    }

    createStars() {

        for (let i = 0; i < 3; i++) {

            const texture = i < this.config.stars
                ? "EstrellaLlena"
                : "EstrellaVacia";

            const star = this.scene.add.image(

                (i - 1) * this.pos.stars.spacing,
                this.pos.stars.y,

                texture

            );

            const scale = this.uiScale.starWidth / star.width;

            star.setScale(scale);

            this.add(star);

        }

    }

}