import Phaser from "phaser";
import EscenaMantenimientoBase from "./EscenaMantenimientoBase";
import ProgressManager from "../managers/ProgressManager";
import clasificarTueste from "../utils/clasificarTueste";
import evaluarDescuido from "../utils/evaluarDescuido";

const CONFIGURACION_NIVEL = Object.freeze({

    escenaModulo: "ProcesarScene",

    fondo: "FondoTostadora",
    oscurecerFondo: 0.10,

    tutorial: "Mantén pulsado para avivar el fuego. Cuida que la aguja se quede dentro de la franja verde.",

    tituloExito: "¡En su punto!",

    voces: {
        instruccion: "vozTostarInstruccion",
        ayuda: "vozTostarAyuda",
        completado: "vozTostarCompletado",
        tiempoAgotado: "vozTostarTiempoAgotado"
    },

    duracionSegundos: 80,
    vidasMaximas: 3,

    totalObjetivos: 4,
    iconoContador: "GranoSecoBueno",

    guardarProgreso: estrellas => ProgressManager.completeTostado(estrellas)

});

/**
 * Procesar, nivel 2: el punto de tueste.
 *
 * Equilibrio sostenido, no un disparo único: la temperatura sube mientras se
 * mantiene pulsado y cae sola al soltar. El tueste solo avanza mientras la
 * aguja está dentro de la franja verde, así que el niño tiene que corregir
 * todo el rato en vez de acertar una sola vez. Pasarse quema la tanda.
 */
export default class TostarScene extends EscenaMantenimientoBase {

    constructor() {
        super("TostarScene", CONFIGURACION_NIVEL);
    }

    crearMecanica() {
        this.temperatura = 0.08;
        this.avanceTanda = 0;
        this.avivando = false;
        this.tandaQuemada = false;
        this.descuido = 0;
        this.haLlegadoAlPunto = false;

        this.crearTostadora();
        this.crearBarra();
        this.crearBotonFuego();
    }

    /** Los granos de la tanda se oscurecen conforme avanza el tueste. */
    crearTostadora() {
        this.granos = [];

        const anchoGrano = this.ancho * 0.045;

        for (let i = 0; i < 6; i++) {
            const grano = this.add.image(
                this.ancho * (0.40 + (i % 3) * 0.10),
                this.alto * (0.44 + Math.floor(i / 3) * 0.09),
                "GranoSecoBueno"
            );

            grano
                .setScale(anchoGrano / grano.width)
                .setAngle(Phaser.Math.Between(-25, 25))
                .setDepth(12);

            this.granos.push(grano);
        }
    }

    crearBarra() {
        this.barra = this.add.image(
            this.ancho * 0.5,
            this.alto * 0.20,
            "BarraTueste"
        );

        this.barra
            .setScale((this.ancho * 0.46) / this.barra.width)
            .setDepth(40);

        this.aguja = this.add.rectangle(
            0,
            this.barra.y,
            Math.max(5, this.ancho * 0.005),
            this.barra.displayHeight * 1.35,
            0xFFFFFF,
            1
        );

        this.aguja
            .setStrokeStyle(Math.max(2, this.ancho * 0.002), 0x4A2718, 1)
            .setDepth(41);

        this.etiquetaTueste = this.add.text(
            this.ancho * 0.5,
            this.alto * 0.30,
            "Tueste 0 %",
            {
                fontFamily: "Trebuchet MS",
                fontSize: `${this.alto * 0.030}px`,
                color: "#FFF4D6",
                fontStyle: "bold",
                stroke: "#4A2718",
                strokeThickness: 6
            }
        ).setOrigin(0.5).setDepth(41);

        this.avisoFuera = this.add.text(
            this.ancho * 0.5,
            this.alto * 0.36,
            "¡Vuelve a la franja verde!",
            {
                fontFamily: "Trebuchet MS",
                fontSize: `${this.alto * 0.028}px`,
                color: "#FFE08A",
                fontStyle: "bold",
                stroke: "#7A2A0C",
                strokeThickness: 6
            }
        ).setOrigin(0.5).setDepth(41).setVisible(false);

        this.colocarAguja();
    }

