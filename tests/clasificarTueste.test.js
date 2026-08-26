import test from "node:test";
import assert from "node:assert/strict";
import clasificarTueste, {
    ZONA_VERDE,
    TEMPERATURA_QUEMADO
} from "../src/utils/clasificarTueste.js";

test("por debajo de la franja el cacao todavía está frío", () => {
    assert.equal(clasificarTueste(0), "frio");
    assert.equal(clasificarTueste(ZONA_VERDE.inicio - 0.001), "frio");
});

test("ambos límites de la franja verde cuentan como punto de tueste", () => {
    assert.equal(clasificarTueste(ZONA_VERDE.inicio), "punto");
    assert.equal(clasificarTueste(ZONA_VERDE.fin), "punto");
    assert.equal(clasificarTueste(0.5), "punto");
});

test("pasarse de la franja calienta, pero todavía no quema", () => {
    assert.equal(clasificarTueste(ZONA_VERDE.fin + 0.001), "caliente");
    assert.equal(clasificarTueste(TEMPERATURA_QUEMADO - 0.001), "caliente");
});

test("desde el umbral de quemado la tanda se pierde", () => {
    assert.equal(clasificarTueste(TEMPERATURA_QUEMADO), "quemado");
    assert.equal(clasificarTueste(1), "quemado");
});

test("un valor inválido no rompe la clasificación", () => {
    assert.equal(clasificarTueste(undefined), "frio");
    assert.equal(clasificarTueste(NaN), "frio");
});

test("la franja verde es la medida en el asset, no una inventada", () => {
    assert.ok(ZONA_VERDE.inicio < ZONA_VERDE.fin);
    assert.ok(ZONA_VERDE.fin < TEMPERATURA_QUEMADO);
});
