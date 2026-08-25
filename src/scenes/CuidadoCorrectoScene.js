import Phaser from "phaser";
import EscenaMantenimientoBase from "./EscenaMantenimientoBase";
import ObjetivoMantenimiento from "../objects/ObjetivoMantenimiento";
import SelectorHerramienta from "../ui/SelectorHerramienta";
import animarHerramienta from "../utils/animarHerramienta";
import ProgressManager from "../managers/ProgressManager";
import esCuidadoCorrecto, {
    obtenerCuidado,
    PROBLEMAS_DE_PLANTA,
    PLANTA_CON_MALEZA
} from "../utils/diagnosticoPlanta";

const HERRAMIENTAS = Object.freeze([
    { clave: "regadera", textura: "IconoRegadera", etiqueta: "Regadera" },
    { clave: "guantes", textura: "IconoGuantes", etiqueta: "Guantes" },
    { clave: "lupa", textura: "IconoLupa", etiqueta: "Lupa" },
    { clave: "fungicida", textura: "IconoFungicida", etiqueta: "Fungicida" }
]);

const CONFIGURACION_NIVEL = Object.freeze({

    fondo: "FondoFincaCacao",
    oscurecerFondo: 0.05,

    tutorial: "Mira bien qué le pasa a cada planta y elige la herramienta que necesita para estar sana.",

    tituloExito: "¡Cuidaste muy bien el cacao!",

    voces: {
        instruccion: "vozCuidadoCorrectoInstruccion",
        ayuda: "vozCuidadoCorrectoAyuda",
        completado: "vozCuidadoCorrectoCompletado",
        tiempoAgotado: "vozCuidadoCorrectoTiempoAgotado"
    },

    duracionSegundos: 75,
    vidasMaximas: 3,

    totalObjetivos: PROBLEMAS_DE_PLANTA.length,
    iconoContador: "PlantaSana",

    guardarProgreso: estrellas =>
        ProgressManager.completeCuidadoCorrecto(estrellas)

});

export default class CuidadoCorrectoScene extends EscenaMantenimientoBase {

    constructor() {
        super("CuidadoCorrectoScene", CONFIGURACION_NIVEL);
    }

    crearMecanica() {
        this.rondas = Phaser.Utils.Array.Shuffle(PROBLEMAS_DE_PLANTA.slice());
        this.rondaActual = -1;
        this.esperandoRespuesta = false;
        this.planta = null;
        this.maleza = null;

        this.crearEnunciado();
        this.crearSelector();
    }

    crearEnunciado() {
        this.panelEnunciado = this.add.rectangle(
            this.ancho * 0.5,
            this.alto * 0.26,
            this.ancho * 0.52,
            this.alto * 0.10,
            0xFFF1C6,
            0.94
        ).setDepth(40);

        this.panelEnunciado.setStrokeStyle(
            Math.max(4, this.alto * 0.005),
            0x7C431B,
            1
        );

        this.textoEnunciado = this.add.text(
            this.ancho * 0.5,
            this.alto * 0.26,
            "",
            {
                fontFamily: "Trebuchet MS",
                fontSize: `${this.alto * 0.032}px`,
                color: "#5F3215",
                fontStyle: "bold",
                align: "center",
                wordWrap: { width: this.ancho * 0.48 }
            }
        ).setOrigin(0.5).setDepth(41);
    }

    crearSelector() {
        this.selector = new SelectorHerramienta(this, {
            x: this.ancho * 0.5,
            y: this.alto * 0.85,
            separacion: 0.13,
            herramientas: HERRAMIENTAS,
            onSeleccionar: clave => this.elegirHerramienta(clave)
        });
    }

    iniciarNivel() {
        super.iniciarNivel();

        if (this.estado === "jugando") this.prepararRonda();
    }

    prepararRonda() {
        if (this.estado !== "jugando") return;

        this.rondaActual++;

        const problema = this.rondas[this.rondaActual];
        const cuidado = obtenerCuidado(problema);

        if (!cuidado) return;

        this.problemaActual = problema;
        this.textoEnunciado.setText(cuidado.enunciado);

        this.crearPlanta(cuidado);

        if (problema === PLANTA_CON_MALEZA) this.crearMalezaAcompanante();

        this.esperandoRespuesta = true;
        this.selector.habilitar();
    }

    crearPlanta(cuidado) {
        this.planta = new ObjetivoMantenimiento(this, {
            x: this.ancho * 0.5,
            y: this.alto * 0.60,
            texture: cuidado.textura,
            texturaResuelta: cuidado.texturaResuelta,
            displayWidth: this.ancho * 0.15,
            depth: 20
        });

        // En este nivel se responde con la herramienta, no tocando la planta.
        this.planta.deshabilitar();

        this.planta.setAlpha(0);

        this.tweens.add({
            targets: this.planta,
            alpha: 1,
            duration: 260
        });
    }

    crearMalezaAcompanante() {
        this.maleza = this.add.image(
            this.ancho * 0.575,
            this.alto * 0.605,
            "MalezaFlor"
        );

        this.maleza
            .setOrigin(0.5, 0.9)
            .setScale((this.ancho * 0.075) / this.maleza.width)
            .setDepth(21);
    }

    elegirHerramienta(clave) {
        if (this.estado !== "jugando" || !this.esperandoRespuesta) return;

        if (!esCuidadoCorrecto(this.problemaActual, clave)) {
            this.selector.destacarError(clave);
            this.registrarError();
            return;
        }

        this.esperandoRespuesta = false;
        this.selector.deshabilitar();

        this.aplicarHerramienta(clave);
        this.registrarAcierto();

        // El avance de la ronda se apoya en el reloj de la escena, nunca en el
        // final de una animación: así una pausa lo detiene y ningún tween
        // interrumpido puede dejar el nivel atascado.
        this.time.delayedCall(220, () => this.resolverPlanta());
        this.time.delayedCall(1100, () => this.terminarRonda());
    }

    aplicarHerramienta(clave) {
        const origen = this.selector.obtenerPosicion(clave);

        animarHerramienta(this, {
            texture: obtenerTexturaHerramienta(clave),
            desdeX: origen?.x ?? this.ancho * 0.5,
            desdeY: origen?.y ?? this.alto * 0.85,
            hastaX: this.planta.x,
            hastaY: this.planta.y - this.planta.displayHeight * 0.55,
            displayHeight: this.alto * 0.11
        });
    }

    resolverPlanta() {
        if (!this.planta) return;

        if (this.maleza) {
            this.tweens.add({
                targets: this.maleza,
                scale: 0,
                angle: 180,
                duration: 220,
                onComplete: () => {
                    this.maleza?.destroy();
                    this.maleza = null;
                }
            });
        }

        this.planta.resolver();
    }

    terminarRonda() {
        if (this.estado !== "jugando") return;

        this.maleza?.destroy();
        this.maleza = null;

        this.planta?.destroy();
        this.planta = null;

        this.prepararRonda();
    }

    habilitarMecanica() {
        if (this.esperandoRespuesta) this.selector.habilitar();
    }

    deshabilitarMecanica() {
        this.selector.deshabilitar();
    }

}

function obtenerTexturaHerramienta(clave) {
    return HERRAMIENTAS.find(herramienta => herramienta.clave === clave)
        ?.textura;
}
