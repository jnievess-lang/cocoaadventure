import test from "node:test";
import assert from "node:assert/strict";
import { calcularEtapaLlenadoCanasta } from "../src/utils/calcularEtapaLlenadoCanasta.js";

test("divide un objetivo de 30 en tres etapas", () => {
    assert.equal(calcularEtapaLlenadoCanasta(0, 30), 0);
    assert.equal(calcularEtapaLlenadoCanasta(9, 30), 0);
    assert.equal(calcularEtapaLlenadoCanasta(10, 30), 1);
    assert.equal(calcularEtapaLlenadoCanasta(20, 30), 2);
    assert.equal(calcularEtapaLlenadoCanasta(30, 30), 3);
});

test("se adapta a objetivos configurables sin umbrales fijos", () => {
    assert.equal(calcularEtapaLlenadoCanasta(8, 24), 1);
    assert.equal(calcularEtapaLlenadoCanasta(16, 24), 2);
    assert.equal(calcularEtapaLlenadoCanasta(24, 24), 3);

    assert.equal(calcularEtapaLlenadoCanasta(8, 25), 0);
    assert.equal(calcularEtapaLlenadoCanasta(9, 25), 1);
    assert.equal(calcularEtapaLlenadoCanasta(17, 25), 2);
    assert.equal(calcularEtapaLlenadoCanasta(25, 25), 3);
});

test("limita valores inválidos y permite otra cantidad de etapas", () => {
    assert.equal(calcularEtapaLlenadoCanasta(-4, 30), 0);
    assert.equal(calcularEtapaLlenadoCanasta(80, 30), 3);
    assert.equal(calcularEtapaLlenadoCanasta(5, 0), 0);
    assert.equal(calcularEtapaLlenadoCanasta(Number.NaN, 30), 0);
    assert.equal(calcularEtapaLlenadoCanasta(25, 100, 4), 1);
});
