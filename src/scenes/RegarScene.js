import EscenaBuscarObjetivos from "./EscenaBuscarObjetivos";
import ProgressManager from "../managers/ProgressManager";

const CONFIGURACION_NIVEL = Object.freeze({

    fondo: "FondoFincaCacao",

    tutorial: "Las plantas caídas tienen sed. Tócalas para regarlas. Las que ya están verdes no necesitan más agua.",

    tituloExito: "¡Bien regado!",

    voces: {
        instruccion: "vozRegarInstruccion",
        ayuda: "vozRegarAyuda",
        completado: "vozRegarCompletado",
        tiempoAgotado: "vozRegarTiempoAgotado"
    },

    duracionSegundos: 60,
    vidasMaximas: 3,

    totalObjetivos: 5,
    totalDistractores: 3,
    iconoContador: "IconoRegadera",
    tamanoObjetivo: 0.085,

    herramienta: {
        clave: "regadera",
        textura: "IconoRegadera",
        etiqueta: "Regadera"
    },

    objetivos: [
        { textura: "PlantaMarchita", texturaResuelta: "PlantaSana" }
    ],

    distractores: [
        { textura: "PlantaSana" }
    ],

    posiciones: [
        { x: 0.16, y: 0.72 },
        { x: 0.36, y: 0.72 },
        { x: 0.56, y: 0.72 },
        { x: 0.76, y: 0.72 },
        { x: 0.22, y: 0.92 },
        { x: 0.39, y: 0.92 },
        { x: 0.56, y: 0.92 },
        { x: 0.73, y: 0.92 }
    ],

    guardarProgreso: estrellas => ProgressManager.completeRegar(estrellas)

});

export default class RegarScene extends EscenaBuscarObjetivos {

    constructor() {
        super("RegarScene", CONFIGURACION_NIVEL);
    }

}
