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

test("el módulo Mantener arranca con Regar desbloqueado y el resto cerrado", () => {
    const progress = ProgressManager.load();

    assert.equal(progress.mantener.regar.unlocked, true);
    assert.equal(progress.mantener.malezas.unlocked, false);
    assert.equal(progress.mantener.plagas.unlocked, false);
    assert.equal(progress.mantener.cuidadoCorrecto.unlocked, false);
});

test("cada nivel de Mantener desbloquea únicamente el siguiente", () => {
    ProgressManager.completeRegar(2);

    let progress = ProgressManager.load();
    assert.equal(progress.mantener.malezas.unlocked, true);
    assert.equal(progress.mantener.plagas.unlocked, false);

    ProgressManager.completeMalezas(3);

    progress = ProgressManager.load();
    assert.equal(progress.mantener.plagas.unlocked, true);
    assert.equal(progress.mantener.cuidadoCorrecto.unlocked, false);

    ProgressManager.completePlagas(1);

    progress = ProgressManager.load();
    assert.equal(progress.mantener.cuidadoCorrecto.unlocked, true);
});

test("Mantener conserva la mejor puntuación de cada nivel", () => {
    ProgressManager.completeRegar(3);
    ProgressManager.completeRegar(1);

    assert.equal(ProgressManager.load().mantener.regar.stars, 3);
});

test("completar el último nivel no rompe la secuencia", () => {
    ProgressManager.completeCuidadoCorrecto(3);

    const progress = ProgressManager.load();
    assert.equal(progress.mantener.cuidadoCorrecto.stars, 3);
});

test("un guardado anterior sin el módulo Mantener recibe sus valores por defecto", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        cosechar: {
            seleccionarMaduras: { unlocked: true, stars: 3 }
        }
    }));

    const progress = ProgressManager.load();

    assert.equal(progress.mantener.regar.unlocked, true);
    assert.equal(progress.mantener.regar.stars, 0);
    assert.equal(progress.cosechar.seleccionarMaduras.stars, 3);
});

