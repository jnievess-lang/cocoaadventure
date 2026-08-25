import Phaser from "phaser";
import { esMazorcaMadura, TIPOS_MAZORCA } from "../utils/bolsaMazorcas";

const TEXTURAS = Object.freeze({
    [TIPOS_MAZORCA.AMARILLA]: "MazorcaMaduraAmarilla",
    [TIPOS_MAZORCA.NARANJA]: "MazorcaMaduraNaranja",
    [TIPOS_MAZORCA.VERDE]: "MazorcaVerde",
    [TIPOS_MAZORCA.DANADA]: "MazorcaDanada"
});

const MITADES = Object.freeze({
    [TIPOS_MAZORCA.AMARILLA]: [
        "MazorcaAmarillaMitadIzquierda",
        "MazorcaAmarillaMitadDerecha"
    ],
    [TIPOS_MAZORCA.NARANJA]: [
        "MazorcaNaranjaMitadIzquierda",
        "MazorcaNaranjaMitadDerecha"
    ]
});

export default class MazorcaVoladora extends Phaser.GameObjects.Container {

    constructor(scene, config) {
        super(
            scene,
            config.trayectoria.inicio.x,
            config.trayectoria.inicio.y
        );
        scene.add.existing(this);

        this.escena = scene;
        this.tipo = config.tipo;
        this.madura = esMazorcaMadura(config.tipo);
        this.carril = config.carril;
        this.procesada = false;
        this.retirada = false;
        this.alSalir = config.alSalir;
        this.alRetirar = config.alRetirar;
        this.alturaVisual = config.alturaVisual;
        this.trayectoria = config.trayectoria;
        this.duracionVueloMs = config.duracionVueloMs;
        this.progresoVuelo = { valor: 0 };
        this.tweensDestello = [];

        this.setDepth(config.depth ?? 20);
        this.crearSprite();
        if (this.madura) this.crearDestellos();
        this.iniciarVuelo();
    }

    crearSprite() {
        this.sprite = this.escena.add.image(0, 0, TEXTURAS[this.tipo]);
        this.sprite.setScale(this.alturaVisual / this.sprite.height);
        this.add(this.sprite);
    }

    crearDestellos() {
        const radio = this.alturaVisual * 0.46;
        const posiciones = [
            { x: -radio * 0.72, y: -radio * 0.52, retraso: 0 },
            { x: radio * 0.78, y: -radio * 0.12, retraso: 260 },
            { x: -radio * 0.62, y: radio * 0.48, retraso: 520 }
        ];

        posiciones.forEach(({ x, y, retraso }) => {
            const estrella = this.escena.add.star(
                x,
                y,
                4,
                this.alturaVisual * 0.018,
                this.alturaVisual * 0.045,
                0xFFF4A6,
                0.88
            ).setStrokeStyle(2, 0xC47A10, 0.72);

            this.addAt(estrella, 0);
            const tween = this.escena.tweens.add({
                targets: estrella,
                alpha: 0.22,
                scale: 0.55,
                angle: 90,
                duration: 560,
                delay: retraso,
                yoyo: true,
                repeat: -1
            });
            this.tweensDestello.push(tween);
        });
    }

    iniciarVuelo() {
        const { inicio, control, final } = this.trayectoria;

        this.x = inicio.x;
        this.y = inicio.y;
        this.angle = Phaser.Math.Between(-10, 10);

        this.tweenVuelo = this.escena.tweens.add({
            targets: this.progresoVuelo,
            valor: 1,
            duration: this.duracionVueloMs,
            ease: "Sine.InOut",
            onUpdate: () => {
                const t = this.progresoVuelo.valor;
                const inverso = 1 - t;
                this.x = inverso * inverso * inicio.x +
                    2 * inverso * t * control.x + t * t * final.x;
                this.y = inverso * inverso * inicio.y +
                    2 * inverso * t * control.y + t * t * final.y;
                this.angle = Phaser.Math.Linear(-12, 12, t);
            },
            onComplete: () => {
                if (this.procesada || !this.active) return;
                this.procesada = true;
                this.alSalir?.(this);
                this.retirar();
            }
        });
    }

