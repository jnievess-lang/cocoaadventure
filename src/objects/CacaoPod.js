import Phaser from "phaser";

export default class CacaoPod extends Phaser.GameObjects.Image {

    constructor(scene, config) {

        super(scene, config.x, config.y, config.texture);

        scene.add.existing(this);

        this.podState = config.state;
        this.selected = false;
        this.onSelect = config.onSelect;
        this.baseScale = config.displayWidth / this.width;

        this
            .setOrigin(0.5, 0.08)
            .setScale(this.baseScale)
            .setDepth(config.depth ?? 10);

        this.createHitArea();
        this.createIdleAnimation();

    }

    createHitArea() {

        const hitArea = new Phaser.Geom.Ellipse(
            this.width / 2,
            this.height / 2,
            this.width,
            this.height
        );

        this.setInteractive(hitArea, Phaser.Geom.Ellipse.Contains);
        this.input.cursor = "pointer";

        this.on("pointerdown", () => {

            if (this.selected) {

                return;

            }

            this.selected = true;
            this.disableInteractive();
            this.idleTween?.stop();
            this.setAngle(0);

            if (this.onSelect) {

                this.onSelect(this);

            }

        });

    }

    createIdleAnimation() {

        this.idleTween = this.scene.tweens.add({
            targets: this,
            angle: { from: -1.2, to: 1.2 },
            duration: Phaser.Math.Between(1500, 2200),
            ease: "Sine.InOut",
            yoyo: true,
            repeat: -1,
            delay: Phaser.Math.Between(0, 500)
        });

    }

    showCorrect(indicatorTexture) {

        this.scene.tweens.add({
            targets: this,
            scale: this.baseScale * 1.12,
            angle: Phaser.Math.RND.pick([-4, 4]),
            duration: 140,
            ease: "Back.Out",
            yoyo: true,
            onComplete: () => {

                this.setAngle(0);
                this.setAlpha(0.82);

            }
        });

        return this.createIndicator(indicatorTexture);

    }

    showNotReady(indicatorTexture) {

        this.scene.tweens.add({
            targets: this,
            angle: { from: -5, to: 5 },
            duration: 90,
            ease: "Sine.InOut",
            yoyo: true,
            repeat: 2,
            onComplete: () => this.setAngle(0)
        });

        return this.createIndicator(indicatorTexture);

    }

    createIndicator(texture) {

        const indicator = this.scene.add.image(
            this.x + this.displayWidth * 0.36,
            this.y + this.displayHeight * 0.23,
            texture
        );

        const targetWidth = this.scene.scale.width * 0.045;

        indicator
            .setDepth(this.depth + 2)
            .setScale(0)
            .setAlpha(0);

        const finalScale = targetWidth / indicator.width;

        this.scene.tweens.add({
            targets: indicator,
            scale: finalScale,
            alpha: 1,
            duration: 180,
            ease: "Back.Out"
        });

        return indicator;

    }

    showHint() {

        if (this.selected || this.podState !== "ripe") {

            return;

        }

        this.scene.tweens.add({
            targets: this,
            scale: this.baseScale * 1.1,
            duration: 260,
            ease: "Sine.Out",
            yoyo: true,
            repeat: 1,
            onComplete: () => this.setScale(this.baseScale)
        });

    }

    restoreInteraction() {

        if (!this.selected) {

            const hitArea = new Phaser.Geom.Ellipse(
                this.width / 2,
                this.height / 2,
                this.width,
                this.height
            );

            this.setInteractive(hitArea, Phaser.Geom.Ellipse.Contains);
            this.input.cursor = "pointer";

        }

    }

}
