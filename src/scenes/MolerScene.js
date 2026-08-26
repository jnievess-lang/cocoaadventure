import Phaser from "phaser";
import EscenaMantenimientoBase from "./EscenaMantenimientoBase";
import ProgressManager from "../managers/ProgressManager";

const VUELTAS_NECESARIAS = 3;

// El eje de giro del molino, medido sobre Molino.webp: la polea está en el
// 41,4 % del ancho y el 32,6 % del alto de la lámina. Se guarda como fracción
// para que la manivela siga cuadrando en cualquier tamaño de pantalla.
const EJE_EN_LAMINA = Object.freeze({ x: 0.414, y: 0.326 });

const RECETA = Object.freeze([
    { clave: "Azucar", etiqueta: "AZÚCAR", chorro: 0xFFF4D6 },
    { clave: "MantecaCacao", etiqueta: "MANTECA DE CACAO", chorro: 0xF2D98B },
    { clave: "Leche", etiqueta: "LECHE", chorro: 0xFFFFFF }
]);

const CONFIGURACION_NIVEL = Object.freeze({

    escenaModulo: "ProcesarScene",

    fondo: "FondoMolienda",
    oscurecerFondo: 0.06,

    tutorial: "Gira la manivela del molino con el dedo, en círculos. Cuando la pasta esté lista, agrega lo que pide la receta.",

    tituloExito: "¡Chocolate listo!",

    voces: {
        instruccion: "vozMolerInstruccion",
        ayuda: "vozMolerAyuda",
        completado: "vozMolerCompletado",
        tiempoAgotado: "vozMolerTiempoAgotado"
    },

    duracionSegundos: 90,
    vidasMaximas: 3,

    totalObjetivos: VUELTAS_NECESARIAS + RECETA.length,
    iconoContador: "MantecaCacao",

    guardarProgreso: estrellas => ProgressManager.completeMolienda(estrellas)

});

/**
 * Procesar, nivel 4: moler y mezclar.
 *
 * Dos fases con gestos distintos. Primero hay que girar la manivela dando
 * vueltas de verdad con el dedo: no vale tocar, hay que acumular ángulo. Solo
 * cuando sale la pasta aparece el tazón y la receta, que se completa en orden
 * y termina con la barra de chocolate.
 */
export default class MolerScene extends EscenaMantenimientoBase {

    constructor() {
        super("MolerScene", CONFIGURACION_NIVEL);
    }

    crearMecanica() {
        this.fase = "moliendo";
        this.anguloAcumulado = 0;
        this.vueltasHechas = 0;
        this.pasoReceta = 0;
        this.girando = false;
        this.animando = false;
        this.ingredientes = [];

        this.crearMolino();
        this.crearManivela();
        this.crearCartelReceta();
    }

    crearMolino() {
        this.molino = this.add.image(
            this.ancho * 0.27,
            this.alto * 0.55,
            "Molino"
        );

        this.molino
            .setScale((this.ancho * 0.26) / this.molino.width)
            .setDepth(10);
    }

    /**
     * La manivela se ancla al eje real del molino, midiendo desde el propio
     * sprite. Las dos coordenadas salen de sus dimensiones mostradas, no una
     * del ancho de la escena y otra del alto: si se mezclan bases, la relación
     * se rompe en cuanto cambia la proporción de pantalla.
     */
    crearManivela() {
        this.pivote = {
            x: this.molino.x +
                this.molino.displayWidth * (EJE_EN_LAMINA.x - 0.5),
            y: this.molino.y +
                this.molino.displayHeight * (EJE_EN_LAMINA.y - 0.5)
        };

        this.radioManivela = this.molino.displayWidth * 0.30;

        this.guia = this.add.circle(
            this.pivote.x,
            this.pivote.y,
            this.radioManivela,
            0xFFFFFF,
            0.10
        );

        this.guia
            .setStrokeStyle(Math.max(4, this.alto * 0.006), 0xFFF4D6, 0.65)
            .setDepth(30);

        this.perilla = this.add.circle(
            this.pivote.x + this.radioManivela,
            this.pivote.y,
            this.radioManivela * 0.24,
            0xD9541F,
            1
        );

        this.perilla
            .setStrokeStyle(Math.max(3, this.alto * 0.004), 0x7A2A0C, 1)
            .setDepth(31);

        this.etiquetaGiro = this.add.text(
            this.pivote.x,
            this.pivote.y + this.radioManivela * 1.5,
            "GIRA",
            {
                fontFamily: "Trebuchet MS",
                fontSize: `${this.alto * 0.026}px`,
                color: "#FFF4D6",
                fontStyle: "bold",
                stroke: "#4A2718",
                strokeThickness: 5
            }
        ).setOrigin(0.5).setDepth(31);

        this.input.on("pointerdown", p => this.tomarManivela(p));
        this.input.on("pointermove", p => this.girar(p));
        this.input.on("pointerup", () => { this.girando = false; });
    }

