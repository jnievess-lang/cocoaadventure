import EscenaBuscarObjetivos from "./EscenaBuscarObjetivos";
import ProgressManager from "../managers/ProgressManager";

const CONFIGURACION_NIVEL = Object.freeze({

    fondo: "FondoFincaCacao",

    tutorial: "La maleza le quita el alimento al cacao. Toca solo las hierbas y el pasto seco. ¡Cuidado! Las plantitas de cacao se quedan.",

    tituloExito: "¡Terreno limpio!",

    voces: {
        instruccion: "vozMalezasInstruccion",
        ayuda: "vozMalezasAyuda",
        completado: "vozMalezasCompletado",
        tiempoAgotado: "vozMalezasTiempoAgotado"
    },

    duracionSegundos: 60,
    vidasMaximas: 3,

    totalObjetivos: 6,
    totalDistractores: 3,
    iconoContador: "IconoGuantes",
    tamanoObjetivo: 0.07,

    herramienta: {
        clave: "guantes",
        textura: "IconoGuantes",
        etiqueta: "Guantes"
    },

    objetivos: [
        { textura: "MalezaFlor" },
        { textura: "PastoSeco" }
    ],

    distractores: [
        { textura: "PlantaSana", tamano: 0.085 }
    ],

    posiciones: [
        { x: 0.17, y: 0.70 },
        { x: 0.35, y: 0.68 },
        { x: 0.53, y: 0.71 },
        { x: 0.71, y: 0.69 },
        { x: 0.26, y: 0.81 },
        { x: 0.45, y: 0.83 },
        { x: 0.64, y: 0.80 },
        { x: 0.21, y: 0.93 },
        { x: 0.40, y: 0.94 },
        { x: 0.59, y: 0.92 },
        { x: 0.76, y: 0.90 }
    ],

    guardarProgreso: estrellas => ProgressManager.completeMalezas(estrellas)

});

export default class MalezasScene extends EscenaBuscarObjetivos {

    constructor() {
        super("MalezasScene", CONFIGURACION_NIVEL);
    }

}
