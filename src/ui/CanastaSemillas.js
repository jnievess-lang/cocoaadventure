import Phaser from "phaser";

export default class CanastaSemillas extends Phaser.GameObjects.Container {

    constructor(scene, config) {
        super(scene, config.x, config.y);
        scene.add.existing(this);

        this.objetivo = config.objetivo;
        this.valor = 0;
        this.tipo = config.tipo;
        this.color = config.tipo === "buena" ? 0x4E9B35 : 0xA9472A;
        this.setDepth(config.depth ?? 30);

        const ancho = config.ancho;
        const alto = config.alto;
        this.etiqueta = scene.add.rectangle(0, -alto * 0.42, ancho * 0.84, alto * 0.22, this.color, 0.98)
            .setStrokeStyle(Math.max(3, alto * 0.025), 0x5D3017, 1);
        this.textoEtiqueta = scene.add.text(0, -alto * 0.42, config.etiqueta, {
            fontFamily: "Trebuchet MS",
            fontSize: `${alto * 0.13}px`,
            color: "#FFFFFF",
            fontStyle: "bold",
            stroke: "#4A2816",
            strokeThickness: Math.max(3, alto * 0.018)
        }).setOrigin(0.5);

        this.imagen = scene.add.image(0, alto * 0.04, "CanastaSemillas");
        this.imagen.setScale(ancho / this.imagen.width);

        this.panelContador = scene.add.rectangle(0, alto * 0.43, ancho * 0.62, alto * 0.22, 0xFFF1C6, 1)
            .setStrokeStyle(Math.max(3, alto * 0.025), this.color, 1);
        this.textoContador = scene.add.text(0, alto * 0.43, `0 / ${this.objetivo}`, {
            fontFamily: "Trebuchet MS",
            fontSize: `${alto * 0.16}px`,
            color: "#5A3018",
            fontStyle: "bold"
        }).setOrigin(0.5);

        this.icono = scene.add.image(-ancho * 0.31, -alto * 0.42,
            config.tipo === "buena" ? "SemillaCacaoBuena" : "SemillaCacaoDanada");
        this.icono.setScale((alto * 0.17) / this.icono.height);
        this.add([
            this.etiqueta,
            this.textoEtiqueta,
            this.imagen,
            this.panelContador,
            this.textoContador,
            this.icono
        ]);
    }

    establecerValor(valor) {
        this.valor = Math.min(this.objetivo, Math.max(0, valor));
        this.textoContador.setText(`${this.valor} / ${this.objetivo}`);
        this.scene.tweens.add({
            targets: [this.imagen, this.panelContador, this.textoContador],
            scaleX: 1.06,
            scaleY: 1.06,
            duration: 120,
            yoyo: true
        });
    }

    obtenerDestino() {
        return { x: this.x, y: this.y + this.imagen.displayHeight * 0.02 };
    }
}

