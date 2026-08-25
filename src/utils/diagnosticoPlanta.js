export const PLANTA_SEDIENTA = "sedienta";
export const PLANTA_CON_MALEZA = "conMaleza";
export const PLANTA_CON_PLAGA = "conPlaga";
export const PLANTA_CON_HONGOS = "conHongos";

export const HERRAMIENTA_REGADERA = "regadera";
export const HERRAMIENTA_GUANTES = "guantes";
export const HERRAMIENTA_LUPA = "lupa";
export const HERRAMIENTA_FUNGICIDA = "fungicida";

/**
 * Cada problema de la planta se resuelve con una sola herramienta correcta.
 * La escena usa este mapa para armar las rondas y para validar la respuesta,
 * de modo que la regla viva en un único lugar.
 */
const CUIDADOS = Object.freeze({

    [PLANTA_SEDIENTA]: Object.freeze({
        herramienta: HERRAMIENTA_REGADERA,
        textura: "PlantaMarchita",
        texturaResuelta: "PlantaSana",
        enunciado: "Esta planta tiene sed."
    }),

    [PLANTA_CON_MALEZA]: Object.freeze({
        herramienta: HERRAMIENTA_GUANTES,
        textura: "PlantaSana",
        texturaResuelta: "PlantaSana",
        enunciado: "La maleza le está quitando el alimento."
    }),

    [PLANTA_CON_PLAGA]: Object.freeze({
        herramienta: HERRAMIENTA_LUPA,
        textura: "PlantaPlagas",
        texturaResuelta: "PlantaSana",
        enunciado: "Unos insectos se comen sus hojas."
    }),

    [PLANTA_CON_HONGOS]: Object.freeze({
        herramienta: HERRAMIENTA_FUNGICIDA,
        textura: "PlantaHongos",
        texturaResuelta: "PlantaSana",
        enunciado: "Sus hojas tienen manchas de hongos."
    })

});

export const PROBLEMAS_DE_PLANTA = Object.freeze(Object.keys(CUIDADOS));

export function obtenerCuidado(problema) {
    return CUIDADOS[problema] ?? null;
}

export function herramientaCorrecta(problema) {
    return CUIDADOS[problema]?.herramienta ?? null;
}

export default function esCuidadoCorrecto(problema, herramienta) {
    const cuidado = CUIDADOS[problema];

    if (!cuidado) return false;

    return cuidado.herramienta === herramienta;
}
