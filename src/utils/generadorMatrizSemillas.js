export const TIPOS_SEMILLA = Object.freeze({
    BUENA: "buena",
    DANADA: "danada",
    BOMBA: "bomba"
});

export function obtenerVecinos(matriz, fila, columna, diagonales = true) {
    const direcciones = diagonales
        ? [-1, 0, 1].flatMap(df => [-1, 0, 1].map(dc => [df, dc]))
            .filter(([df, dc]) => df !== 0 || dc !== 0)
        : [[-1, 0], [1, 0], [0, -1], [0, 1]];

    return direcciones.map(([df, dc]) => ({
        fila: fila + df,
        columna: columna + dc
    })).filter(({ fila: f, columna: c }) => (
        f >= 0 && c >= 0 && f < matriz.length && c < matriz[0].length
    ));
}

export function sonAdyacentes(a, b, diagonales = true) {
    const df = Math.abs(a.fila - b.fila);
    const dc = Math.abs(a.columna - b.columna);
    return df <= 1 && dc <= 1 && (df + dc > 0) && (diagonales || df + dc === 1);
}

export function buscarComponentes(matriz, diagonales = true) {
    const visitadas = new Set();
    const componentes = [];

    for (let fila = 0; fila < matriz.length; fila++) {
        for (let columna = 0; columna < matriz[0].length; columna++) {
            const tipo = matriz[fila][columna];
            const claveInicial = `${fila}:${columna}`;
            if (tipo === TIPOS_SEMILLA.BOMBA || tipo == null || visitadas.has(claveInicial)) continue;

            const componente = [];
            const pendientes = [{ fila, columna }];
            visitadas.add(claveInicial);

            while (pendientes.length) {
                const actual = pendientes.pop();
                componente.push(actual);
                obtenerVecinos(matriz, actual.fila, actual.columna, diagonales)
                    .forEach(vecina => {
                        const clave = `${vecina.fila}:${vecina.columna}`;
                        if (!visitadas.has(clave) && matriz[vecina.fila][vecina.columna] === tipo) {
                            visitadas.add(clave);
                            pendientes.push(vecina);
                        }
                    });
            }

            componentes.push({ tipo, celdas: componente });
        }
    }

    return componentes;
}

export function validarMatrizSemillas(matriz, config = {}) {
    const minimo = config.minimoTrayectoria ?? 3;
    const diagonales = config.permiteDiagonales ?? true;
    const bombasEsperadas = config.cantidadBombas;
    const bombas = [];

    if (!Array.isArray(matriz) || !matriz.length || !matriz[0]?.length) return false;
    if (!matriz.every(fila => fila.length === matriz[0].length)) return false;

    matriz.forEach((fila, f) => fila.forEach((tipo, c) => {
        if (tipo === TIPOS_SEMILLA.BOMBA) bombas.push({ fila: f, columna: c });
    }));

    if (bombasEsperadas != null && bombas.length !== bombasEsperadas) return false;
    for (let i = 0; i < bombas.length; i++) {
        for (let j = i + 1; j < bombas.length; j++) {
            if (sonAdyacentes(bombas[i], bombas[j], true)) return false;
        }
    }

    const componentes = buscarComponentes(matriz, diagonales);
    if (componentes.some(componente => componente.celdas.length < minimo)) return false;

    const requiereBuenas = config.requiereBuenas ?? true;
    const requiereDanadas = config.requiereDanadas ?? true;
    if (requiereBuenas && !componentes.some(c => c.tipo === TIPOS_SEMILLA.BUENA && c.celdas.length >= minimo)) return false;
    if (requiereDanadas && !componentes.some(c => c.tipo === TIPOS_SEMILLA.DANADA && c.celdas.length >= minimo)) return false;
    return true;
}

function mezclar(elementos, aleatorio) {
    for (let i = elementos.length - 1; i > 0; i--) {
        const j = Math.floor(aleatorio() * (i + 1));
        [elementos[i], elementos[j]] = [elementos[j], elementos[i]];
    }
    return elementos;
}

function colocarBombas(matriz, cantidad, aleatorio) {
    const posiciones = mezclar(
        matriz.flatMap((fila, f) => fila.map((_, c) => ({ fila: f, columna: c }))),
        aleatorio
    );
    const elegidas = [];

    for (const posicion of posiciones) {
        if (elegidas.every(otra => !sonAdyacentes(posicion, otra, true))) {
            elegidas.push(posicion);
            if (elegidas.length === cantidad) break;
        }
    }

    if (elegidas.length !== cantidad) return false;
    elegidas.forEach(({ fila, columna }) => {
        matriz[fila][columna] = TIPOS_SEMILLA.BOMBA;
    });
    return true;
}

function crearIntento(config, aleatorio) {
    const filas = config.filas;
    const columnas = config.columnas;
    const probabilidadBuena = config.probabilidadBuena ?? 0.5;
    const matriz = Array.from({ length: filas }, () => Array.from(
        { length: columnas },
        () => aleatorio() < probabilidadBuena
            ? TIPOS_SEMILLA.BUENA
            : TIPOS_SEMILLA.DANADA
    ));

    return colocarBombas(matriz, config.cantidadBombas, aleatorio) ? matriz : null;
}

function crearPatronGarantizado(config) {
    const matriz = Array.from({ length: config.filas }, (_, fila) =>
        Array.from({ length: config.columnas }, (_, columna) =>
            (Math.floor(fila / 2) + Math.floor(columna / 3)) % 2 === 0
                ? TIPOS_SEMILLA.BUENA
                : TIPOS_SEMILLA.DANADA
        )
    );

    const candidatas = [];
    for (let fila = 0; fila < config.filas; fila += 2) {
        for (let columna = 0; columna < config.columnas; columna += 2) {
            candidatas.push({ fila, columna });
        }
    }

    candidatas.slice(0, config.cantidadBombas).forEach(({ fila, columna }) => {
        matriz[fila][columna] = TIPOS_SEMILLA.BOMBA;
    });
    return matriz;
}

export function generarMatrizSemillas(config, aleatorio = Math.random) {
    const normalizada = {
        filas: Math.max(3, Math.floor(config.filas ?? 7)),
        columnas: Math.max(3, Math.floor(config.columnas ?? 7)),
        cantidadBombas: Math.max(0, Math.floor(config.cantidadBombas ?? 2)),
        minimoTrayectoria: Math.max(2, Math.floor(config.minimoTrayectoria ?? 3)),
        permiteDiagonales: config.permiteDiagonales ?? true,
        requiereBuenas: config.requiereBuenas ?? true,
        requiereDanadas: config.requiereDanadas ?? true,
        probabilidadBuena: config.probabilidadBuena ?? 0.5
    };

    for (let intento = 0; intento < 100; intento++) {
        const matriz = crearIntento(normalizada, aleatorio);
        if (matriz && validarMatrizSemillas(matriz, normalizada)) return matriz;
    }

    const patron = crearPatronGarantizado(normalizada);
    if (validarMatrizSemillas(patron, normalizada)) return patron;

    // Para configuraciones poco habituales, ampliar la búsqueda evita devolver
    // silenciosamente un tablero sin solución.
    for (let intento = 0; intento < 900; intento++) {
        const matriz = crearIntento(normalizada, aleatorio);
        if (matriz && validarMatrizSemillas(matriz, normalizada)) return matriz;
    }
    throw new Error("No se pudo generar una matriz de semillas solucionable.");
}

