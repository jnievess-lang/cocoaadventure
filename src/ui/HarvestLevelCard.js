import Phaser from "phaser";

export default class HarvestLevelCard extends Phaser.GameObjects.Container {

    constructor(scene, config) {

        super(scene, config.x, config.y);

        scene.add.existing(this);

        this.config = config;
        // Un nivel puede estar desbloqueado en progreso antes de que su escena
        // y su icono estén disponibles. En ese caso conserva la tarjeta segura
        // de "próximamente" en lugar de intentar crear una textura inexistente.
        this.unlocked = Boolean(
            config.unlocked && config.iconTexture && config.onClick
        );
        this.cardWidth = scene.scale.width * 0.18;
        this.cardHeight = scene.scale.height * 0.27;

        this.createCard();
        this.setupInteraction();

        this
            .setAlpha(0)
            .setScale(0.86)
            .setDepth(20);

        scene.tweens.add({
            targets: this,
            alpha: 1,
            scale: 1,
            duration: 360,
            delay: config.delay ?? 0,
            ease: "Back.Out"
        });

    }

    createCard() {

        this.createCardFrame();

        if (this.unlocked) this.createUnlockedContent();
        else this.createLockedContent();

        this.hitTarget = this.scene.add.rectangle(
            0,
            0,
            this.cardWidth,
            this.cardHeight,
            0xFFFFFF,
            0.001
        );

        this.add(this.hitTarget);

    }

    createCardFrame() {

        const shadow = this.scene.add.rectangle(
            8,
            12,
            this.cardWidth,
            this.cardHeight,
            0x65320E,
            0.35
        );

        shadow.setStrokeStyle(5, 0x65320E, 0.4);

        const background = this.scene.add.rectangle(
            0,
            0,
            this.cardWidth,
            this.cardHeight,
            0xB96D2A,
            1
        );

        background.setStrokeStyle(7, 0x7D3F14, 1);

        this.add([shadow, background]);

        if (!this.unlocked) {

            const inner = this.scene.add.rectangle(
                0,
                -this.cardHeight * 0.08,
                this.cardWidth * 0.86,
                this.cardHeight * 0.56,
                0xFFE2A8,
                0.55
            );

            inner.setStrokeStyle(4, 0xA65318, 0.8);
            this.add(inner);

        }

    }

    createUnlockedContent() {

        const icon = this.scene.add.image(
            0,
            -this.scene.scale.height * 0.02,
            this.config.iconTexture
        );

        // Se limitan tanto el ancho como el alto disponibles dentro de la
        // tarjeta (no solo el ancho) para que el icono nunca sobresalga de su
        // marco, sin importar la proporción del icono ni la del dispositivo.
        const maxIconWidth = this.cardWidth * 0.80;
        const maxIconHeight = this.cardHeight * 0.72;
        const iconScale = Math.min(
            maxIconWidth / icon.width,
            maxIconHeight / icon.height
        );
        icon.setScale(iconScale);

        this.add(icon);

        // Opcional: los módulos cuyos niveles se distinguen por su nombre y no
        // solo por el icono pueden mostrar también la etiqueta.
        if (this.config.showLabel) {

            icon.y = -this.cardHeight * 0.14;
            icon.setScale((this.cardHeight * 0.38) / icon.height);

            const label = this.scene.add.text(
                0,
                this.cardHeight * 0.16,
                this.config.label,
                {
                    fontFamily: "Trebuchet MS",
                    fontSize: `${this.scene.scale.height * 0.021}px`,
                    color: "#FFF4D6",
                    fontStyle: "bold",
                    stroke: "#6B3412",
                    strokeThickness: 4,
                    align: "center",
                    wordWrap: { width: this.cardWidth * 0.86 }
                }
            );

            label.setOrigin(0.5);
            this.add(label);

        }

        this.createStars();

    }

    createLockedContent() {

        const lock = this.scene.add.image(
            0,
            -this.cardHeight * 0.09,
            "CandadoNivel"
        );

        lock.setScale((this.cardHeight * 0.34) / lock.height);

        const label = this.scene.add.text(
            0,
            this.cardHeight * 0.20,
            this.config.label,
            {
                fontFamily: "Trebuchet MS",
                fontSize: `${this.scene.scale.height * 0.022}px`,
                color: "#FFF4D6",
                fontStyle: "bold",
                stroke: "#6B3412",
                strokeThickness: 4,
                align: "center",
                wordWrap: { width: this.cardWidth * 0.82 }
            }
        );

        label.setOrigin(0.5);

        const soon = this.scene.add.text(
            0,
            this.cardHeight * 0.34,
            // Un nivel puede estar bloqueado porque aún no se construye o
            // porque falta completar el anterior: el mensaje lo aclara.
            this.config.lockedMessage ?? "PRÓXIMAMENTE",
            {
                fontFamily: "Trebuchet MS",
                fontSize: `${this.scene.scale.height * 0.015}px`,
                color: "#6B3412",
                fontStyle: "bold"
            }
        );

        soon.setOrigin(0.5);

        this.add([lock, label, soon]);

    }

    createStars() {

        const starWidth = this.scene.scale.width * 0.018;
        const spacing = this.scene.scale.width * 0.027;

        for (let index = 0; index < 3; index++) {

            const texture = index < (this.config.stars ?? 0)
                ? "EstrellaLlena"
                : "EstrellaVacia";

            const star = this.scene.add.image(
                (index - 1) * spacing,
                this.cardHeight * 0.40,
                texture
            );

            star.setScale(starWidth / star.width);
            this.add(star);

        }

    }

    setupInteraction() {

        if (!this.unlocked) {

            return;

        }

        this.hitTarget.setInteractive({ useHandCursor: true });

        this.hitTarget.on("pointerdown", () => {

            this.scene.sound.play("sfxBotonTocar", { volume: 1 });
            this.setScale(0.96);

        });

        this.hitTarget.on("pointerout", () => this.setScale(1));

        this.hitTarget.on("pointerup", () => {

            this.setScale(1);

            if (this.config.onClick) {

                this.config.onClick();

            }

        });

    }

}
