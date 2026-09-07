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
 *
 * Los enunciados describen lo que se ve, nunca lo que hay que hacer: si el texto
 * dijera «tiene sed», elegir la regadera sería leer, no observar. Cada problema
 * trae varios para que repetirlo en una partida no se sienta igual.
 */
const CUIDADOS = Object.freeze({

    [PLANTA_SEDIENTA]: Object.freeze({
        herramienta: HERRAMIENTA_REGADERA,
        textura: "PlantaMarchita",
        texturaResuelta: "PlantaSana",
        enunciados: Object.freeze([
            "Sus hojas están caídas y la tierra se ve agrietada.",
            "La planta se dobla hacia el suelo y no ha llovido en días.",
            "Está mustia y su tierra quedó dura y seca."
        ])
    }),

    [PLANTA_CON_MALEZA]: Object.freeze({
        herramienta: HERRAMIENTA_GUANTES,
        textura: "PlantaSana",
        texturaResuelta: "PlantaSana",
        enunciados: Object.freeze([
            "Le creció otra planta muy pegada al lado.",
            "Unas hierbas le están robando el espacio.",
            "Algo que no es cacao brotó junto a su tallo."
        ])
    }),

    [PLANTA_CON_PLAGA]: Object.freeze({
        herramienta: HERRAMIENTA_LUPA,
        textura: "PlantaPlagas",
        texturaResuelta: "PlantaSana",
        enunciados: Object.freeze([
            "Sus hojas tienen agujeritos mordisqueados.",
            "Se ven puntitos verdes moviéndose entre sus hojas.",
            "Algo muy pequeño se está comiendo sus hojas."
        ])
    }),

    [PLANTA_CON_HONGOS]: Object.freeze({
        herramienta: HERRAMIENTA_FUNGICIDA,
        textura: "PlantaHongos",
        texturaResuelta: "PlantaSana",
        enunciados: Object.freeze([
            "Sus hojas tienen manchas blancas y peludas.",
            "Le salió una pelusa gris que se va extendiendo.",
            "Tiene parches algodonosos sobre las hojas."
        ])
    })

});

export const PROBLEMAS_DE_PLANTA = Object.freeze(Object.keys(CUIDADOS));

export function obtenerCuidado(problema) {
    return CUIDADOS[problema] ?? null;
}

export function herramientaCorrecta(problema) {
    return CUIDADOS[problema]?.herramienta ?? null;
}

/** Elige un elemento de la lista con el generador que se le pase. */
function elegir(lista, aleatorio) {
    if (!lista.length) return null;

    const indice = Math.floor(aleatorio() * lista.length);

    // Un generador que devuelva exactamente 1 se saldría del arreglo.
    return lista[Math.min(lista.length - 1, Math.max(0, indice))];
}

export function obtenerEnunciado(problema, aleatorio = Math.random) {
    return elegir(CUIDADOS[problema]?.enunciados ?? [], aleatorio) ?? "";
}

/**
 * Arma la secuencia de rondas del nivel “Cuidado correcto”.
 *
 * Reparte por bolsas: se agota una vuelta completa de problemas antes de repetir
 * ninguno, así que con cuatro rondas o más salen todos. Además evita que el
 * mismo problema caiga dos veces seguidas, que es lo que delataba la respuesta
 * sin mirar la planta.
 *
 * `aleatorio` se recibe por parámetro para poder fijarlo en las pruebas.
 */
export function generarRondas(total, aleatorio = Math.random) {
    const cantidad = Math.max(1, Math.floor(total));
    const rondas = [];
    let bolsa = [];

    while (rondas.length < cantidad) {
        if (!bolsa.length) bolsa = PROBLEMAS_DE_PLANTA.slice();

        const anterior = rondas[rondas.length - 1]?.problema ?? null;
        const alternativas = bolsa.filter(problema => problema !== anterior);
        const elegido = elegir(alternativas.length ? alternativas : bolsa, aleatorio);

        bolsa.splice(bolsa.indexOf(elegido), 1);

        rondas.push({
            problema: elegido,
            enunciado: obtenerEnunciado(elegido, aleatorio)
        });
    }

    return rondas;
}

export default function esCuidadoCorrecto(problema, herramienta) {
    const cuidado = CUIDADOS[problema];

    if (!cuidado) return false;

    return cuidado.herramienta === herramienta;
}
