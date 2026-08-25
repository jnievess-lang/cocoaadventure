import test from "node:test";
import assert from "node:assert/strict";
import {
    crearBolsaMazorcas,
    esMazorcaMadura,
    extraerTipoMazorcas,
    TIPOS_MAZORCA
} from "../src/utils/bolsaMazorcas.js";

test("cada bolsa contiene tres maduras, una verde y una dañada", () => {
    const bolsa = crearBolsaMazorcas(() => 0.25);

    assert.equal(bolsa.filter(esMazorcaMadura).length, 3);
    assert.equal(bolsa.filter(tipo => tipo === TIPOS_MAZORCA.VERDE).length, 1);
    assert.equal(bolsa.filter(tipo => tipo === TIPOS_MAZORCA.DANADA).length, 1);
});

test("fuerza una madura después de dos incorrectas consecutivas", () => {
    const bolsa = [
        TIPOS_MAZORCA.VERDE,
        TIPOS_MAZORCA.AMARILLA,
        TIPOS_MAZORCA.DANADA
    ];

    const tipo = extraerTipoMazorcas(bolsa, 2, () => 0.5);
    assert.equal(esMazorcaMadura(tipo), true);
});
