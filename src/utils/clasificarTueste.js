// Medido sobre BarraTueste.webp: la franja verde ocupa de 0.340 a 0.658 del
// ancho de la imagen. Si el asset se rehace hay que volver a medirla con
// design/scripts/medirBarra.mjs.
export const ZONA_VERDE = Object.freeze({ inicio: 0.340, fin: 0.658 });

export const TEMPERATURA_QUEMADO = 0.94;

/**
 * Traduce la temperatura del tostador (0 a 1) al estado del tueste.
 *
 * Se mantiene aparte de la escena porque es la regla que decide si una tanda
 * avanza, se estanca o se pierde, y conviene poder probarla sin levantar Phaser.
 */
export default function clasificarTueste(temperatura) {
    if (!Number.isFinite(temperatura)) return "frio";

    if (temperatura >= TEMPERATURA_QUEMADO) return "quemado";
    if (temperatura < ZONA_VERDE.inicio) return "frio";
    if (temperatura > ZONA_VERDE.fin) return "caliente";

    return "punto";
}
