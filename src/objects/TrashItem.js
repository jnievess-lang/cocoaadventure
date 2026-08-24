import Phaser from "phaser";

export default class TrashItem extends Phaser.GameObjects.Image {

    constructor(scene, x, y, texture, onRemove) {

        super(scene, x, y, texture);

        scene.add.existing(this);

        this.onRemove = onRemove;
        this.removing = false;

        this.setInteractive({ useHandCursor: true });

        this.on("pointerdown", () => {

            this.removeTrash();

        });

    }

    removeTrash() {

        if (this.removing) return;
        this.removing = true;

        this.disableInteractive();

        this.scene.tweens.add({

            targets: this,

            scale: 0,

            angle: 180,

            duration: 180,

            onComplete: () => {

                if (this.onRemove) {

                    this.onRemove();

                }

                this.destroy();

            }

        });

    }

    restoreInteraction() {

        if (this.active && !this.removing) {
            this.setInteractive({ useHandCursor: true });
        }

    }

}
