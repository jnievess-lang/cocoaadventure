import test from "node:test";
import assert from "node:assert/strict";
import intersectaSegmentoElipse from "../src/utils/intersectaSegmentoElipse.js";

const elipse = { x: 100, y: 100, radioX: 40, radioY: 70 };

test("detecta un corte horizontal que atraviesa la elipse", () => {
    assert.equal(intersectaSegmentoElipse(
        { x: 20, y: 100 },
        { x: 180, y: 100 },
        elipse
    ), true);
});

test("detecta un segmento que roza el borde ampliado", () => {
    assert.equal(intersectaSegmentoElipse(
        { x: 60, y: 35 },
        { x: 60, y: 165 },
        elipse
    ), true);
});

test("rechaza un segmento alejado de la elipse", () => {
    assert.equal(intersectaSegmentoElipse(
        { x: 10, y: 10 },
        { x: 40, y: 25 },
        elipse
    ), false);
});
