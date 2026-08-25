import Phaser from "phaser";

/**
 * Objetivo tocable común a los minijuegos de Mantener.
 *
 * Un objetivo puede ser correcto (`esObjetivo: true`) o un distractor que no
 * debe tocarse. Al resolverse puede desaparecer o transformarse en otra
 * textura, por ejemplo una planta marchita que se vuelve sana al regarla.
 */
export default class ObjetivoMantenimiento extends Phaser.GameObjects.Image {

    constructor(scene, config) {
        super(scene, config.x, config.y, config.texture);
        scene.add.existing(this);

        this.config = config;
        this.esObjetivo = config.esObjetivo ?? true;
        this.texturaResuelta = config.texturaResuelta ?? null;
        this.resuelto = false;
        this.bloqueado = false;

        this.escalaBase = config.displayWidth / this.width;

        this
            .setOrigin(config.originX ?? 0.5, config.originY ?? 0.9)
            .setScale(this.escalaBase)
            .setDepth(config.depth ?? 10);

        this.crearZonaTactil();
        this.crearAnimacionInactiva();
        this.habilitar();
    }

    /**
     * La zona táctil se amplía respecto al sprite visible para que un dedo
     * pueda acertar cómodamente en celular, tal como pide la guía de recursos.
     */
    crearZonaTactil() {
        const margen = this.width * 0.12;

        this.setInteractive(
            new Phaser.Geom.Rectangle(
                -margen,
                -margen,
                this.width + margen * 2,
                this.height + margen * 2
            ),
            Phaser.Geom.Rectangle.Contains
        );

        this.input.cursor = "pointer";
        this.on("pointerdown", () => this.seleccionar());
    }

    crearAnimacionInactiva() {
        this.animacionInactiva = this.scene.tweens.add({
            targets: this,
            scaleX: this.escalaBase * 1.03,
            scaleY: this.escalaBase * 0.97,
            duration: Phaser.Math.Between(1500, 2100),
            delay: Phaser.Math.Between(0, 600),
            ease: "Sine.InOut",
            yoyo: true,
            repeat: -1
        });
    }

    seleccionar() {
        if (this.resuelto || this.bloqueado) return;

        if (this.esObjetivo) this.resolver();
        else this.marcarError();
    }

    resolver() {
        this.resuelto = true;
        this.deshabilitar();

        // Aviso inmediato: la escena responde al toque sin esperar la
        // animación, para que el sonido y el contador no lleguen tarde.
        this.config.onTocarCorrecto?.(this);

        this.animacionInactiva?.stop();
        this.setScale(this.escalaBase);

        this.mostrarDestello();

        if (this.texturaResuelta) this.transformar();
        else this.desvanecer();
    }

    transformar() {
        this.scene.tweens.add({
            targets: this,
            scaleX: this.escalaBase * 0.82,
            scaleY: this.escalaBase * 0.82,
            duration: 140,
            ease: "Sine.In",
            onComplete: () => {
                if (!this.active) return;

                this.setTexture(this.texturaResuelta);
                this.setScale(this.escalaBase * 0.82);

                this.scene.tweens.add({
                    targets: this,
                    scale: this.escalaBase,
                    duration: 300,
                    ease: "Back.Out"
                });
            }
        });
    }

    desvanecer() {
        this.scene.tweens.add({
            targets: this,
            scale: this.escalaBase * 0.2,
            alpha: 0,
            angle: this.angle + 25,
            duration: 260,
            ease: "Back.In",
            onComplete: () => this.destroy()
        });
    }

    marcarError() {
        this.bloqueado = true;

        this.mostrarIndicador("IndicadorError");

        this.scene.tweens.add({
            targets: this,
            x: this.x - this.displayWidth * 0.06,
            duration: 60,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                if (!this.active) return;

                this.x = this.config.x;
                this.bloqueado = false;
            }
        });

        this.config.onError?.(this);
    }

    mostrarDestello() {
        this.mostrarIndicador("IndicadorCorrecto");
    }

    /**
     * Dibuja una marca breve sobre el objetivo. Se comprueba la textura porque
     * el nivel debe seguir siendo jugable aunque un asset no haya cargado.
     */
    mostrarIndicador(clave, factor = 1) {
        if (!this.scene.textures.exists(clave)) return;

        const alto = this.displayHeight * 0.45 * factor;

        const indicador = this.scene.add.image(
            this.x,
            this.y - this.displayHeight * 0.5,
            clave
        );

        indicador
            .setScale((alto / indicador.height) * 0.6)
            .setDepth(this.depth + 5)
            .setAlpha(0.95);

        this.scene.tweens.add({
            targets: indicador,
            scale: alto / indicador.height,
            alpha: 0,
            y: indicador.y - this.displayHeight * 0.18,
            duration: 620,
            ease: "Sine.Out",
            onComplete: () => indicador.destroy()
        });
    }

    // Se activa y desactiva `input.enabled` en lugar de volver a llamar a
    // setInteractive para no perder la zona táctil ampliada.
    habilitar() {
        if (this.resuelto || !this.active || !this.input) return;

        this.bloqueado = false;
        this.input.enabled = true;
    }

    deshabilitar() {
        if (!this.active || !this.input) return;

        this.input.enabled = false;
    }

}
