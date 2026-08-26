import Phaser from "phaser";

/**
 * Grano que el niño arrastra hasta una canasta.
 *
 * A diferencia de los objetivos de Mantener, aquí no basta con acertar *cuál*
 * se toca: hay que llevarlo hasta el destino correcto. El grano vuelve solo a
 * su sitio si se suelta en el lugar equivocado, para que un error nunca deje
 * la mesa desordenada.
 */
export default class GranoArrastrable extends Phaser.GameObjects.Image {

    constructor(scene, config) {
        super(scene, config.x, config.y, config.texture);
        scene.add.existing(this);

        this.config = config;
        this.tipo = config.tipo;
        this.origen = { x: config.x, y: config.y };
        this.resuelto = false;
        this.arrastrando = false;

        this.escalaBase = config.displayWidth / this.width;

        this
            .setScale(this.escalaBase)
            .setDepth(config.depth ?? 20)
            .setAngle(Phaser.Math.Between(-18, 18));

        this.crearZonaTactil();
        this.habilitar();
    }

    crearZonaTactil() {
        const margen = this.width * 0.25;

        this.setInteractive(
            new Phaser.Geom.Rectangle(
                -margen,
                -margen,
                this.width + margen * 2,
                this.height + margen * 2
            ),
            Phaser.Geom.Rectangle.Contains,
            { draggable: true }
        );

        this.input.cursor = "grab";
        this.scene.input.setDraggable(this);

        this.on("dragstart", () => this.iniciarArrastre());
        this.on("drag", (puntero, x, y) => this.mover(x, y));
        this.on("dragend", () => this.soltar());
    }

    iniciarArrastre() {
        if (this.resuelto) return;

        this.arrastrando = true;
        this.anguloEnReposo = this.angle;

        this.config.onSeleccionar?.(this);

        this.setDepth(200);
        this.scene.tweens.add({
            targets: this,
            scale: this.escalaBase * 1.25,
            angle: 0,
            duration: 120,
            ease: "Sine.Out"
        });
    }

    mover(x, y) {
        if (this.resuelto) return;

        this.x = x;
        this.y = y;
    }

    soltar() {
        if (this.resuelto) return;

        this.arrastrando = false;

        const destino = this.config.resolverDestino?.(this.x, this.y) ?? null;

        if (destino && destino.tipo === this.tipo) {
            this.aceptar(destino);
            return;
        }

        // Soltar fuera de una canasta no penaliza: solo la canasta equivocada.
        if (destino) this.config.onDestinoIncorrecto?.(this);

        this.regresar();
    }

    aceptar(destino) {
        this.resuelto = true;
        this.deshabilitar();

        this.config.onAcierto?.(this, destino);

        this.scene.tweens.add({
            targets: this,
            x: destino.x,
            y: destino.y,
            scale: this.escalaBase * 0.35,
            alpha: 0,
            angle: this.angle + 180,
            duration: 300,
            ease: "Back.In",
            onComplete: () => this.destroy()
        });
    }

    regresar() {
        this.setDepth(this.config.depth ?? 20);

        this.scene.tweens.add({
            targets: this,
            x: this.origen.x,
            y: this.origen.y,
            scale: this.escalaBase,
            angle: this.anguloEnReposo ?? 0,
            duration: 260,
            ease: "Back.Out"
        });
    }

    habilitar() {
        if (this.resuelto || !this.active || !this.input) return;
        this.input.enabled = true;
    }

    deshabilitar() {
        if (!this.active || !this.input) return;
        this.input.enabled = false;

        // Un grano que se estaba arrastrando cuando el nivel se detiene debe
        // volver a su sitio, o quedaría pegado al dedo para siempre.
        if (this.arrastrando && !this.resuelto) {
            this.arrastrando = false;
            this.regresar();
        }
    }

}
