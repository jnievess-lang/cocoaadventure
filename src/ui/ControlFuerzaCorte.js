import Phaser from "phaser";
import clasificarFuerzaCorte from "../utils/clasificarFuerzaCorte";

export default class ControlFuerzaCorte extends Phaser.GameObjects.Container {

    constructor(scene, config) {
        super(scene, config.x, config.y);
        scene.add.existing(this);

        this.config = config;
        this.ancho = config.width;
        this.alto = config.height;
        this.duracionCargaMs = config.duracionCargaMs ?? 2200;
        this.zonaSegura = config.zonaSegura;
        this.progreso = 0;
        this.habilitado = false;
        this.cargando = false;
        this.inicioCarga = 0;

        this.crearPanel();
        this.crearBarra();
        this.crearBoton();
        this.redibujarBarra();

        this.setDepth(config.depth ?? 45);
        this.setVisible(false);

        scene.events.on(Phaser.Scenes.Events.UPDATE, this.actualizar, this);
        scene.input.on("pointerup", this.finalizarCarga, this);
        scene.input.on("pointercancel", this.cancelarCarga, this);
        scene.input.on("gameout", this.cancelarCarga, this);

        this.canvas = scene.sys.game.canvas;
        this.manejarCancelacionDom = () => this.cancelarCarga();
        this.canvas?.addEventListener("pointercancel", this.manejarCancelacionDom);
        this.canvas?.addEventListener("touchcancel", this.manejarCancelacionDom);
    }

