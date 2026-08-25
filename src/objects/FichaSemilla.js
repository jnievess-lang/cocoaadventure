import Phaser from "phaser";

const TEXTURAS = Object.freeze({
    buena: "SemillaCacaoBuena",
    danada: "SemillaCacaoDanada",
    bomba: "BombaSemillas"
});

export default class FichaSemilla extends Phaser.GameObjects.Container {

    constructor(scene, config) {
        super(scene, config.x, config.y);
        scene.add.existing(this);

        this.tipo = config.tipo;
        this.fila = config.fila;
        this.columna = config.columna;
        this.tamanoCelda = config.tamanoCelda;
        this.seleccionada = false;

        this.sprite = scene.add.image(0, 0, TEXTURAS[this.tipo]);
        const proporcion = this.tipo === "bomba" ? 0.73 : 0.76;
        this.sprite.setScale((this.tamanoCelda * proporcion) / this.sprite.height);
        this.add(this.sprite);
        this.setDepth(config.depth ?? 25);
    }

    establecerPosicion(fila, columna, x, y) {
        this.fila = fila;
        this.columna = columna;
        this.setPosition(x, y);
    }

    marcarSeleccionada(seleccionada) {
        if (!this.active || this.seleccionada === seleccionada) return;
        this.seleccionada = seleccionada;
        this.scene.tweens.killTweensOf(this);
        this.scene.tweens.add({
            targets: this,
            scale: seleccionada ? 1.14 : 1,
            duration: 100,
            ease: "Quad.Out"
        });
    }

    explotar(alCompletar) {
        if (!this.active) return;
        for (let indice = 0; indice < 9; indice++) {
            const particula = this.scene.add.star(
                this.x,
                this.y,
                5,
                this.tamanoCelda * 0.05,
                this.tamanoCelda * 0.11,
                indice % 2 ? 0xFFF07A : 0xDED7CD,
                0.9
            ).setDepth(80);
            const angulo = (Math.PI * 2 * indice) / 9;
            this.scene.tweens.add({
                targets: particula,
                x: this.x + Math.cos(angulo) * this.tamanoCelda * 0.72,
                y: this.y + Math.sin(angulo) * this.tamanoCelda * 0.72,
                alpha: 0,
                scale: 0.25,
                duration: 430,
                onComplete: () => particula.destroy()
            });
        }
        this.scene.tweens.add({
            targets: this,
            scale: 1.45,
            alpha: 0,
            duration: 280,
            ease: "Back.In",
            onComplete: () => {
                alCompletar?.();
                this.destroy(true);
            }
        });
    }
}

