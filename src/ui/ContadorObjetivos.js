import Phaser from "phaser";

/**
 * Panel de progreso "icono + hechos / total" que comparten los minijuegos de
 * Mantener. El número se dibuja siempre con texto de Phaser: ningún PNG del
 * proyecto puede traer cifras fijas.
 */
export default class ContadorObjetivos extends Phaser.GameObjects.Container {

    constructor(scene, config) {
        super(scene, 0, 0);
        scene.add.existing(this);

        this.total = Math.max(1, Math.floor(config.total));
        this.hechos = 0;

        const ancho = scene.scale.width;
        const alto = scene.scale.height;
        const centroX = ancho * (config.centerX ?? 0.13);
        const centroY = alto * (config.centerY ?? 0.155);

        this.panel = scene.add.rectangle(
            centroX,
            centroY,
            ancho * 0.15,
            alto * 0.06,
            0xFFF1C6,
            0.96
        );

        this.panel.setStrokeStyle(Math.max(3, alto * 0.004), 0x7C431B, 1);

        this.icono = scene.add.image(
            centroX - ancho * 0.035,
            centroY,
            config.iconTexture
        );

        this.icono.setScale((alto * 0.044) / this.icono.height);

        this.texto = scene.add.text(
            centroX + ancho * 0.015,
            centroY,
            `0 / ${this.total}`,
            {
                fontFamily: "Trebuchet MS",
                fontSize: `${alto * 0.03}px`,
                color: "#5F3215",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        this.add([this.panel, this.icono, this.texto]);
        this.setDepth(config.depth ?? 50);
    }

    avanzar() {
        this.hechos = Math.min(this.total, this.hechos + 1);
        this.texto.setText(`${this.hechos} / ${this.total}`);

        this.scene.tweens.add({
            targets: this.texto,
            scale: 1.18,
            duration: 130,
            yoyo: true,
            ease: "Sine.Out"
        });

        return this.hechos;
    }

    estaCompleto() {
        return this.hechos >= this.total;
    }

}
