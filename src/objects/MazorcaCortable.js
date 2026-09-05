import Phaser from "phaser";

export default class MazorcaCortable extends Phaser.GameObjects.Container {

    constructor(scene, config) {
        super(scene, 0, 0);
        scene.add.existing(this);

        this.config = config;
        this.anchoJuego = scene.scale.width;
        this.altoJuego = scene.scale.height;
        this.habilitado = false;

        this.crearAreaJuego();
        this.crearComposicionCorte();
        this.crearAyudaVisual();
        this.configurarInteraccion();

        this.setDepth(config.depth ?? 8);
    }

    crearAreaJuego() {
        this.areaJuego = this.scene.add.rectangle(
            this.anchoJuego / 2,
            this.altoJuego * 0.54,
            this.anchoJuego * 0.88,
            this.altoJuego * 0.76,
            0xFFFFFF,
            0.001
        );
        this.add(this.areaJuego);
    }

    crearComposicionCorte() {
        this.composicion = this.scene.add.image(
            0,
            0,
            "RamaMazorcaCorte"
        );
        this.xComposicion = this.anchoJuego / 2;
        this.yComposicion = this.altoJuego / 2;
        this.composicion
            .setPosition(this.xComposicion, this.yComposicion)
            .setDisplaySize(this.anchoJuego, this.altoJuego);

        this.escalaComposicionX = this.composicion.scaleX;
        this.escalaComposicionY = this.composicion.scaleY;

        // El asset aprobado representa el encuadre completo del lienzo.
        this.xCorte = this.anchoJuego * 0.41;
        this.yCorte = this.altoJuego * 0.315;
        this.xMazorcaDesprendida = this.anchoJuego * 0.43;
        this.yMazorcaDesprendida = this.altoJuego * 0.588;
        this.escalaMazorcaDesprendidaX = this.escalaComposicionX * 0.92;
        this.escalaMazorcaDesprendidaY = this.escalaComposicionY * 0.92;

        this.mazorcaDesprendida = this.scene.add.image(
            this.xMazorcaDesprendida,
            this.yMazorcaDesprendida,
            "MazorcaDesprendidaCorte"
        );
        this.mazorcaDesprendida
            .setScale(
                this.escalaMazorcaDesprendidaX,
                this.escalaMazorcaDesprendidaY
            )
            .setVisible(false);

        this.tijera = this.scene.add.image(
            this.xCorte - this.anchoJuego * 0.05,
            this.yCorte + this.altoJuego * 0.015,
            "TijeraPodaAbierta"
        );
        this.escalaTijera = (this.anchoJuego * 0.18) / this.tijera.width;
        this.tijera.setScale(this.escalaTijera).setVisible(false);

        this.add([this.composicion, this.mazorcaDesprendida, this.tijera]);
    }

    crearAyudaVisual() {
        this.yInicioBarrido = this.altoJuego * 0.22;
        this.yFinBarrido = this.altoJuego * 0.82;
        this.toleranciaLinea = this.altoJuego * (
            this.config.toleranciaLinea ?? 0.045
        );
        this.duracionBarridoMs = this.config.duracionBarridoMs ?? 1900;
        this.anchoLinea = this.anchoJuego * 0.18;
        this.xLinea = this.anchoJuego * (this.config.posicionXLinea ?? 0.44);
        this.ayudaPedunculoActiva = false;
        this.radioIndicadorPedunculo = this.altoJuego * 0.075;

        this.indicadorPedunculo = this.scene.add.graphics();
        this.indicadorPedunculo.setPosition(
            this.xCorte,
            this.yCorte + this.altoJuego * 0.035
        );
        this.indicadorPedunculo.fillStyle(0xFFF4A8, 0.12);
        this.indicadorPedunculo.fillCircle(0, 0, this.radioIndicadorPedunculo);
        this.indicadorPedunculo.lineStyle(
            Math.max(5, this.altoJuego * 0.006),
            0xFFF4A8,
            1
        );
        this.indicadorPedunculo.strokeCircle(0, 0, this.radioIndicadorPedunculo);

        this.sombraLinea = this.scene.add.rectangle(
            this.xLinea,
            0,
            this.anchoLinea,
            Math.max(12, this.altoJuego * 0.018),
            0xFF3048,
            0.28
        );

        this.lineaCorte = this.scene.add.rectangle(
            this.xLinea,
            0,
            this.anchoLinea,
            Math.max(6, this.altoJuego * 0.009),
            0xFF3048,
            1
        );
        this.lineaCorte.setStrokeStyle(
            Math.max(1, this.altoJuego * 0.002),
            0xFFF0D6,
            0.95
        );

        this.lineaBarrido = this.scene.add.container(
            0,
            this.yInicioBarrido,
            [this.sombraLinea, this.lineaCorte]
        );

        this.add([this.indicadorPedunculo, this.lineaBarrido]);
        this.ocultarAyuda();
    }

