/**
 * Decide qué ocurre cuando la aguja del tueste está fuera de la franja verde.
 *
 * Cobra una vida en el instante en que la aguja entra en el rojo, y no vuelve
 * a cobrar mientras siga fuera. Ese "una sola vez por salida" es la parte que
 * importa: esto se evalúa en cada fotograma, así que penalizar de forma
 * continua drenaría las tres vidas en medio segundo.
 *
 * El acumulador se reinicia al volver al punto, de modo que cada salida nueva
 * vuelve a costar. Quién decide cuándo empezar a mirar esto es la escena: la
 * aguja arranca en rojo y tiene que cruzarlo para llegar al verde, y ese primer
 * ascenso no debe castigarse.
 */
export default function evaluarDescuido(descuido, punto, segundos) {
    const previo = Number.isFinite(descuido) ? Math.max(0, descuido) : 0;
    const paso = Number.isFinite(segundos) ? Math.max(0, segundos) : 0;

    if (punto === "punto") {
        return { descuido: 0, avisar: false, penalizar: false };
    }

    const acumulado = previo + paso;

    return {
        // Se fuerza a ser estrictamente positivo para marcar "ya estaba
        // fuera". Con delta cero el acumulado seguiría en cero y el siguiente
        // fotograma volvería a cobrar la misma salida.
        descuido: Math.max(acumulado, 1e-6),
        avisar: true,
        // `previo` en cero es la señal de que la aguja acaba de cruzar a rojo.
        penalizar: previo === 0
    };
}
