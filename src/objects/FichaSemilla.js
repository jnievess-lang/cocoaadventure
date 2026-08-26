import Phaser from "phaser";

const TEXTURAS = Object.freeze({
    buena: "SemillaCacaoBuena",
    danada: "SemillaCacaoDanada",
    bomba: "BombaSemillas"
});

const COLORES_RESALTADO = Object.freeze({
    buena: 0xFFD75A,
    danada: 0xD88B55
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

        const colorResaltado = COLORES_RESALTADO[this.tipo] ?? 0xFFFFFF;
        this.haloSeleccion = scene.add.ellipse(
            0,
            0,
            this.tamanoCelda * 0.68,
            this.tamanoCelda * 0.82,
            colorResaltado,
            0
        );
        this.haloSeleccion.setBlendMode(Phaser.BlendModes.ADD);

        this.sprite = scene.add.image(0, 0, TEXTURAS[this.tipo]);
        // Las texturas incluyen espacio transparente alrededor del objeto.
        // Estas proporciones igualan el tamaño visual de la maqueta aprobada
        // y mantienen las piezas legibles en pantallas pequeñas.
        const proporcion = this.tipo === "bomba" ? 0.93 : 1.01;
        this.sprite.setScale((this.tamanoCelda * proporcion) / this.sprite.height);
        this.add([this.haloSeleccion, this.sprite]);

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
        this.scene.tweens.killTweensOf(this.haloSeleccion);
        this.scene.tweens.add({
            targets: this,
            scale: seleccionada ? 1.10 : 1,
            duration: 120,
            ease: "Quad.Out"
        });
        this.scene.tweens.add({
            targets: this.haloSeleccion,
            alpha: seleccionada ? 0.60 : 0,
            scale: seleccionada ? 1.28 : 0.94,
            duration: 140,
            ease: "Sine.Out"
        });
    }

    prepararRecoleccion() {
        if (!this.active) return;
        this.seleccionada = false;
        this.scene.tweens.killTweensOf(this);
        this.scene.tweens.killTweensOf(this.haloSeleccion);
        this.haloSeleccion.setAlpha(0);
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
