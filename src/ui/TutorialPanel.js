import Phaser from "phaser";

export default class TutorialPanel extends Phaser.GameObjects.Container {

    constructor(scene, config) {

        super(scene);

        scene.add.existing(this);

        this.scene = scene;
        this.config = config;

        this.gameWidth = scene.scale.width;
        this.gameHeight = scene.scale.height;

        this.initializeLayout();

        this.createCharacter();
        this.createBubble();
        this.createText();

        this.playAnimation();

    }

    initializeLayout() {

        this.pos = {

            character: {

                x: -this.gameWidth * 0.18,
                y: this.gameHeight * 0.98

            },

            bubble: {

                x: this.gameWidth * 0.22,
                y: this.gameHeight * 0.52

            }

        };

    }

    createCharacter() {

        this.character = this.scene.add.image(

            this.pos.character.x,
            this.pos.character.y,

            this.config.character

        );

        this.character.setOrigin(0, 1);

        const targetHeight = this.gameHeight * 0.45;

        const scale = targetHeight / this.character.height;

        this.character.setScale(scale);

    }

    createBubble() {

        this.bubble = this.scene.add.image(

            this.pos.bubble.x,
            this.pos.bubble.y,

            "GloboTexto"

        );

        const targetWidth = this.gameWidth * 0.20;

        const scale = targetWidth / this.bubble.width;

        this.bubble.setScale(0);

        this.bubble.setAlpha(0);

    }

    createText() {

        this.text = this.scene.add.text(

            this.pos.bubble.x,
            this.pos.bubble.y,

            this.config.text,

            {

                fontFamily: "Arial",
                fontSize: `${this.gameHeight * 0.026}px`,
                color: "#111111",
                align: "center",
                wordWrap: {

                    width: this.gameWidth * 0.15

                }

            }

        );

        this.text.setOrigin(0.5);

        this.text.setAlpha(0);

    }

    playAnimation() {

        this.scene.tweens.add({

            targets: this.character,

            x: this.gameWidth * 0.02,

            duration: 500,

            ease: "Back.Out",

            onComplete: () => {

            this.scene.time.delayedCall(

                200,

                () => {

                    this.showBubble();

                }

            );

        }

        });

    }

    showBubble() {

        this.scene.tweens.add({

            targets: this.bubble,

            alpha: 1,
            scale: 0.6,

            duration: 250,

            ease: "Back.Out",

            onComplete: () => {

                this.text.setAlpha(1);

                this.playVoice();

            }

        });

    }

    playVoice() {

        console.log("Iniciando audio");

        const voice = this.scene.sound.add(this.config.audio);

        voice.play();

        voice.once("complete", () => {

            console.log("Audio terminado");

            this.hideTutorial();

        });

    }

    hideTutorial() {

        // Primero desaparecen el globo y el texto

        this.scene.tweens.add({

            targets: [

                this.bubble,
                this.text

            ],

            alpha: 0,

            duration: 250,

            onComplete: () => {

                // Luego el personaje sale de la pantalla

                this.scene.tweens.add({

                    targets: this.character,

                    x: -this.character.displayWidth,

                    duration: 500,

                    ease: "Back.In",

                    onComplete: () => {

                        this.destroy();

                        if (this.config.onComplete) {

                            this.config.onComplete();

                        }

                    }

                });

            }

        });

    }

}