    puedeCortarse() {
        return this.active && this.visible && !this.procesada;
    }

    obtenerAreaCorte() {
        return {
            x: this.x,
            y: this.y,
            radioX: Math.max(this.sprite.displayWidth * 0.62, this.alturaVisual * 0.18),
            radioY: this.sprite.displayHeight * 0.54
        };
    }

    marcarProcesada() {
        if (!this.puedeCortarse()) return false;
        this.procesada = true;
        this.tweenVuelo?.stop();
        return true;
    }

    abrir(alCompletar) {
        if (!this.marcarProcesada()) return false;

        const [texturaIzquierda, texturaDerecha] = MITADES[this.tipo];
        const alturaMitad = this.alturaVisual * 0.88;
        const desplazamiento = this.escena.scale.width * 0.075;
        const caida = this.escena.scale.height * 0.26;
        const rotacion = this.angle;

        this.setVisible(false);

        const izquierda = this.escena.add.image(this.x, this.y, texturaIzquierda)
            .setDepth(this.depth + 1)
            .setAngle(rotacion)
            .setScale(alturaMitad / 768);
        const derecha = this.escena.add.image(this.x, this.y, texturaDerecha)
            .setDepth(this.depth + 1)
            .setAngle(rotacion)
            .setScale(alturaMitad / 768);

        this.crearParticulasApertura();

        this.escena.tweens.add({
            targets: izquierda,
            x: this.x - desplazamiento,
            y: this.y + caida,
            angle: rotacion - 24,
            alpha: 0,
            duration: 720,
            ease: "Quad.In",
            onComplete: () => izquierda.destroy()
        });
        this.escena.tweens.add({
            targets: derecha,
            x: this.x + desplazamiento,
            y: this.y + caida,
            angle: rotacion + 24,
            alpha: 0,
            duration: 720,
            ease: "Quad.In",
            onComplete: () => {
                derecha.destroy();
                alCompletar?.();
                this.retirar();
            }
        });

        return true;
    }

    crearParticulasApertura() {
        const cantidad = 8;

        for (let indice = 0; indice < cantidad; indice++) {
            const particula = this.escena.add.circle(
                this.x,
                this.y,
                Phaser.Math.Between(4, 8),
                indice % 2 === 0 ? 0xFFF3D0 : 0x8A4A24,
                0.92
            ).setDepth(this.depth + 3);

            this.escena.tweens.add({
                targets: particula,
                x: this.x + Phaser.Math.Between(-90, 90),
                y: this.y + Phaser.Math.Between(-70, 90),
                alpha: 0,
                scale: 0.3,
                duration: Phaser.Math.Between(420, 650),
                ease: "Quad.Out",
                onComplete: () => particula.destroy()
            });
        }
    }

    rechazar(alCompletar) {
        if (!this.marcarProcesada()) return false;

        const marca = this.escena.add.text(this.x, this.y, "×", {
            fontFamily: "Trebuchet MS",
            fontSize: `${this.escena.scale.height * 0.13}px`,
            color: "#E53935",
            fontStyle: "bold",
            stroke: "#FFFFFF",
            strokeThickness: Math.max(6, this.escena.scale.height * 0.009)
        }).setOrigin(0.5).setDepth(this.depth + 4).setScale(0.25);

        this.escena.tweens.add({
            targets: marca,
            scale: 1,
            alpha: 0,
            duration: 560,
            ease: "Back.Out",
            onComplete: () => marca.destroy()
        });

        this.escena.tweens.add({
            targets: this,
            x: { from: this.x - 14, to: this.x + 14 },
            alpha: 0,
            duration: 90,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                alCompletar?.();
                this.retirar();
            }
        });

        return true;
    }

    retirar() {
        if (this.retirada) return;
        this.retirada = true;
        this.alRetirar?.(this);
        this.destroy(true);
    }

    destroy(fromScene) {
        this.tweenVuelo?.stop();
        this.tweenVuelo = null;
        this.tweensDestello?.forEach(tween => tween.stop());
        this.tweensDestello = [];

        if (!this.retirada) {
            this.retirada = true;
            this.alRetirar?.(this);
        }

        this.escena = null;
        super.destroy(fromScene);
    }
}