    configurarInteraccion() {
        this.areaJuego.on("pointerdown", () => {
            if (!this.habilitado) return;

            if (this.lineaSobrePedunculo()) {
                this.deshabilitarPedunculo();
                this.config.onPedunculoSeleccionado?.();
            }
            else {
                this.config.onPuntoIncorrecto?.();
            }
        });
    }

    lineaSobrePedunculo() {
        return Math.abs(this.lineaBarrido.y - this.yCorte) <= this.toleranciaLinea;
    }

    prepararRonda() {
        this.scene.tweens.killTweensOf([
            this.composicion,
            this.mazorcaDesprendida,
            this.lineaBarrido,
            this.sombraLinea,
            this.lineaCorte,
            this.indicadorPedunculo,
            this.tijera
        ]);

        this.composicion
            .setTexture("RamaMazorcaCorte")
            .setPosition(this.xComposicion, this.yComposicion)
            .setDisplaySize(this.anchoJuego, this.altoJuego)
            .setAngle(0)
            .setAlpha(1)
            .setVisible(true);

        this.mazorcaDesprendida
            .setPosition(this.xMazorcaDesprendida, this.yMazorcaDesprendida)
            .setAngle(0)
            .setAlpha(1)
            .setVisible(false)
            .setScale(
                this.escalaMazorcaDesprendidaX,
                this.escalaMazorcaDesprendidaY
            );

        this.tijera
            .setTexture("TijeraPodaAbierta")
            .setPosition(
                this.xCorte - this.anchoJuego * 0.05,
                this.yCorte + this.altoJuego * 0.015
            )
            .setAngle(0)
            .setScale(this.escalaTijera)
            .setVisible(false);

        this.habilitarPedunculo();
    }

    habilitarPedunculo() {
        this.habilitado = true;
        this.areaJuego.setInteractive({ useHandCursor: true });
        this.mostrarAyuda();
    }

    deshabilitarPedunculo() {
        this.habilitado = false;
        this.areaJuego.disableInteractive();
        this.ocultarAyuda();
    }

    mostrarAyuda() {
        this.scene.tweens.killTweensOf(this.lineaBarrido);
        this.lineaBarrido
            .setY(this.yInicioBarrido)
            .setVisible(true)
            .setAlpha(1);
        this.lineaCorte.setScale(1).setAlpha(1);
        this.sombraLinea.setScale(1).setAlpha(0.28);

        if (this.ayudaPedunculoActiva) this.animarIndicadorPedunculo();
        else this.indicadorPedunculo.setVisible(false);

        this.scene.tweens.add({
            targets: this.lineaBarrido,
            y: this.yFinBarrido,
            duration: this.duracionBarridoMs,
            ease: "Linear",
            yoyo: true,
            repeat: -1
        });
    }

