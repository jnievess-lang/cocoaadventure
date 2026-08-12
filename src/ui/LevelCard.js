import Phaser from "phaser";

export default class LevelCard {

    constructor(scene, config) {

        this.scene = scene;

        this.x = config.x;
        this.y = config.y;

        this.texture = config.texture;

        this.stars = config.stars ?? 0;

        this.unlocked = config.unlocked ?? true;

        this.onClick = config.onClick ?? (() => { });

        // Resolución del juego
        this.gameWidth = scene.scale.width;
        this.gameHeight = scene.scale.height;

        this.initializeSizes();

        this.create();

    }

    initializeSizes() {

        this.size = {

            panelWidth: this.gameWidth * 0.15,

            panelHeight: this.gameHeight * 0.27,

            radius: this.gameWidth * 0.01,

            buttonWidth: this.gameWidth * 0.14,

            starWidth: this.gameWidth * 0.017,

            starsY: this.gameHeight * 0.11,

            starSpacing: this.gameWidth * 0.025

        };

    }

    create() {

        this.container = this.scene.add.container(
            this.x,
            this.y
        );

        //--------------------------
        // Panel
        //--------------------------

        this.background = this.scene.add.graphics();

        this.background.fillStyle(0x137A19, 1);

        this.background.fillRoundedRect(

            -this.size.panelWidth / 2,

            -this.size.panelHeight / 2,

            this.size.panelWidth,

            this.size.panelHeight,

            this.size.radius

        );

        //--------------------------
        // Botón
        //--------------------------

        this.button = this.scene.add.image(

            0,
            -this.gameHeight * 0.02,
            this.texture

        );

        this.buttonScale =
            this.size.buttonWidth /
            this.button.width;

        this.button
            .setScale(this.buttonScale)
            .setInteractive({
                useHandCursor: true
            });

        this.createStars();

        this.container.add([

            this.background,
            this.button,
            ...this.starImages

        ]);

        if (this.unlocked) {

            this.button.on("pointerdown", () => {

                this.button.setScale(
                    this.buttonScale * 0.95
                );

            });

            this.button.on("pointerup", () => {

                this.button.setScale(
                    this.buttonScale
                );

                this.onClick();

            });

        }
        else {

            this.button.setAlpha(0.5);

        }

    }

    createStars() {

        this.starImages = [];

        const startX = -this.size.starSpacing;

        for (let i = 0; i < 3; i++) {

            const texture =
                i < this.stars
                    ? "EstrellaLlena"
                    : "EstrellaVacia";

            const star = this.scene.add.image(

                startX + (i * this.size.starSpacing),

                this.size.starsY,

                texture

            );

            const scale =
                this.size.starWidth /
                star.width;

            star.setScale(scale);

            this.starImages.push(star);

        }

    }

    setStars(amount) {

        this.stars = amount;

        this.starImages.forEach((star, index) => {

            star.setTexture(

                index < amount
                    ? "EstrellaLlena"
                    : "EstrellaVacia"

            );

        });

    }

}