import test from "node:test";
import assert from "node:assert/strict";
import ProgressManager from "../src/managers/ProgressManager.js";

const storage = new Map();

global.localStorage = {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value)
};

test.beforeEach(() => storage.clear());

test("un trofeo exige tres estrellas en todos los niveles de su módulo", () => {
    const progress = ProgressManager.getDefaultProgress();

    progress.sembrar.limpiarTerreno.stars = 3;
    progress.sembrar.prepararTierra.stars = 3;
    progress.sembrar.plantarPlantula.stars = 2;

    assert.equal(ProgressManager.isModulePerfect("sembrar", progress), false);

    progress.sembrar.plantarPlantula.stars = 3;

    assert.equal(ProgressManager.isModulePerfect("sembrar", progress), true);
});

test("un módulo sin niveles registrados no concede un trofeo", () => {
    assert.equal(ProgressManager.isModulePerfect("procesar"), false);
});
