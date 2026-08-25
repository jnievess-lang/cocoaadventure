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
        this.resaltado = this.scene.add.graphics();
        this.resaltado.setPosition(
            this.xCorte,
            this.yCorte
        );
        this.resaltado.lineStyle(
            Math.max(5, this.altoJuego * 0.006),
            0xFFF4A8,
            1
        );
        this.resaltado.strokeCircle(
            0,
            0,
            this.altoJuego * 0.07
        );

        this.flecha = this.scene.add.text(
            this.xCorte,
            this.yCorte - this.altoJuego * 0.09,
            "▼",
            {
                fontFamily: "Trebuchet MS",
                fontSize: `${this.altoJuego * 0.055}px`,
                color: "#FFF4A8",
                fontStyle: "bold",
                stroke: "#5A3218",
                strokeThickness: 5
            }
        ).setOrigin(0.5);

        this.areaPedunculo = this.scene.add.rectangle(
            this.xCorte,
            this.yCorte,
            Math.max(this.anchoJuego * 0.085, this.altoJuego * 0.13),
            this.altoJuego * 0.16,
            0xFFFFFF,
            0.001
        );

        this.add([this.resaltado, this.flecha, this.areaPedunculo]);
        this.ocultarAyuda();
    }

    configurarInteraccion() {
        this.areaJuego.on("pointerdown", () => {
            if (this.habilitado) this.config.onPuntoIncorrecto?.();
        });

        this.areaPedunculo.on("pointerdown", (pointer, localX, localY, event) => {
            event.stopPropagation();
            if (!this.habilitado) return;
            this.deshabilitarPedunculo();
            this.config.onPedunculoSeleccionado?.();
        });
    }

    prepararRonda() {
        this.scene.tweens.killTweensOf([
            this.composicion,
            this.mazorcaDesprendida,
            this.resaltado,
            this.flecha,
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
        this.areaPedunculo.setInteractive({ useHandCursor: true });
        this.mostrarAyuda();
    }

    deshabilitarPedunculo() {
        this.habilitado = false;
        this.areaJuego.disableInteractive();
        this.areaPedunculo.disableInteractive();
        this.ocultarAyuda();
    }

    mostrarAyuda() {
        this.resaltado.setVisible(true).setAlpha(1).setScale(1);
        this.flecha.setVisible(true).setAlpha(1);

        this.scene.tweens.add({
            targets: [this.resaltado, this.flecha],
            alpha: { from: 0.45, to: 1 },
            scale: { from: 0.92, to: 1.08 },
            duration: 620,
            ease: "Sine.InOut",
            yoyo: true,
            repeat: -1
        });
    }

    reforzarAyuda() {
        this.scene.tweens.add({
            targets: [this.resaltado, this.flecha],
            scale: 1.24,
            duration: 150,
            ease: "Back.Out",
            yoyo: true,
            onComplete: () => {
                this.resaltado.setScale(1);
                this.flecha.setScale(1);
            }
        });
    }

    ocultarAyuda() {
        this.scene.tweens.killTweensOf([this.resaltado, this.flecha]);
        this.resaltado.setVisible(false).setScale(1);
        this.flecha.setVisible(false).setScale(1);
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
