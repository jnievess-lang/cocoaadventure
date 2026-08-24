import Phaser from "phaser";

export default class BotonIconoHud extends Phaser.GameObjects.Container {

    constructor(scene, config) {
        super(scene, config.x, config.y);
        scene.add.existing(this);

        this.enabled = false;
        this.onActivate = config.onActivate;

        this.icon = scene.add.image(0, 0, config.texture);
        this.iconScale = config.displayWidth / this.icon.width;
        this.icon.setScale(this.iconScale);

        this.hitTarget = scene.add.rectangle(
            0,
            0,
            config.hitWidth,
            config.hitHeight,
            0xFFFFFF,
            0.001
        ).setInteractive({ useHandCursor: true });

        this.add([this.icon, this.hitTarget]);
        this.setDepth(config.depth ?? 51);
        this.bindEvents();
        this.setEnabled(config.enabled ?? false);
    }

    bindEvents() {
        this.hitTarget.on("pointerdown", () => {
            if (!this.enabled) return;

            if (this.scene.cache.audio.exists("sfxBotonTocar")) {
                this.scene.sound.play("sfxBotonTocar", { volume: 1 });
            }

            this.icon.setScale(this.iconScale * 0.95);
        });

        this.hitTarget.on("pointerout", () => {
            this.icon.setScale(this.iconScale);
        });

        this.hitTarget.on("pointerup", () => {
            if (!this.enabled) return;
            this.icon.setScale(this.iconScale);
            this.onActivate?.();
        });
    }

    setEnabled(enabled) {
        this.enabled = enabled;

        if (enabled) {
            this.hitTarget.setInteractive({ useHandCursor: true });
        }
        else {
            this.hitTarget.disableInteractive();
            this.icon.setScale(this.iconScale);
        }

        return this;
    }

    setIconAlpha(alpha) {
        this.icon.setAlpha(alpha);
        return this;
    }

}
