import test from "node:test";
import assert from "node:assert/strict";
import { sonAdyacentes } from "../src/utils/generadorMatrizSemillas.js";
import { interpolarCeldas } from "../src/utils/trayectoriaSemillas.js";

test("acepta vecinos horizontales, verticales y diagonales", () => {
    const centro = { fila: 2, columna: 2 };
    assert.equal(sonAdyacentes(centro, { fila: 2, columna: 3 }, true), true);
    assert.equal(sonAdyacentes(centro, { fila: 3, columna: 2 }, true), true);
    assert.equal(sonAdyacentes(centro, { fila: 3, columna: 3 }, true), true);
});

test("rechaza saltos y puede desactivar diagonales", () => {
    const centro = { fila: 2, columna: 2 };
    assert.equal(sonAdyacentes(centro, { fila: 2, columna: 4 }, true), false);
    assert.equal(sonAdyacentes(centro, { fila: 3, columna: 3 }, false), false);
});

test("interpola suficientes puntos para un gesto móvil rápido", () => {
    const puntos = interpolarCeldas({ x: 0, y: 0 }, { x: 300, y: 0 }, 80);
    assert.ok(puntos.length >= 10);
    assert.deepEqual(puntos.at(-1), { x: 300, y: 0 });
});

