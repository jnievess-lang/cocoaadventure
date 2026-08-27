import EscenaBuscarObjetivos from "./EscenaBuscarObjetivos";
import ProgressManager from "../managers/ProgressManager";
import { arrancarConGuante } from "../utils/efectosMantenimiento";

const CONFIGURACION_NIVEL = Object.freeze({

    fondo: "FondoFincaCacao",

    tutorial: "La maleza le quita el alimento al cacao. Arrastra el guante hasta las hierbas y el pasto seco, y suéltalo encima para arrancarlos. ¡Cuidado! Las plantitas de cacao se quedan.",

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
    tamanoObjetivo: 0.075,
    tamanoHerramienta: 0.13,

    // El guante se lleva la maleza tirando de ella, así que la salida del
    // objetivo la anima el efecto y no el propio objetivo.
    resolucionExterna: true,

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

    esperaAlUsar: 450,

    efecto: (escena, objetivo) => arrancarConGuante(escena, objetivo, {
        depth: objetivo.depth + 20,
        tamano: 0.15
    }),

    guardarProgreso: estrellas => ProgressManager.completeMalezas(estrellas)

});

export default class MalezasScene extends EscenaBuscarObjetivos {

    constructor() {
        super("MalezasScene", CONFIGURACION_NIVEL);
    }

}
