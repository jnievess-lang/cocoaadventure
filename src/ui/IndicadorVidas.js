import Phaser from "phaser";

export default class IndicadorVidas extends Phaser.GameObjects.Container {

    constructor(scene, config) {
        super(scene, 0, 0);
        scene.add.existing(this);

        this.maxLives = Math.max(1, Math.floor(config.maxLives));
        this.remainingLives = this.maxLives;
        this.emptyTexture = config.emptyTexture ?? "CorazonVacio";
        this.icons = [];

        const availableWidth = scene.scale.width * (config.availableWidth ?? 0.18);
        const heartWidth = Math.min(
            scene.scale.width * (config.maxHeartWidth ?? 0.05),
            scene.scale.height * (config.maxHeartHeight ?? 0.09),
            (availableWidth / this.maxLives) * 0.84
        );
        const spacing = heartWidth * 1.12;
        const centerX = scene.scale.width * (config.centerX ?? 0.16);
        const centerY = scene.scale.height * (config.centerY ?? 0.065);
        const startX = centerX - spacing * (this.maxLives - 1) / 2;

        for (let index = 0; index < this.maxLives; index++) {
            const heart = scene.add.image(
                startX + spacing * index,
                centerY,
                config.fullTexture ?? "CorazonLleno"
            );

            heart.setScale(heartWidth / heart.width);
            this.icons.push(heart);
            this.add(heart);
        }

        this.setDepth(config.depth ?? 51);
    }

    loseLife() {
        if (this.remainingLives <= 0) return 0;

        this.remainingLives--;
        const lostHeart = this.icons[this.remainingLives];

        if (lostHeart) {
            const finalScale = lostHeart.scaleX;
            lostHeart
                .setTexture(this.emptyTexture)
                .setScale(finalScale * 1.12);

            this.scene.tweens.add({
                targets: lostHeart,
                scale: finalScale,
                duration: 260,
                ease: "Bounce.Out"
            });
        }

        return this.remainingLives;
    }

    calculateStars(maximumStars = 3) {
        const lifeRatio = this.remainingLives / this.maxLives;

        return Phaser.Math.Clamp(
            Math.round(lifeRatio * maximumStars),
            1,
            maximumStars
        );
    }

}