    crearPanel() {
        const fondo = this.scene.add.graphics();

        fondo.fillStyle(0x3A2415, 0.92);
        fondo.fillRoundedRect(
            -this.ancho / 2,
            -this.alto / 2,
            this.ancho,
            this.alto,
            this.alto * 0.15
        );
        fondo.lineStyle(Math.max(4, this.alto * 0.025), 0x75401C, 1);
        fondo.strokeRoundedRect(
            -this.ancho / 2,
            -this.alto / 2,
            this.ancho,
            this.alto,
            this.alto * 0.15
        );

        this.titulo = this.scene.add.text(
            -this.ancho * 0.12,
            -this.alto * 0.34,
            "FUERZA DEL CORTE",
            {
                fontFamily: "Trebuchet MS",
                fontSize: `${this.alto * 0.14}px`,
                color: "#FFF4D6",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        this.mensaje = this.scene.add.text(
            -this.ancho * 0.12,
            this.alto * 0.34,
            "MANTÉN Y SUELTA EN VERDE",
            {
                fontFamily: "Trebuchet MS",
                fontSize: `${this.alto * 0.105}px`,
                color: "#FFF4D6",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        this.add([fondo, this.titulo, this.mensaje]);
    }

    crearBarra() {
        this.anchoBarra = this.ancho * 0.58;
        this.altoBarra = this.alto * 0.22;
        this.xBarra = -this.ancho * 0.41;
        this.yBarra = -this.altoBarra / 2;
        this.graficoBarra = this.scene.add.graphics();
        this.marcador = this.scene.add.rectangle(
            this.xBarra,
            0,
            Math.max(8, this.ancho * 0.012),
            this.altoBarra * 1.55,
            0xFFFFFF,
            1
        );
        this.marcador.setStrokeStyle(3, 0x4A2817, 1);
        this.add([this.graficoBarra, this.marcador]);
    }

    crearBoton() {
        const tamano = Math.min(this.alto * 0.72, this.ancho * 0.17);

        this.boton = this.scene.add.image(
            this.ancho * 0.36,
            0,
            this.config.texturaBoton ?? "btnMantenerCorte"
        );
        this.escalaBoton = tamano / this.boton.width;
        this.boton.setScale(this.escalaBoton);

        this.areaBoton = this.scene.add.circle(
            this.ancho * 0.36,
            0,
            tamano * 0.58,
            0xFFFFFF,
            0.001
        ).setInteractive({ useHandCursor: true });

        this.areaBoton.on("pointerdown", pointer => {
            if (!this.habilitado || this.cargando) return;

            pointer.event?.preventDefault?.();
            this.cargando = true;
            this.inicioCarga = this.scene.time.now;
            this.progreso = 0;
            this.boton.setScale(this.escalaBoton * 0.93);
            this.mensaje.setText("SUELTA EN LA ZONA VERDE");
        });

        this.add([this.boton, this.areaBoton]);
    }

    redibujarBarra() {
        const radio = this.altoBarra * 0.28;
        const inicioIdeal = this.xBarra + this.anchoBarra * this.zonaSegura.minimo;
        const finIdeal = this.xBarra + this.anchoBarra * this.zonaSegura.maximo;

        this.graficoBarra.clear();
        this.graficoBarra.fillStyle(0xE59A2A, 1);
        this.graficoBarra.fillRoundedRect(
            this.xBarra,
            this.yBarra,
            this.anchoBarra,
            this.altoBarra,
            radio
        );
        this.graficoBarra.fillStyle(0x56B947, 1);
        this.graficoBarra.fillRect(
            inicioIdeal,
            this.yBarra,
            finIdeal - inicioIdeal,
            this.altoBarra
        );
        this.graficoBarra.fillStyle(0xD94B32, 1);
        this.graficoBarra.fillRoundedRect(
            finIdeal,
            this.yBarra,
            this.xBarra + this.anchoBarra - finIdeal,
            this.altoBarra,
            { tl: 0, bl: 0, tr: radio, br: radio }
        );
        this.graficoBarra.lineStyle(Math.max(4, this.alto * 0.025), 0xFFF4D6, 1);
        this.graficoBarra.strokeRoundedRect(
            this.xBarra,
            this.yBarra,
            this.anchoBarra,
            this.altoBarra,
            radio
        );

        const centroIdeal = (inicioIdeal + finIdeal) / 2;
        const marca = this.scene.add.text(centroIdeal, 0, "✓", {
            fontFamily: "Trebuchet MS",
            fontSize: `${this.altoBarra * 0.72}px`,
            color: "#FFFFFF",
            fontStyle: "bold"
        }).setOrigin(0.5);

        this.marcaIdeal?.destroy();
        this.marcaIdeal = marca;
        this.add(marca);
        this.actualizarMarcador();
    }

    mostrar(zonaSegura) {
        this.zonaSegura = zonaSegura;
        this.progreso = 0;
        this.cargando = false;
        this.habilitado = true;
        this.mensaje.setText("MANTÉN Y SUELTA EN VERDE").setColor("#FFF4D6");
        this.redibujarBarra();
        this.setVisible(true);
        this.setAlpha(0);
        this.scene.tweens.add({
            targets: this,
            alpha: 1,
            duration: 220,
            ease: "Sine.Out"
        });
    }

    ocultar() {
        this.cancelarCarga();
        this.habilitado = false;
        this.setVisible(false);
    }

    habilitar() {
        if (this.visible) this.habilitado = true;
    }

    deshabilitar() {
        this.cancelarCarga();
        this.habilitado = false;
    }

    actualizar() {
        if (!this.cargando || !this.habilitado) return;

        this.progreso = Phaser.Math.Clamp(
            (this.scene.time.now - this.inicioCarga) / this.duracionCargaMs,
            0,
            1
        );
        this.actualizarMarcador();
    }

    actualizarMarcador() {
        if (!this.marcador) return;
        this.marcador.x = this.xBarra + this.anchoBarra * this.progreso;
    }

    finalizarCarga() {
        if (!this.cargando || !this.habilitado) return;

        this.cargando = false;
        this.habilitado = false;
        this.boton.setScale(this.escalaBoton);

        const valor = this.progreso;
        const resultado = clasificarFuerzaCorte(valor, this.zonaSegura);
        this.config.onLiberar?.({ valor, resultado });
    }

    cancelarCarga() {
        if (!this.cargando && this.progreso === 0) return;

        this.cargando = false;
        this.progreso = 0;
        this.boton?.setScale(this.escalaBoton);
        this.actualizarMarcador();
    }

    mostrarError(tipo, onComplete) {
        const esBaja = tipo === "baja";
        this.mensaje
            .setText(esBaja ? "UN POQUITO MÁS" : "SUELTA UN POCO ANTES")
            .setColor(esBaja ? "#FFD46A" : "#FF9A76");

        this.scene.tweens.add({
            targets: this.boton,
            angle: { from: -5, to: 5 },
            duration: 75,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                this.boton.setAngle(0);
                onComplete?.();
            }
        });
    }

    prepararReintento() {
        this.progreso = 0;
        this.actualizarMarcador();
        this.mensaje.setText("MANTÉN Y SUELTA EN VERDE").setColor("#FFF4D6");
        this.habilitado = true;
    }

    destroy(fromScene) {
        if (this.destruido) return;
        this.destruido = true;

        const scene = this.scene;
        scene?.events?.off(Phaser.Scenes.Events.UPDATE, this.actualizar, this);
        scene?.input?.off("pointerup", this.finalizarCarga, this);
        scene?.input?.off("pointercancel", this.cancelarCarga, this);
        scene?.input?.off("gameout", this.cancelarCarga, this);
        this.canvas?.removeEventListener("pointercancel", this.manejarCancelacionDom);
        this.canvas?.removeEventListener("touchcancel", this.manejarCancelacionDom);

        if (scene) super.destroy(fromScene);
    }
}
