import test from "node:test";
import assert from "node:assert/strict";
import {
    buscarComponentes,
    buscarTrayectoriaValida,
    generarMatrizSemillas,
    TIPOS_SEMILLA,
    validarMatrizSemillas
} from "../src/utils/generadorMatrizSemillas.js";

const CONFIG = {
    filas: 7,
    columnas: 7,
    minimoTrayectoria: 3,
    cantidadBombas: 2,
    permiteDiagonales: true
};

test("genera una matriz 7x7 soluble con dos bombas no adyacentes", () => {
    for (let intento = 0; intento < 30; intento++) {
        const matriz = generarMatrizSemillas(CONFIG);
        assert.equal(matriz.length, 7);
        assert.ok(matriz.every(fila => fila.length === 7));
        assert.equal(matriz.flat().filter(tipo => tipo === TIPOS_SEMILLA.BOMBA).length, 2);
        assert.equal(validarMatrizSemillas(matriz, CONFIG), true);
    }
});

test("cada semilla pertenece a un componente de tres o más", () => {
    const matriz = generarMatrizSemillas(CONFIG);
    const componentes = buscarComponentes(matriz, true);
    assert.ok(componentes.length >= 2);
    assert.ok(componentes.every(componente => componente.celdas.length >= 3));
    assert.ok(componentes.some(componente => componente.tipo === TIPOS_SEMILLA.BUENA));
    assert.ok(componentes.some(componente => componente.tipo === TIPOS_SEMILLA.DANADA));
});

test("respeta una configuración alternativa", () => {
    const config = { ...CONFIG, filas: 6, columnas: 5, cantidadBombas: 1 };
    const matriz = generarMatrizSemillas(config);
    assert.equal(matriz.length, 6);
    assert.equal(matriz[0].length, 5);
    assert.equal(validarMatrizSemillas(matriz, config), true);
});

test("rechaza una semilla aislada", () => {
    const matriz = [
        ["buena", "danada", "danada"],
        ["danada", "danada", "danada"],
        ["danada", "danada", "danada"]
    ];
    assert.equal(validarMatrizSemillas(matriz, {
        minimoTrayectoria: 3,
        cantidadBombas: 0,
        requiereBuenas: false,
        requiereDanadas: true
    }), false);
});

test("encuentra una trayectoria sugerida válida sin atravesar bombas ni mezclar tipos", () => {
    const matriz = [
        ["buena", "buena", "bomba"],
        ["danada", "buena", "danada"],
        ["danada", "danada", "danada"]
    ];
    const trayectoria = buscarTrayectoriaValida(matriz, {
        minimoTrayectoria: 3,
        permiteDiagonales: true,
        tiposPreferidos: [TIPOS_SEMILLA.BUENA],
        aleatorio: () => 0.5
    });

    assert.equal(trayectoria.length, 3);
    assert.ok(trayectoria.every(({ fila, columna }) => matriz[fila][columna] === TIPOS_SEMILLA.BUENA));
    for (let indice = 1; indice < trayectoria.length; indice++) {
        const anterior = trayectoria[indice - 1];
        const actual = trayectoria[indice];
        assert.ok(Math.abs(anterior.fila - actual.fila) <= 1);
        assert.ok(Math.abs(anterior.columna - actual.columna) <= 1);
    }
});
