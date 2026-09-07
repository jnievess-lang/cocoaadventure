import Phaser from "phaser";

/**
 * Herramienta que el niño arrastra desde su base hasta un objetivo.
 *
 * Vive siempre en pantalla: al soltarla vuelve sola a su sitio, así que nunca
 * se pierde ni hay que volver a buscarla. La escena decide qué pasa en el punto
 * donde se suelta mediante `onSoltar`.
 */
export default class HerramientaArrastrable extends Phaser.GameObjects.Image {

    constructor(scene, config) {
        super(scene, config.x, config.y, config.texture);
        scene.add.existing(this);

        this.config = config;
        this.baseX = config.x;
        this.baseY = config.y;
        this.arrastrando = false;
        this.habilitado = false;
        this.tweenRegreso = null;
        this.tweensEfecto = [];

        this.escalaBase = config.displayHeight / this.height;

        this
            .setScale(this.escalaBase)
            .setDepth(config.depth ?? 80);

        this.crearZonaTactil();
        this.crearPista();
        this.escucharArrastre();
    }

    /**
     * La zona de agarre se amplía respecto al sprite para que un dedo pueda
     * tomarla con comodidad en celular.
     */
    crearZonaTactil() {
        const margen = this.width * 0.18;

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

        this.scene.input.setDraggable(this);
        this.input.cursor = "grab";
    }

    /** Latido suave para que se note que la herramienta se puede agarrar. */
    crearPista() {
        this.pista = this.scene.tweens.add({
            targets: this,
            scale: this.escalaBase * 1.07,
            duration: 900,
            ease: "Sine.InOut",
            yoyo: true,
            repeat: -1
        });
    }

    escucharArrastre() {
        this.on("dragstart", () => {
            if (!this.habilitado) return;

            // El regreso a la base puede seguir pendiente, sobre todo con la
            // espera larga de la regadera. Si no se cancela aquí, vence en mitad
            // del arrastre y la herramienta salta de la mano a su sitio.
            this.cancelarRegreso();
            this.cancelarEfectos();

            this.arrastrando = true;
            this.pista?.pause();
            this.setScale(this.escalaBase * (this.config.escalaAlArrastrar ?? 1.15));
            this.setDepth((this.config.depth ?? 80) + 10);
            this.config.onTomar?.();
        });

        this.on("drag", (puntero, x, y) => {
            if (!this.habilitado || !this.arrastrando) return;

            this.setPosition(x, y);
            this.config.onMover?.(x, y);
        });

        this.on("dragend", () => {
            if (!this.arrastrando) return;

            this.arrastrando = false;

            const usada = this.config.onSoltar?.(this.x, this.y) ?? false;

            // Al acertar se queda sobre la planta el tiempo que dura la
            // animación, y solo después regresa a su sitio.
            this.volverABase(usada ? 300 : 200, usada ? this.config.esperaAlUsar ?? 0 : 0);
        });
    }

    /**
     * Un efecto puede estar moviendo la herramienta cuando el niño la vuelve a
     * agarrar: la regadera, por ejemplo, se acomoda sobre la planta y se inclina
     * para verter. Esos tweens se anotan aquí para poder cortarlos al agarrarla
     * y que no peleen con el arrastre.
     */
    registrarTweenEfecto(tween) {
        if (tween) this.tweensEfecto.push(tween);
        return tween;
    }

    cancelarEfectos() {
        this.tweensEfecto.forEach(tween => tween.remove());
        this.tweensEfecto = [];
    }

    cancelarRegreso() {
        this.tweenRegreso?.remove();
        this.tweenRegreso = null;
    }

    volverABase(duracion, retraso = 0) {
        this.cancelarRegreso();

        this.tweenRegreso = this.scene.tweens.add({
            targets: this,
            x: this.baseX,
            y: this.baseY,
            scale: this.escalaBase,
            angle: 0,
            duration: duracion,
            delay: retraso,
            ease: "Back.Out",
            // El regreso arranca cuando el efecto ya se vio: a partir de aquí
            // manda él, y cualquier resto de animación debe soltar el control.
            onStart: () => this.cancelarEfectos(),
            onComplete: () => {
                this.tweenRegreso = null;

                if (!this.active) return;

                this.setDepth(this.config.depth ?? 80);
                if (this.habilitado) this.pista?.resume();
            }
        });
    }

    habilitar() {
        if (!this.active || !this.input) return;

        this.habilitado = true;
        if (!this.arrastrando) this.pista?.resume();
    }

    /**
     * No se toca `input.enabled`: apagarlo en mitad de un arrastre deja la
     * máquina de estados de arrastre de Phaser bloqueada y la herramienta ya no
     * se vuelve a poder agarrar. Basta con ignorar los eventos.
     */
    deshabilitar() {
        if (!this.active || !this.input) return;

        this.habilitado = false;
        this.pista?.pause();

        if (this.arrastrando) {
            this.arrastrando = false;
            this.config.onCancelar?.();
            this.volverABase(200);
        }
    }

}