    colocarAguja() {
        const izquierda = this.barra.x - this.barra.displayWidth / 2;

        this.aguja.x = izquierda +
            this.barra.displayWidth * Phaser.Math.Clamp(this.temperatura, 0, 1);
    }

    crearBotonFuego() {
        const radio = Math.min(this.ancho * 0.075, this.alto * 0.12);

        this.boton = this.add.circle(
            this.ancho * 0.5,
            this.alto * 0.82,
            radio,
            0xD9541F,
            1
        );

        this.boton
            .setStrokeStyle(Math.max(5, this.alto * 0.008), 0x7A2A0C, 1)
            .setDepth(45);

        this.textoBoton = this.add.text(
            this.boton.x,
            this.boton.y,
            "Avivar\nfuego",
            {
                fontFamily: "Trebuchet MS",
                fontSize: `${this.alto * 0.026}px`,
                color: "#FFF4D6",
                fontStyle: "bold",
                align: "center"
            }
        ).setOrigin(0.5).setDepth(46);

        this.boton.setInteractive({ useHandCursor: true });

        this.boton.on("pointerdown", () => this.encender(true));
        this.boton.on("pointerup", () => this.encender(false));
        this.boton.on("pointerout", () => this.encender(false));

        // Si el dedo se levanta fuera del botón, el fuego debe apagarse igual.
        this.input.on("pointerup", () => this.encender(false));
    }

    encender(activo) {
        if (this.estado !== "jugando") {
            this.avivando = false;
            return;
        }

        this.avivando = activo;

        this.tweens.add({
            targets: this.boton,
            scale: activo ? 0.92 : 1,
            duration: 90,
            ease: "Sine.Out"
        });
    }

    update(tiempo, delta) {
        if (this.estado !== "jugando") return;

        const segundos = delta / 1000;

        this.actualizarTemperatura(segundos);
        this.actualizarDescuido(segundos);
        this.actualizarTueste(segundos);
        this.colocarAguja();
        this.pintarGranos();
    }

    /**
     * Quedarse fuera de la franja también cuesta.
     *
     * Antes el único error posible era quemarse, así que dejar la aguja quieta
     * abajo no tenía consecuencia: el nivel se podía "esperar". Ahora cruzar a
     * rojo cuesta una vida en el acto, una sola vez por salida.
     */
    actualizarDescuido(segundos) {
        // Mientras la tanda arde ya se está cobrando el error del quemado; no
        // corresponde cobrar además el de estar fuera de punto.
        if (this.tandaQuemada) return;

        // El cobro no empieza hasta que la aguja alcanza el verde por primera
        // vez en la tanda. La aguja arranca en rojo y tiene que cruzarlo para
        // llegar al punto: sin esta espera, calentar costaría una vida siempre.
        if (this.puntoDeTueste() === "punto") this.haLlegadoAlPunto = true;
        if (!this.haLlegadoAlPunto) return;

        const resultado = evaluarDescuido(
            this.descuido,
            this.puntoDeTueste(),
            segundos
        );

        this.descuido = resultado.descuido;
        this.mostrarAviso(resultado.avisar);

        if (resultado.penalizar) this.descuidarTanda();
    }

    mostrarAviso(activo) {
        if (this.avisoFuera.visible === activo) return;

        // El parpadeo se mata siempre antes de volver a crearlo: encender y
        // apagar el aviso varias veces apilaria tweens sobre el mismo texto.
        this.tweens.killTweensOf(this.avisoFuera);

        this.avisoFuera.setScale(1).setVisible(activo);
        this.aguja.setFillStyle(activo ? 0xFF6B4A : 0xFFFFFF, 1);

        if (!activo) return;

        this.tweens.add({
            targets: this.avisoFuera,
            scale: 1.09,
            duration: 340,
            yoyo: true,
            repeat: -1,
            ease: "Sine.InOut"
        });
    }

