import test from "node:test";
import assert from "node:assert/strict";
import evaluarDescuido from "../src/utils/evaluarDescuido.js";

test("estar en el punto reinicia el descuido acumulado", () => {
    const r = evaluarDescuido(3.2, "punto", 0.2);

    assert.equal(r.descuido, 0);
    assert.equal(r.avisar, false);
    assert.equal(r.penalizar, false);
});

test("entrar en rojo cuesta una vida en el acto", () => {
    assert.equal(evaluarDescuido(0, "frio", 1 / 60).penalizar, true);
    assert.equal(evaluarDescuido(0, "caliente", 1 / 60).penalizar, true);
    assert.equal(evaluarDescuido(0, "quemado", 1 / 60).penalizar, true);
});

test("seguir fuera no vuelve a cobrar: una vida por salida, no por fotograma", () => {
    let descuido = 0;
    let cobros = 0;

    // Tres segundos seguidos fuera de la franja, a 60 fps.
    for (let i = 0; i < 180; i++) {
        const r = evaluarDescuido(descuido, "frio", 1 / 60);
        descuido = r.descuido;
        if (r.penalizar) cobros++;
    }

    assert.equal(cobros, 1);
});

test("volver al punto rearma el cobro para la siguiente salida", () => {
    let cobros = 0;
    let descuido = evaluarDescuido(0, "frio", 0.1).descuido;
    cobros++;

    // Vuelve al verde: el acumulado se limpia.
    descuido = evaluarDescuido(descuido, "punto", 0.1).descuido;
    assert.equal(descuido, 0);

    // Y sale otra vez: vuelve a costar.
    const salida = evaluarDescuido(descuido, "caliente", 0.1);
    if (salida.penalizar) cobros++;

    assert.equal(cobros, 2);
});

test("un delta de cero no hace que la misma salida cobre dos veces", () => {
    const primera = evaluarDescuido(0, "frio", 0);

    assert.equal(primera.penalizar, true);
    assert.ok(primera.descuido > 0);
    assert.equal(evaluarDescuido(primera.descuido, "frio", 0).penalizar, false);
});

test("estando fuera siempre se avisa", () => {
    assert.equal(evaluarDescuido(0, "frio", 0.1).avisar, true);
    assert.equal(evaluarDescuido(2, "caliente", 0.1).avisar, true);
});

test("el acumulado sigue midiendo el tiempo fuera", () => {
    assert.equal(evaluarDescuido(1, "frio", 0.5).descuido, 1.5);
    assert.equal(evaluarDescuido(1, "caliente", 0.5).descuido, 1.5);
});

test("valores invalidos no rompen la cuenta", () => {
    assert.equal(evaluarDescuido(undefined, "frio", 0.5).descuido, 0.5);
    assert.equal(evaluarDescuido(NaN, "frio", 0.5).descuido, 0.5);
    assert.equal(evaluarDescuido(1, "frio", NaN).descuido, 1);
});