    tomarManivela(puntero) {
        if (this.estado !== "jugando" || this.fase !== "moliendo") return;

        const distancia = Phaser.Math.Distance.Between(
            puntero.x,
            puntero.y,
            this.pivote.x,
            this.pivote.y
        );

        // Se agarra en una corona alrededor del eje, no en el centro exacto:
        // en el centro el ángulo salta y el giro se vuelve impredecible.
        if (distancia > this.radioManivela * 1.9) return;
        if (distancia < this.radioManivela * 0.25) return;

        this.girando = true;
        this.anguloPrevio = this.anguloDe(puntero);
    }

    anguloDe(puntero) {
        return Math.atan2(
            puntero.y - this.pivote.y,
            puntero.x - this.pivote.x
        );
    }

    girar(puntero) {
        if (!this.girando || this.estado !== "jugando") return;
        if (this.fase !== "moliendo") return;

        const angulo = this.anguloDe(puntero);

        // Diferencia mínima con signo: evita el salto de +pi a -pi.
        const delta = Phaser.Math.Angle.Wrap(angulo - this.anguloPrevio);
        this.anguloPrevio = angulo;

        this.anguloAcumulado += Math.abs(delta);

        this.perilla.x = this.pivote.x + Math.cos(angulo) * this.radioManivela;
        this.perilla.y = this.pivote.y + Math.sin(angulo) * this.radioManivela;

        const vueltas = Math.min(
            VUELTAS_NECESARIAS,
            Math.floor(this.anguloAcumulado / (Math.PI * 2))
        );

        // Un giro rápido puede cruzar más de una vuelta entre dos eventos de
        // movimiento. Hay que puntuar todas las que se ganaron, no solo una, o
        // el contador se queda corto y el nivel no se puede completar.
        while (this.vueltasHechas < vueltas) {
            this.vueltasHechas++;
            this.registrarAcierto();
        }

        if (this.vueltasHechas >= VUELTAS_NECESARIAS && this.fase === "moliendo") {
            this.abrirReceta();
        }
    }

    crearCartelReceta() {
        this.cartel = this.add.text(
            this.ancho * 0.70,
            this.alto * 0.22,
            "",
            {
                fontFamily: "Trebuchet MS",
                fontSize: `${this.alto * 0.032}px`,
                color: "#FFF4D6",
                fontStyle: "bold",
                align: "center",
                stroke: "#4A2718",
                strokeThickness: 6,
                wordWrap: { width: this.ancho * 0.34 }
            }
        ).setOrigin(0.5).setDepth(40).setVisible(false);
    }

    // ------------------------------------------------------------------
    // Fase 2: el tazón y la receta.
    // ------------------------------------------------------------------

    abrirReceta() {
        this.fase = "receta";
        this.girando = false;

        this.guia.setVisible(false);
        this.perilla.setVisible(false);
        this.etiquetaGiro.setVisible(false);
        this.cartel.setVisible(true);

        this.crearTazon();
        this.crearIngredientes();
        this.pedirSiguiente();
    }