    reforzarAyuda() {
        this.scene.tweens.add({
            targets: [this.sombraLinea, this.lineaCorte],
            scaleY: 1.8,
            alpha: 0.45,
            duration: 110,
            ease: "Back.Out",
            yoyo: true,
            onComplete: () => {
                this.sombraLinea.setScale(1).setAlpha(0.28);
                this.lineaCorte.setScale(1).setAlpha(1);
            }
        });

        if (!this.scene.textures.exists("IndicadorError")) return;

        const indicador = this.scene.add.image(
            this.xLinea,
            this.lineaBarrido.y,
            "IndicadorError"
        );
        this.add(indicador);

        const escalaFinal = (this.anchoJuego * 0.042) / indicador.width;
        indicador.setScale(0).setAlpha(0.95);

        this.scene.tweens.add({
            targets: indicador,
            scale: escalaFinal,
            alpha: 0,
            y: indicador.y - this.altoJuego * 0.04,
            duration: 520,
            ease: "Sine.Out",
            onComplete: () => indicador.destroy()
        });
    }

    mostrarObjetivoPedunculo() {
        this.ayudaPedunculoActiva = true;
        this.animarIndicadorPedunculo();
    }

    animarIndicadorPedunculo() {
        this.scene.tweens.killTweensOf(this.indicadorPedunculo);
        this.indicadorPedunculo
            .setVisible(true)
            .setAlpha(1)
            .setScale(0.92);

        this.scene.tweens.add({
            targets: this.indicadorPedunculo,
            scale: 1.08,
            alpha: 0.58,
            duration: 560,
            ease: "Sine.InOut",
            yoyo: true,
            repeat: -1
        });
    }

    ocultarAyuda() {
        this.scene.tweens.killTweensOf([
            this.lineaBarrido,
            this.sombraLinea,
            this.lineaCorte,
            this.indicadorPedunculo
        ]);
        this.lineaBarrido.setVisible(false).setAlpha(1);
        this.indicadorPedunculo.setVisible(false).setAlpha(1).setScale(1);
        this.sombraLinea.setScale(1).setAlpha(0.28);
        this.lineaCorte.setScale(1).setAlpha(1);
    }

    mostrarTijera() {
        this.tijera.setVisible(true).setScale(0).setAlpha(0);
        this.scene.tweens.add({
            targets: this.tijera,
            scale: this.escalaTijera,
            alpha: 1,
            duration: 260,
            ease: "Back.Out"
        });
    }

    mostrarError(tipo) {
        const objetivo = tipo === "alta" ? this.composicion : this.tijera;
        const angulo = tipo === "alta" ? 1.4 : 3.5;

        this.scene.tweens.add({
            targets: objetivo,
            angle: { from: -angulo, to: angulo },
            duration: 80,
            ease: "Sine.InOut",
            yoyo: true,
            repeat: 2,
            onComplete: () => objetivo.setAngle(0)
        });
    }

    cortar(onComplete) {
        this.deshabilitarPedunculo();
        this.tijera.setTexture("TijeraPodaCerrada").setScale(this.escalaTijera);
        this.composicion.setTexture("RamaCortadaCorte");
        this.mazorcaDesprendida.setVisible(true).setAlpha(1);

        const indicador = this.scene.add.image(
            this.xCorte + this.anchoJuego * 0.055,
            this.yCorte,
            "IndicadorCorrecto"
        );
        indicador.setScale(0).setAlpha(0);
        this.add(indicador);

        const escalaIndicador = (this.anchoJuego * 0.045) / indicador.width;
        this.scene.tweens.add({
            targets: indicador,
            scale: escalaIndicador,
            alpha: 1,
            duration: 180,
            ease: "Back.Out"
        });

        this.scene.tweens.add({
            targets: this.mazorcaDesprendida,
            y: this.mazorcaDesprendida.y + this.altoJuego * 0.22,
            angle: Phaser.Math.RND.pick([-9, 9]),
            alpha: 0,
            duration: 820,
            ease: "Quad.In",
            onComplete: () => {
                indicador.destroy();
                onComplete?.();
            }
        });
    }

    deshabilitarTodo() {
        this.deshabilitarPedunculo();
    }
}
