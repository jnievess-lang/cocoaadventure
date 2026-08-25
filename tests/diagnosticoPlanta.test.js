import test from "node:test";
import assert from "node:assert/strict";
import esCuidadoCorrecto, {
    obtenerCuidado,
    herramientaCorrecta,
    PROBLEMAS_DE_PLANTA,
    PLANTA_SEDIENTA,
    PLANTA_CON_MALEZA,
    PLANTA_CON_PLAGA,
    PLANTA_CON_HONGOS,
    HERRAMIENTA_REGADERA,
    HERRAMIENTA_GUANTES,
    HERRAMIENTA_LUPA,
    HERRAMIENTA_FUNGICIDA
} from "../src/utils/diagnosticoPlanta.js";

test("cada problema se resuelve con su herramienta", () => {
    assert.equal(herramientaCorrecta(PLANTA_SEDIENTA), HERRAMIENTA_REGADERA);
    assert.equal(herramientaCorrecta(PLANTA_CON_MALEZA), HERRAMIENTA_GUANTES);
    assert.equal(herramientaCorrecta(PLANTA_CON_PLAGA), HERRAMIENTA_LUPA);
    assert.equal(herramientaCorrecta(PLANTA_CON_HONGOS), HERRAMIENTA_FUNGICIDA);
});

test("una herramienta equivocada nunca se acepta", () => {
    assert.equal(esCuidadoCorrecto(PLANTA_SEDIENTA, HERRAMIENTA_REGADERA), true);
    assert.equal(esCuidadoCorrecto(PLANTA_SEDIENTA, HERRAMIENTA_LUPA), false);
    assert.equal(esCuidadoCorrecto(PLANTA_CON_HONGOS, HERRAMIENTA_GUANTES), false);
});

test("un problema desconocido no valida ninguna herramienta", () => {
    assert.equal(esCuidadoCorrecto("congelada", HERRAMIENTA_REGADERA), false);
    assert.equal(herramientaCorrecta("congelada"), null);
    assert.equal(obtenerCuidado("congelada"), null);
});

test("no hay dos problemas que compartan herramienta", () => {
    const herramientas = PROBLEMAS_DE_PLANTA.map(herramientaCorrecta);

    assert.equal(new Set(herramientas).size, PROBLEMAS_DE_PLANTA.length);
});

test("cada problema declara textura, resultado y enunciado", () => {
    PROBLEMAS_DE_PLANTA.forEach(problema => {
        const cuidado = obtenerCuidado(problema);

        assert.ok(cuidado.textura, `${problema} necesita textura`);
        assert.ok(cuidado.texturaResuelta, `${problema} necesita texturaResuelta`);
        assert.ok(cuidado.enunciado, `${problema} necesita enunciado`);
    });
});