    /** El tazón entra en escena en cuanto sale la pasta del molino. */
    crearTazon() {
        this.tazon = this.add.image(
            this.ancho * 0.68,
            this.alto * 0.56,
            "TazonChocolate"
        );

        this.escalaTazon = (this.ancho * 0.20) / this.tazon.width;

        this.tazon
            .setScale(this.escalaTazon * 0.2)
            .setAlpha(0)
            .setDepth(35);

        this.tweens.add({
            targets: this.tazon,
            scale: this.escalaTazon,
            alpha: 1,
            duration: 420,
            ease: "Back.Out"
        });
    }

    crearIngredientes() {
        const anchoIcono = this.ancho * 0.09;

        // Se colocan en orden aleatorio: la receta se pide en un orden fijo,
        // así que hay que leer cuál toca en vez de ir tocando en fila.
        const orden = Phaser.Utils.Array.Shuffle(RECETA.slice());

        orden.forEach((item, indice) => {
            const icono = this.add.image(
                this.ancho * (0.56 + indice * 0.12),
                this.alto * 0.85,
                item.clave
            );

            icono
                .setScale(anchoIcono / icono.width)
                .setDepth(40)
                .setInteractive({ useHandCursor: true });

            icono.escalaBase = icono.scale;
            icono.origen = { x: icono.x, y: icono.y };
            icono.clave = item.clave;
            icono.chorro = item.chorro;

            icono.on("pointerup", () => this.agregarIngrediente(icono));

            this.ingredientes.push(icono);
        });
    }

    pedirSiguiente() {
        if (this.pasoReceta >= RECETA.length) return;

        this.cartel.setText(`AGREGA:\n${RECETA[this.pasoReceta].etiqueta}`);

        this.tweens.add({
            targets: this.cartel,
            scale: 1.08,
            duration: 160,
            yoyo: true,
            ease: "Sine.Out"
        });
    }

    agregarIngrediente(icono) {
        if (this.estado !== "jugando" || this.fase !== "receta") return;
        if (icono.usado || this.animando) return;

        if (icono.clave !== RECETA[this.pasoReceta].clave) {
            this.tweens.add({
                targets: icono,
                x: icono.x - 12,
                duration: 55,
                yoyo: true,
                repeat: 3,
                onComplete: () => { icono.x = icono.origen.x; }
            });

            this.registrarError();
            return;
        }

        icono.usado = true;
        icono.disableInteractive();
        this.animando = true;

        this.verter(icono, () => {
            this.animando = false;
            this.pasoReceta++;

            // El último ingrediente NO puntúa aquí. Si lo hiciera, el contador
            // llegaría a su total y la escena base daría el nivel por
            // terminado antes de que la barra llegue a verse.
            if (this.pasoReceta >= RECETA.length) {
                this.cerrarConLaBarra();
                return;
            }

            this.registrarAcierto();
            this.pedirSiguiente();
        });
    }

    /**
     * El ingrediente sube al borde del tazón, se inclina y suelta un chorro de
     * gotas que caen dentro. El tazón acusa el golpe con un rebote.
     */
    verter(icono, alTerminar) {
        const bordeY = this.tazon.y - this.tazon.displayHeight * 0.42;

        this.tweens.add({
            targets: icono,
            x: this.tazon.x - this.tazon.displayWidth * 0.18,
            y: bordeY - this.tazon.displayHeight * 0.30,
            scale: icono.escalaBase * 0.85,
            angle: -115,
            duration: 420,
            ease: "Sine.InOut",
            onComplete: () => {
                if (!this.scene.isActive(this.clave)) return;

                this.lanzarChorro(icono, bordeY);

                this.time.delayedCall(620, () => {
                    if (!this.scene.isActive(this.clave)) return;

                    this.tweens.add({
                        targets: icono,
                        alpha: 0,
                        scale: icono.escalaBase * 0.5,
                        duration: 220,
                        onComplete: () => icono.destroy()
                    });

                    this.rebotarTazon();
                    alTerminar();
                });
            }
        });
    }

