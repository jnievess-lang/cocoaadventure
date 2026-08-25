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

test("completar Mazorcas listas desbloquea Corte cuidadoso", () => {
    ProgressManager.completeSeleccionarMaduras(2);

    const progress = ProgressManager.load();
    assert.equal(progress.cosechar.seleccionarMaduras.stars, 2);
    assert.equal(progress.cosechar.corteCuidadoso.unlocked, true);
});

test("completar Corte cuidadoso conserva la mejor puntuación", () => {
    ProgressManager.completeCorteCuidadoso(3);
    ProgressManager.completeCorteCuidadoso(1);

    const progress = ProgressManager.load();
    assert.equal(progress.cosechar.corteCuidadoso.stars, 3);
    assert.equal(progress.cosechar.aLaCanasta.unlocked, true);
});

test("normaliza un guardado anterior que ya tenía estrellas", () => {
    const oldProgress = ProgressManager.getDefaultProgress();
    oldProgress.cosechar.seleccionarMaduras.stars = 1;
    oldProgress.cosechar.corteCuidadoso.unlocked = false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(oldProgress));

    const progress = ProgressManager.load();
    assert.equal(progress.cosechar.corteCuidadoso.unlocked, true);
});
