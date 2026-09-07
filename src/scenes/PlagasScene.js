import Phaser from "phaser";
import EscenaBuscarObjetivos from "./EscenaBuscarObjetivos";
import ProgressManager from "../managers/ProgressManager";
import HerramientaArrastrable from "../ui/HerramientaArrastrable";
import LupaAumento from "../ui/LupaAumento";

/**
 * Centro y radio del cristal dentro del dibujo de la lupa, medidos sobre el
 * propio archivo. Sin esto el aumento se centraría en el sprite entero, mango
 * incluido, y la imagen ampliada no coincidiría con el cristal.
 *
 * **Van atados a `icons/IconoLupa.webp`: si se rehace el dibujo hay que volver a
 * medirlos.** Los de aquí salen de contar píxeles sobre la versión de 768:
 * centro del azul en (0.637, 0.354), cristal de 0.264 y aro de 0.318 del ancho.
 * Sobre esas medidas se aplican dos márgenes deliberados:
 *
 * - `radio` es el 92 % del cristal real, para que el círculo ampliado quede
 *   dentro del vidrio y no se derrame sobre el marco dorado.
 * - `radioAro` es el 106 % del aro real, para que el anillo de búsqueda se
 *   dibuje encima del oro y no flotando por dentro.
 */
const CRISTAL_LUPA = Object.freeze({
    x: 0.637,
    y: 0.354,
    radio: 0.244,
    // Radio del aro dorado, donde se dibuja el círculo de búsqueda.
    radioAro: 0.336
});

/**
 * Qué parte del cristal cuenta como «centrado» sobre una plaga.
 *
 * Va en fracción del radio, así que el cristal más grande del dibujo nuevo
 * arrastra consigo la zona de acierto: es un 15 % más generosa que con la lupa
 * pequeña. Es el efecto buscado —el nivel era difícil de mirar—, pero si queda
 * demasiado fácil, bajarlo a 0.48 devuelve exactamente la precisión de antes.
 */
const ALCANCE_CRISTAL = 0.55;

const CONFIGURACION_NIVEL = Object.freeze({

    fondo: "FondoFincaCacao",
    arbol: "ArbolCacaoSeleccion",

    tutorial: "Arrastra la lupa por el árbol. Cuando encuentres algo enfermo, mantén la lupa encima hasta que el círculo se complete.",

    tituloExito: "¡Árbol revisado!",

    voces: {
        instruccion: "vozPlagasInstruccion",
        ayuda: "vozPlagasAyuda",
        completado: "vozPlagasCompletado",
        tiempoAgotado: "vozPlagasTiempoAgotado"
    },

    duracionSegundos: 75,
    vidasMaximas: 3,

    totalObjetivos: 5,
    totalDistractores: 4,
    iconoContador: "IconoLupa",

    // Plagas pequeñas: hay que buscarlas de verdad con la lupa.
    tamanoObjetivo: 0.038,

    herramienta: {
        clave: "lupa",
        textura: "IconoLupa",
        etiqueta: "Lupa"
    },

    objetivos: [
        { textura: "Pulgon" },
        { textura: "Gusano" },
        { textura: "HojaManchada" },
        { textura: "EscobaBruja", tamano: 0.055 },
        { textura: "MazorcaDanada", tamano: 0.062 }
    ],

    distractores: [
        { textura: "MazorcaMaduraAmarilla", tamano: 0.062 },
        { textura: "MazorcaMaduraNaranja", tamano: 0.062 }
    ],

    // Puntos de agarre reales del árbol, los mismos que usa “Seleccionar
    // maduras”. Antes eran una cuadrícula inventada y las mazorcas quedaban
    // montadas fuera de las ramas.
    posiciones: [
        { x: 0.23, y: 0.39 },
        { x: 0.272, y: 0.30 },
        { x: 0.33, y: 0.58 },
        { x: 0.404, y: 0.332 },
        { x: 0.472, y: 0.405 },
        { x: 0.55, y: 0.46 },
        { x: 0.559, y: 0.245 },
        { x: 0.65, y: 0.37 },
        { x: 0.75, y: 0.47 },
        { x: 0.45, y: 0.67 },
        { x: 0.55, y: 0.67 }
    ],

    guardarProgreso: estrellas => ProgressManager.completePlagas(estrellas)

});