    lanzarChorro(icono, bordeY) {
        const salidaX = icono.x + icono.displayWidth * 0.35;
        const salidaY = icono.y;

        for (let i = 0; i < 9; i++) {
            const gota = this.add.circle(
                salidaX + Phaser.Math.Between(-6, 6),
                salidaY,
                Math.max(4, this.alto * 0.009),
                icono.chorro,
                1
            );

            gota
                .setStrokeStyle(2, 0x8A5A2B, 0.45)
                .setDepth(36)
                .setAlpha(0);

            this.tweens.add({
                targets: gota,
                alpha: 1,
                duration: 80,
                delay: i * 55
            });

            this.tweens.add({
                targets: gota,
                x: this.tazon.x + Phaser.Math.Between(-18, 18),
                y: bordeY,
                scale: 0.5,
                alpha: 0,
                duration: 380,
                delay: i * 55,
                ease: "Quad.In",
                onComplete: () => gota.destroy()
            });
        }
    }

    rebotarTazon() {
        this.sound.play("sfxRecolectarSemillas", { volume: 0.5 });

        this.tweens.add({
            targets: this.tazon,
            scaleX: this.escalaTazon * 1.07,
            scaleY: this.escalaTazon * 0.93,
            duration: 130,
            yoyo: true,
            ease: "Sine.Out"
        });
    }

    /**
     * Cierre del nivel: la mezcla se convierte en barra.
     *
     * El cronómetro se detiene antes de empezar para que la animación no pueda
     * ser interrumpida por un "tiempo agotado". Las estrellas salen de las
     * vidas, no del reloj, así que pararlo no altera la puntuación.
     */
    cerrarConLaBarra() {
        this.animando = true;
        this.hud.stop();
        this.cartel.setText("¡MEZCLANDO!");

        this.tweens.add({
            targets: this.tazon,
            angle: 8,
            duration: 110,
            yoyo: true,
            repeat: 5,
            onComplete: () => {
                if (!this.scene.isActive(this.clave)) return;
                this.tazon.setAngle(0);
                this.revelarBarra();
            }
        });
    }

    revelarBarra() {
        const destello = this.add.circle(
            this.tazon.x,
            this.tazon.y,
            this.tazon.displayWidth * 0.5,
            0xFFF4D6,
            0.9
        ).setDepth(45);

        this.tweens.add({
            targets: destello,
            scale: 2.4,
            alpha: 0,
            duration: 480,
            ease: "Sine.Out",
            onComplete: () => destello.destroy()
        });

        this.tweens.add({
            targets: this.tazon,
            scale: this.escalaTazon * 0.4,
            alpha: 0,
            duration: 320,
            ease: "Back.In"
        });

        const barra = this.add.image(
            this.tazon.x,
            this.tazon.y,
            "BarraChocolate"
        );

        const escalaBarra = (this.ancho * 0.22) / barra.width;

        barra
            .setScale(escalaBarra * 0.1)
            .setAlpha(0)
            .setAngle(-14)
            .setDepth(46);

        this.tweens.add({
            targets: barra,
            scale: escalaBarra,
            alpha: 1,
            angle: 0,
            duration: 560,
            delay: 240,
            ease: "Back.Out",
            onComplete: () => {
                if (!this.scene.isActive(this.clave)) return;

                this.tweens.add({
                    targets: barra,
                    y: barra.y - this.alto * 0.03,
                    duration: 900,
                    yoyo: true,
                    repeat: -1,
                    ease: "Sine.InOut"
                });

                this.cartel.setText("¡CHOCOLATE!");
                this.animando = false;

                // Recién ahora se puntúa: el nivel se da por terminado cuando
                // la barra ya está en pantalla, no antes.
                this.registrarAcierto();
            }
        });
    }

    habilitarMecanica() {
        this.input.enabled = true;

        this.ingredientes.forEach(i => {
            if (!i.usado && i.active) i.setInteractive({ useHandCursor: true });
        });
    }

    deshabilitarMecanica() {
        this.girando = false;
        this.ingredientes.forEach(i => {
            if (i.active) i.disableInteractive();
        });
    }

}
