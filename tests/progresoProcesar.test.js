import test from "node:test";
import assert from "node:assert/strict";
import ProgressManager from "../src/managers/ProgressManager.js";

const STORAGE_KEY = "cocoaAdventureProgress";
const storage = new Map();

global.localStorage = {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value)
};

test.beforeEach(() => storage.clear());

test("el módulo Procesar arranca con Secar desbloqueado y el resto cerrado", () => {
    const progress = ProgressManager.load();

    assert.equal(progress.procesar.secado.unlocked, true);
    assert.equal(progress.procesar.tostado.unlocked, false);
    assert.equal(progress.procesar.descascarillado.unlocked, false);
    assert.equal(progress.procesar.molienda.unlocked, false);
});

test("cada nivel de Procesar desbloquea únicamente el siguiente", () => {
    ProgressManager.completeSecado(2);

    let progress = ProgressManager.load();
    assert.equal(progress.procesar.tostado.unlocked, true);
    assert.equal(progress.procesar.descascarillado.unlocked, false);

    ProgressManager.completeTostado(3);

    progress = ProgressManager.load();
    assert.equal(progress.procesar.descascarillado.unlocked, true);
    assert.equal(progress.procesar.molienda.unlocked, false);

    ProgressManager.completeDescascarillado(1);

    progress = ProgressManager.load();
    assert.equal(progress.procesar.molienda.unlocked, true);
});

test("Procesar conserva la mejor puntuación de cada nivel", () => {
    ProgressManager.completeTostado(3);
    ProgressManager.completeTostado(1);

    assert.equal(ProgressManager.load().procesar.tostado.stars, 3);
});

test("completar el último nivel no rompe la secuencia", () => {
    ProgressManager.completeMolienda(3);

    const progress = ProgressManager.load();
    assert.equal(progress.procesar.molienda.stars, 3);
});

test("un guardado anterior sin el módulo Procesar recibe sus valores por defecto", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        mantener: {
            regar: { unlocked: true, stars: 3 }
        }
    }));

    const progress = ProgressManager.load();

    assert.equal(progress.procesar.secado.unlocked, true);
    assert.equal(progress.procesar.secado.stars, 0);
    assert.equal(progress.mantener.regar.stars, 3);
});
