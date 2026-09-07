import test from "node:test";
import assert from "node:assert/strict";
import esCuidadoCorrecto, {
    obtenerCuidado,
    obtenerEnunciado,
    herramientaCorrecta,
    generarRondas,
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

test("cada problema declara textura, resultado y enunciados", () => {
    PROBLEMAS_DE_PLANTA.forEach(problema => {
        const cuidado = obtenerCuidado(problema);

        assert.ok(cuidado.textura, `${problema} necesita textura`);
        assert.ok(cuidado.texturaResuelta, `${problema} necesita texturaResuelta`);
        assert.ok(
            cuidado.enunciados.length >= 2,
            `${problema} necesita varios enunciados para no repetirse`
        );
    });
});

/**
 * El enunciado describe el síntoma, nunca el remedio. Si nombrara la
 * herramienta, elegirla sería leer y no observar la planta, que es justo lo que
 * el nivel quiere enseñar.
 */
test("ningún enunciado nombra la herramienta que lo resuelve", () => {
    const nombres = ["regadera", "guante", "lupa", "fungicida", "agua", "regar"];

    PROBLEMAS_DE_PLANTA.forEach(problema => {
        obtenerCuidado(problema).enunciados.forEach(enunciado => {
            const texto = enunciado.toLowerCase();

            nombres.forEach(nombre => {
                assert.ok(
                    !texto.includes(nombre),
                    `"${enunciado}" delata la respuesta con "${nombre}"`
                );
            });
        });
    });
});

test("un problema desconocido no tiene enunciado", () => {
    assert.equal(obtenerEnunciado("congelada"), "");
});

test("una vuelta completa de rondas incluye todos los problemas", () => {
    const rondas = generarRondas(PROBLEMAS_DE_PLANTA.length);
    const problemas = new Set(rondas.map(ronda => ronda.problema));

    assert.equal(problemas.size, PROBLEMAS_DE_PLANTA.length);
});

test("ninguna ronda repite el problema de la anterior", () => {
    // Se repite el sorteo porque el reparto es aleatorio: un solo intento podría
    // pasar por casualidad.
    for (let intento = 0; intento < 200; intento++) {
        const rondas = generarRondas(12);

        rondas.slice(1).forEach((ronda, indice) => {
            assert.notEqual(
                ronda.problema,
                rondas[indice].problema,
                "dos rondas seguidas con el mismo problema"
            );
        });
    }
});

test("se generan exactamente las rondas pedidas, con su enunciado", () => {
    const rondas = generarRondas(6);

    assert.equal(rondas.length, 6);

    rondas.forEach(ronda => {
        assert.ok(PROBLEMAS_DE_PLANTA.includes(ronda.problema));
        assert.ok(
            obtenerCuidado(ronda.problema).enunciados.includes(ronda.enunciado)
        );
    });
});

test("un total inválido nunca deja el nivel sin rondas", () => {
    assert.equal(generarRondas(0).length, 1);
    assert.equal(generarRondas(-3).length, 1);
    assert.equal(generarRondas(2.7).length, 2);
});

/**
 * El generador recibe la fuente de azar por parámetro, así que un extremo del
 * rango no puede sacarlo del arreglo y devolver una ronda indefinida.
 */
test("un generador de azar en los extremos sigue dando rondas válidas", () => {
    [() => 0, () => 0.999999, () => 1].forEach(aleatorio => {
        generarRondas(8, aleatorio).forEach(ronda => {
            assert.ok(PROBLEMAS_DE_PLANTA.includes(ronda.problema));
            assert.ok(ronda.enunciado.length > 0);
        });
    });
});
