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
    assert.equal(progress.cosechar.abrirMazorcas.unlocked, true);
});

test("completar Abrir mazorcas desbloquea Revisión y acopio", () => {
    ProgressManager.completeAbrirMazorcas(2);
    ProgressManager.completeAbrirMazorcas(1);

    const progress = ProgressManager.load();
    assert.equal(progress.cosechar.abrirMazorcas.stars, 2);
    assert.equal(progress.cosechar.revisionAcopio.unlocked, true);
});

test("completar Clasificar semillas conserva su mejor puntuación", () => {
    ProgressManager.completeAbrirMazorcas(1);
    ProgressManager.completeRevisionAcopio(3);
    ProgressManager.completeRevisionAcopio(1);

    const progress = ProgressManager.load();
    assert.equal(progress.cosechar.revisionAcopio.unlocked, true);
    assert.equal(progress.cosechar.revisionAcopio.stars, 3);
});

test("normaliza un guardado anterior que ya tenía estrellas", () => {
    const oldProgress = ProgressManager.getDefaultProgress();
    oldProgress.cosechar.seleccionarMaduras.stars = 1;
    oldProgress.cosechar.corteCuidadoso.unlocked = false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(oldProgress));

    const progress = ProgressManager.load();
    assert.equal(progress.cosechar.corteCuidadoso.unlocked, true);
});

test("migra aLaCanasta y elimina la clave antigua en el siguiente guardado", () => {
    const oldProgress = ProgressManager.getDefaultProgress();
    delete oldProgress.cosechar.abrirMazorcas;
    oldProgress.cosechar.aLaCanasta = { unlocked: true, stars: 2 };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(oldProgress));

    const migrated = ProgressManager.load();
    assert.equal(migrated.cosechar.abrirMazorcas.unlocked, true);
    assert.equal(migrated.cosechar.abrirMazorcas.stars, 2);
    assert.equal("aLaCanasta" in migrated.cosechar, false);

    ProgressManager.save(migrated);
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    assert.equal("aLaCanasta" in saved.cosechar, false);
});