export default class PlagasScene extends EscenaBuscarObjetivos {

    constructor() {
        super("PlagasScene", CONFIGURACION_NIVEL);
    }

    /**
     * Aquí no se suelta la herramienta sobre el objetivo: se pasea la lupa y se
     * mantiene sobre lo que parece enfermo hasta completar el círculo.
     */
    crearInteraccion() {
        const base = this.baseHerramienta;

        // El dibujo nuevo es casi todo cristal, así que a 0.34 la lupa comía
        // demasiada pantalla en reposo. A 0.30 el conjunto es más discreto y el
        // círculo de aumento sigue siendo mayor que el de la lupa antigua.
        const altoLupa = this.alto * 0.30;

        this.herramienta = new HerramientaArrastrable(this, {
            x: base.x,
            y: base.y,
            texture: this.nivel.herramienta.textura,
            displayHeight: altoLupa,
            depth: 95,
            // La lupa no crece al agarrarla: el cristal debe seguir midiendo
            // exactamente lo mismo que el círculo de aumento.
            escalaAlArrastrar: 1,
            onTomar: () => this.lupa.mostrar(this.herramienta.x, this.herramienta.y),
            onMover: (x, y) => this.lupa.mover(x, y),
            onCancelar: () => this.lupa.ocultar(),
            onSoltar: () => {
                this.lupa.ocultar();
                return false;
            }
        });

        // El origen se coloca en el centro del cristal, medido sobre el dibujo,
        // para que la posición de la lupa y la del aumento sean la misma.
        this.herramienta.setOrigin(CRISTAL_LUPA.x, CRISTAL_LUPA.y);

        // Después de mover el origen, porque es justo ese origen descentrado el
        // que sacaba el mango fuera del lienzo cuando la lupa está en reposo.
        this.encajarHerramientaEnPantalla();

        this.lupa = new LupaAumento(this, {
            radio: this.herramienta.displayWidth * CRISTAL_LUPA.radio,
            radioAnillo: this.herramienta.displayWidth * CRISTAL_LUPA.radioAro,
            zoom: 2.1,
            duracionBusqueda: 850,
            // Por encima de la lupa incluso mientras se arrastra, que sube a
            // 105: dibujado por debajo quedaba oculto tras el propio sprite.
            depth: 120
        });

        this.crearEtiquetaHerramienta();

        // El cristal solo debe mostrar el escenario: fondo, árbol y objetivos.
        this.lupa.definirContenido([
            this.fondo,
            this.arbol,
            ...this.objetivos
        ].filter(Boolean));

        // La lupa no es un GameObject: administra una cámara y una máscara que
        // la escena no sabe recoger por su cuenta.
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.lupa?.destroy();
            this.lupa = null;
        });
    }

    update(tiempo, delta) {
        if (this.estado !== "jugando" || !this.lupa?.activa) return;

        const objetivo = this.objetivoBajoLupa();
        const completado = this.lupa.actualizar(objetivo, delta);

        if (completado && objetivo) this.confirmarHallazgo(objetivo);
    }

    /** Solo cuenta lo que está bien centrado bajo el cristal. */
    objetivoBajoLupa() {
        const alcance = this.lupa.radio * ALCANCE_CRISTAL;

        const candidatos = this.objetivos
            .filter(objetivo =>
                !objetivo.resuelto &&
                !objetivo.revisado &&
                objetivo.active &&
                objetivo.distanciaA(this.lupa.x, this.lupa.y) < alcance
            )
            .sort((a, b) =>
                a.distanciaA(this.lupa.x, this.lupa.y) -
                b.distanciaA(this.lupa.x, this.lupa.y)
            );

        return candidatos[0] ?? null;
    }

    confirmarHallazgo(objetivo) {
        if (objetivo.esObjetivo) {
            objetivo.seleccionar();
            return;
        }

        // Revisar una mazorca sana cuesta una vida, pero queda marcada como ya
        // revisada: sin esto, dejar la lupa encima restaría una vida tras otra
        // y el nivel se perdería en pocos segundos.
        objetivo.revisado = true;
        objetivo.marcarError();
        objetivo.setAlpha(0.55);
    }

    resolverObjetivo() {
        this.registrarAcierto();
    }

    deshabilitarMecanica() {
        super.deshabilitarMecanica();
        this.lupa?.ocultar();
    }

}
