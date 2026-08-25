const DISTANCIA_EPSILON = 1e-9;

/**
 * Comprueba si un segmento toca una elipse usando coordenadas normalizadas.
 * Es una función pura para poder verificar la tolerancia táctil sin Phaser.
 */
export default function intersectaSegmentoElipse(
    inicio,
    fin,
    elipse
) {
    const radioX = Math.max(DISTANCIA_EPSILON, elipse.radioX);
    const radioY = Math.max(DISTANCIA_EPSILON, elipse.radioY);
    const ax = (inicio.x - elipse.x) / radioX;
    const ay = (inicio.y - elipse.y) / radioY;
    const bx = (fin.x - elipse.x) / radioX;
    const by = (fin.y - elipse.y) / radioY;
    const dx = bx - ax;
    const dy = by - ay;
    const longitudCuadrada = dx * dx + dy * dy;

    if (longitudCuadrada <= DISTANCIA_EPSILON) {
        return ax * ax + ay * ay <= 1;
    }

    const t = Math.max(
        0,
        Math.min(1, -(ax * dx + ay * dy) / longitudCuadrada)
    );
    const cercanoX = ax + dx * t;
    const cercanoY = ay + dy * t;

    return cercanoX * cercanoX + cercanoY * cercanoY <= 1;
}
