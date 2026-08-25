import EscenaBuscarObjetivos from "./EscenaBuscarObjetivos";
import ProgressManager from "../managers/ProgressManager";

const CONFIGURACION_NIVEL = Object.freeze({

    fondo: "FondoFincaCacao",

    // El nivel ocurre sobre el mismo árbol de “Seleccionar maduras”, así que
    // las posiciones se miden dentro de la ilustración del árbol.
    arbol: "ArbolCacaoSeleccion",

    tutorial: "Revisa el árbol con la lupa. Toca los insectos, las hojas manchadas y las mazorcas enfermas. Las mazorcas sanas se quedan en el árbol.",

    tituloExito: "¡Árbol revisado!",

    voces: {
        instruccion: "vozPlagasInstruccion",
        ayuda: "vozPlagasAyuda",
        completado: "vozPlagasCompletado",
        tiempoAgotado: "vozPlagasTiempoAgotado"
    },

    duracionSegundos: 70,
    vidasMaximas: 3,

    totalObjetivos: 5,
    totalDistractores: 4,
    iconoContador: "IconoLupa",
    tamanoObjetivo: 0.068,

    herramienta: {
        clave: "lupa",
        textura: "IconoLupa",
        etiqueta: "Lupa"
    },

    objetivos: [
        { textura: "Pulgon" },
        { textura: "Gusano" },
        { textura: "HojaManchada" },
        { textura: "EscobaBruja" },
        { textura: "MazorcaDanada" }
    ],

    distractores: [
        { textura: "MazorcaMaduraAmarilla" },
        { textura: "MazorcaMaduraNaranja" }
    ],

    posiciones: [
        { x: 0.22, y: 0.38 },
        { x: 0.38, y: 0.27 },
        { x: 0.55, y: 0.33 },
        { x: 0.72, y: 0.29 },
        { x: 0.82, y: 0.45 },
        { x: 0.27, y: 0.58 },
        { x: 0.45, y: 0.52 },
        { x: 0.62, y: 0.60 },
        { x: 0.77, y: 0.66 }
    ],

    guardarProgreso: estrellas => ProgressManager.completePlagas(estrellas)

});

export default class PlagasScene extends EscenaBuscarObjetivos {

    constructor() {
        super("PlagasScene", CONFIGURACION_NIVEL);
    }

}
