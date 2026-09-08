import Phaser from "phaser";
import EscenaMantenimientoBase from "./EscenaMantenimientoBase";
import ProgressManager from "../managers/ProgressManager";

const VUELTAS_NECESARIAS = 3;

// Geometría medida sobre Molino.webp. La lámina trae el molino montado en su
// mesa, así que la máquina ocupa poco más de la mitad del ancho: por eso el
// sprite se dibuja grande y el eje cae tan a la derecha.
//
// El eje es el centro de la polea; el radio es la distancia de esa polea al
// puño de madera, para que el círculo de arrastre caiga sobre la manivela
// dibujada. Si se cambia la lámina hay que volver a medir los tres valores.
const EJE_EN_LAMINA = Object.freeze({ x: 0.62, y: 0.20 });
const RADIO_EN_LAMINA = 0.38;

// Ángulo en el que está dibujado el puño: abajo a la izquierda del eje. La
// perilla arranca ahí para que se lea como la manivela y no como un botón
// suelto flotando al otro lado.
const ANGULO_PUNO = Math.atan2(0.147, -0.121);

const RECETA = Object.freeze([
    { clave: "Azucar", etiqueta: "Azúcar", chorro: 0xFFF4D6 },
    { clave: "MantecaCacao", etiqueta: "Manteca de cacao", chorro: 0xF2D98B },
    { clave: "Leche", etiqueta: "Leche", chorro: 0xFFFFFF }
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

        // Mide cuánto se está girando ahora mismo, de 0 a 1. Sube con el
        // movimiento del dedo y cae sola, así la máquina solo se mueve
        // mientras el niño la mueve.
        this.impulsoGiro = 0;
        this.proximaMolida = 0;

        this.crearMolino();
        this.crearManivela();
        this.crearCartelReceta();
    }

    crearMolino() {
        // La lámina incluye la mesa, así que se dibuja bastante más ancha que
        // la anterior para que la máquina conserve su tamaño en pantalla.
        //
        // El límite por alto no es decorativo: el eje queda en la parte alta
        // del sprite, así que el círculo de arrastre sobresale por encima. En
        // una pantalla muy apaisada (20:9), midiendo solo con el ancho, ese
        // círculo se salía del lienzo y su tramo superior quedaba fuera del
        // alcance del dedo.
        const anchoMolino = Math.min(this.ancho * 0.44, this.alto * 0.77);

        // La mesa está cortada en seco por el borde izquierdo de la lámina.
        // Se coloca ese borde fuera del lienzo para que la mesa se lea como
        // que sigue más allá de la pantalla, en vez de terminar en un tajo
        // recto flotando en mitad del aire.
        this.molino = this.add.image(
            anchoMolino / 2 - this.ancho * 0.03,
            this.alto * 0.55,
            "Molino"
        );

        this.molino
            .setScale(anchoMolino / this.molino.width)
            .setDepth(10);

        // Posición de reposo: la trepidación la desplaza y hay que devolverla.
        this.molinoEnReposo = { x: this.molino.x, y: this.molino.y };
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

        this.radioManivela = this.molino.displayWidth * RADIO_EN_LAMINA;

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
            this.pivote.x + Math.cos(ANGULO_PUNO) * this.radioManivela,
            this.pivote.y + Math.sin(ANGULO_PUNO) * this.radioManivela,
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
            "Gira",
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

        // Un cuarto de vuelta de un tirón basta para llegar al máximo.
        this.impulsoGiro = Math.min(
            1,
            this.impulsoGiro + Math.abs(delta) * 2.4
        );

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

    /**
     * Da vida a la máquina mientras se muele.
     *
     * El sprite es una lámina plana con su mesa incluida, así que girarlo
     * entero haría rodar tambien la mesa: no se puede "girar el molino". Lo
     * que sí se lee como que está trabajando es que trepide y que suelte
     * cacao molido por la boca, y ambas cosas solo ocurren mientras el dedo
     * está dando vueltas de verdad.
     */
    update(tiempo, delta) {
        if (this.fase !== "moliendo" || !this.molino) return;
        if (this.estado !== "jugando") return;

        const segundos = delta / 1000;

        this.impulsoGiro = Math.max(0, this.impulsoGiro - 2.2 * segundos);

        this.trepidar(tiempo);

        if (this.impulsoGiro > 0.18 && tiempo >= this.proximaMolida) {
            // Cuanto más rápido gira, más seguido cae cacao.
            this.proximaMolida = tiempo + 90 - this.impulsoGiro * 45;
            this.soltarMolido();
        }
    }

    trepidar(tiempo) {
        const amplitud = this.impulsoGiro * this.molino.displayWidth * 0.006;

        this.molino.x = this.molinoEnReposo.x +
            Math.sin(tiempo * 0.045) * amplitud;

        this.molino.y = this.molinoEnReposo.y +
            Math.cos(tiempo * 0.062) * amplitud * 0.6;

        this.molino.setAngle(Math.sin(tiempo * 0.038) * this.impulsoGiro * 0.7);
    }

    /** Una mota de cacao molido cayendo de la boca del molino a la mesa. */
    soltarMolido() {
        const izquierda = this.molino.x - this.molino.displayWidth / 2;
        const arriba = this.molino.y - this.molino.displayHeight / 2;

        // Boca de salida, medida sobre la lámina igual que el eje.
        const x = izquierda + this.molino.displayWidth * 0.80 +
            Phaser.Math.Between(-6, 6);

        const y = arriba + this.molino.displayHeight * 0.43;

        const mota = this.add.circle(
            x,
            y,
            Phaser.Math.Between(3, 6),
            Phaser.Math.RND.pick([0x6B3A1E, 0x5A2E16, 0x7C4A28]),
            1
        ).setDepth(11);

        this.tweens.add({
            targets: mota,
            y: y + this.molino.displayHeight * 0.16,
            x: x + Phaser.Math.Between(-10, 10),
            alpha: 0,
            scale: 0.4,
            duration: Phaser.Math.Between(420, 620),
            ease: "Quad.In",
            onComplete: () => mota.destroy()
        });
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

        // La trepidación se apaga con la fase: hay que devolver la máquina a
        // su sitio o se queda torcida donde la dejó el último fotograma.
        this.impulsoGiro = 0;
        this.molino.setPosition(this.molinoEnReposo.x, this.molinoEnReposo.y);
        this.molino.setAngle(0);

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

        this.cartel.setText(`Agrega:\n${RECETA[this.pasoReceta].etiqueta}`);

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
        this.cartel.setText("¡Mezclando!");

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

                this.cartel.setText("¡Chocolate!");
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
