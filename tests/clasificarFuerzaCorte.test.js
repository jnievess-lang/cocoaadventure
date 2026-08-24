import test from "node:test";
import assert from "node:assert/strict";
import clasificarFuerzaCorte from "../src/utils/clasificarFuerzaCorte.js";

const zona = { minimo: 0.25, maximo: 0.80 };

test("clasifica valores debajo de la zona como fuerza baja", () => {
    assert.equal(clasificarFuerzaCorte(0.24, zona), "baja");
    assert.equal(clasificarFuerzaCorte(-1, zona), "baja");
});

test("acepta ambos límites y el interior de la zona segura", () => {
    assert.equal(clasificarFuerzaCorte(0.25, zona), "ideal");
    assert.equal(clasificarFuerzaCorte(0.50, zona), "ideal");
    assert.equal(clasificarFuerzaCorte(0.80, zona), "ideal");
});

test("clasifica valores superiores como fuerza alta", () => {
    assert.equal(clasificarFuerzaCorte(0.81, zona), "alta");
    assert.equal(clasificarFuerzaCorte(2, zona), "alta");
});