    descuidarTanda() {
        this.mostrarAviso(false);

        this.cameras.main.shake(140, 0.004);

        // El tueste ya logrado no se pierde: perder la tanda entera es el
        // castigo de quemarla, y conviene que los dos errores se distingan.
        this.registrarError();
    }

    actualizarTemperatura(segundos) {
        // Sube algo más rápido de lo que baja: soltar a tiempo es la decisión
        // interesante, y esperar a que enfríe no debe ser tedioso.
        const cambio = this.avivando ? 0.40 : -0.30;

        this.temperatura = Phaser.Math.Clamp(
            this.temperatura + cambio * segundos,
            0,
            1
        );

        if (this.puntoDeTueste() === "quemado" && !this.tandaQuemada) {
            this.quemar();
        }
    }

    puntoDeTueste() {
        return clasificarTueste(this.temperatura);
    }

    enZonaVerde() {
        return this.puntoDeTueste() === "punto";
    }

    actualizarTueste(segundos) {
        if (this.tandaQuemada) return;

        if (this.enZonaVerde()) {
            this.avanceTanda = Math.min(1, this.avanceTanda + 0.30 * segundos);
        }
        else {
            // Fuera de la franja el tueste no retrocede, solo se detiene: el
            // castigo es perder tiempo, no perder lo ya logrado.
            this.avanceTanda = Math.max(0, this.avanceTanda - 0.04 * segundos);
        }

        this.etiquetaTueste.setText(
            `Tueste ${Math.round(this.avanceTanda * 100)} %`
        );

        if (this.avanceTanda >= 1) this.completarTanda();
    }

    pintarGranos() {
        const t = this.tandaQuemada ? 1 : this.avanceTanda;

        const color = Phaser.Display.Color.Interpolate.ColorWithColor(
            new Phaser.Display.Color(0xC9, 0x8A, 0x6A),
            new Phaser.Display.Color(
                this.tandaQuemada ? 0x2A : 0x5B,
                this.tandaQuemada ? 0x12 : 0x2E,
                this.tandaQuemada ? 0x06 : 0x14
            ),
            100,
            Math.round(t * 100)
        );

        const tinte = Phaser.Display.Color.GetColor(color.r, color.g, color.b);

        this.granos.forEach(grano => grano.setTint(tinte));
    }

    quemar() {
        this.tandaQuemada = true;
        this.avanceTanda = 0;
        this.descuido = 0;
        this.mostrarAviso(false);

        this.cameras.main.shake(180, 0.006);
        this.sound.play("sfxSeleccionIncorrecta", { volume: 0.5 });

        // Sin vida aquí: cruzar a rojo ya la cobró al entrar, y llegar hasta
        // el extremo es la misma salida. El castigo de quemarse es perder la
        // tanda entera, que es lo que distingue este error del descuido.

        this.time.delayedCall(700, () => {
            if (!this.scene.isActive(this.clave)) return;

            this.tandaQuemada = false;
            this.temperatura = 0.08;
            this.haLlegadoAlPunto = false;
            this.etiquetaTueste.setText("Tueste 0 %");
        });
    }

    completarTanda() {
        this.avanceTanda = 0;
        this.temperatura = 0.08;
        this.descuido = 0;
        // La tanda nueva vuelve a arrancar en rojo: se le devuelve el margen
        // del primer ascenso.
        this.haLlegadoAlPunto = false;
        this.mostrarAviso(false);

        this.granos.forEach(grano => grano.clearTint());
        this.etiquetaTueste.setText("Tueste 0 %");

        this.registrarAcierto();
    }

    habilitarMecanica() {
        this.boton?.setInteractive({ useHandCursor: true });
    }

    deshabilitarMecanica() {
        this.avivando = false;
        this.boton?.disableInteractive();

        // Al pausar o terminar, el aviso no debe quedarse parpadeando encima
        // del panel de resultados.
        this.mostrarAviso(false);
    }

}
