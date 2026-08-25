export const TIPOS_MAZORCA = Object.freeze({
    AMARILLA: "amarilla",
    NARANJA: "naranja",
    VERDE: "verde",
    DANADA: "danada"
});

export function esMazorcaMadura(tipo) {
    return tipo === TIPOS_MAZORCA.AMARILLA ||
        tipo === TIPOS_MAZORCA.NARANJA;
}

export function crearBolsaMazorcas(aleatorio = Math.random) {
    const maduras = [
        aleatorio() < 0.5 ? TIPOS_MAZORCA.AMARILLA : TIPOS_MAZORCA.NARANJA,
        aleatorio() < 0.5 ? TIPOS_MAZORCA.AMARILLA : TIPOS_MAZORCA.NARANJA,
        aleatorio() < 0.5 ? TIPOS_MAZORCA.AMARILLA : TIPOS_MAZORCA.NARANJA
    ];
    const bolsa = [
        ...maduras,
        TIPOS_MAZORCA.VERDE,
        TIPOS_MAZORCA.DANADA
    ];

    for (let indice = bolsa.length - 1; indice > 0; indice--) {
        const destino = Math.floor(aleatorio() * (indice + 1));
        [bolsa[indice], bolsa[destino]] = [bolsa[destino], bolsa[indice]];
    }

    return bolsa;
}

export function extraerTipoMazorcas(
    bolsa,
    incorrectasConsecutivas = 0,
    aleatorio = Math.random
) {
    if (bolsa.length === 0) bolsa.push(...crearBolsaMazorcas(aleatorio));

    let indice = bolsa.length - 1;

    if (incorrectasConsecutivas >= 2) {
        const indiceMadura = bolsa.findIndex(esMazorcaMadura);
        if (indiceMadura >= 0) indice = indiceMadura;
    }

    const [tipo] = bolsa.splice(indice, 1);
    return tipo;
}
