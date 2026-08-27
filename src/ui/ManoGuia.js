import Phaser from "phaser";

/**
 * Ayuda visual reutilizable para enseñar un toque o un deslizamiento.
 * La posición del contenedor representa siempre la punta del dedo índice.
 */
export default class ManoGuia extends Phaser.GameObjects.Container {

    constructor(scene, config = {}) {
        super(scene, 0, 0);
        scene.add.existing(this);

        this.anchoVisual = config.anchoVisual ?? scene.scale.height * 0.16;
        this.radioCirculo = config.radioCirculo ?? scene.scale.height * 0.055;
        this.colorCirculo = config.colorCirculo ?? 0xFFE36B;
        this.eventoOcultar = null;
        this.cadenaMovimiento = null;

        this.crearIndicador();
        this.setDepth(config.depth ?? 100);
        this.setVisible(false);
    }

    crearIndicador() {
        this.circulo = this.scene.add.circle(
            0,
            0,
            this.radioCirculo,
            this.colorCirculo,
            0.13
        );
        this.circulo.setStrokeStyle(
            Math.max(5, this.scene.scale.height * 0.006),
            this.colorCirculo,
            0.95
        );

        this.punto = this.scene.add.circle(
            0,
            0,
            this.radioCirculo * 0.24,
            0xFFFFFF,
            0.82
        );

        this.mano = this.scene.add.image(0, 0, "ManoIndicadoraTutorial");
        // El origen coincide con la punta del índice del asset aprobado.
        this.mano.setOrigin(0.17, 0.85);
        this.escalaBase = this.anchoVisual / this.mano.width;
        this.mano.setScale(this.escalaBase);

        this.add([this.circulo, this.punto, this.mano]);
    }

    mostrarToque(x, y, opciones = {}) {
        this.detenerAnimaciones();
        this.setPosition(x, y).setAlpha(1).setVisible(true);
        this.mano.setAngle(opciones.angulo ?? 0).setScale(this.escalaBase);
        this.iniciarPulso();

        this.tweenMano = this.scene.tweens.add({
            targets: this.mano,
            scaleX: this.escalaBase * 0.91,
            scaleY: this.escalaBase * 0.91,
            duration: opciones.duracionToqueMs ?? 330,
            ease: "Sine.InOut",
            yoyo: true,
            repeat: -1
        });

        const duracionVisible = opciones.duracionVisibleMs ?? 2300;
        if (duracionVisible > 0) {
            this.eventoOcultar = this.scene.time.delayedCall(
                duracionVisible,
                () => this.ocultar()
            );
        }

        return this;
    }

    mostrarDeslizamiento(inicio, fin, opciones = {}) {
        return this.mostrarTrayectoria([inicio, fin], opciones);
    }

    mostrarTrayectoria(puntos, opciones = {}) {
        if (!Array.isArray(puntos) || puntos.length < 2) return this.ocultar();

        this.detenerAnimaciones();
        const inicio = puntos[0];
        this.setPosition(inicio.x, inicio.y).setAlpha(0).setVisible(true);
        this.mano
            .setAngle(opciones.angulo ?? 0)
            .setScale(this.escalaBase);
        this.iniciarPulso();

        const duracionMovimiento = opciones.duracionMovimientoMs ?? 1050;
        const duracionPorTramo = Math.max(
            120,
            duracionMovimiento / (puntos.length - 1)
        );
        const movimientos = puntos.slice(1).map(punto => ({
            x: punto.x,
            y: punto.y,
            duration: duracionPorTramo,
            ease: "Sine.InOut"
        }));

        this.cadenaMovimiento = this.scene.tweens.chain({
            targets: this,
            repeat: -1,
            tweens: [
                {
                    x: inicio.x,
                    y: inicio.y,
                    alpha: 1,
                    duration: opciones.duracionEntradaMs ?? 180,
                    ease: "Sine.Out"
                },
                ...movimientos,
                {
                    alpha: 0,
                    duration: opciones.duracionSalidaMs ?? 180,
                    ease: "Sine.In"
                },
                {
                    x: inicio.x,
                    y: inicio.y,
                    duration: 1,
                    delay: opciones.pausaEntreRepeticionesMs ?? 420
                }
            ]
        });

        const duracionVisible = opciones.duracionVisibleMs ?? 0;
        if (duracionVisible > 0) {
            this.eventoOcultar = this.scene.time.delayedCall(
                duracionVisible,
                () => this.ocultar()
            );
        }

        return this;
    }

    iniciarPulso() {
        this.circulo.setScale(0.72).setAlpha(0.92);
        this.punto.setScale(0.82).setAlpha(0.88);

        this.tweenCirculo = this.scene.tweens.add({
            targets: this.circulo,
            scale: 1.18,
            alpha: 0.18,
            duration: 720,
            ease: "Sine.Out",
            repeat: -1
        });
        this.tweenPunto = this.scene.tweens.add({
            targets: this.punto,
            scale: 1.12,
            alpha: 0.38,
            duration: 430,
            ease: "Sine.InOut",
            yoyo: true,
            repeat: -1
        });
    }

    ocultar() {
        this.detenerAnimaciones();
        this.setVisible(false).setAlpha(1);
        return this;
    }

    detenerAnimaciones() {
        this.eventoOcultar?.remove(false);
        this.eventoOcultar = null;
        this.cadenaMovimiento?.stop();
        this.cadenaMovimiento = null;

        if (this.scene) {
            this.scene.tweens.killTweensOf([
                this,
                this.mano,
                this.circulo,
                this.punto
            ]);
        }

        this.mano?.setScale(this.escalaBase);
        this.circulo?.setScale(1).setAlpha(1);
        this.punto?.setScale(1).setAlpha(1);
    }

    destroy(fromScene) {
        this.detenerAnimaciones();
        super.destroy(fromScene);
    }
}
