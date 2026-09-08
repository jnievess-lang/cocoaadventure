import sharp from "sharp";
import { mkdirSync } from "fs";
import { quitarFondo, componentes, normalizarAlfa } from "./lib.mjs";

const DIR = "C:/Users/Gary.S/Downloads/Assets";
const PUB = "public/images";

const FONDOS = [
    ["BackgroundSolito.jpeg", "background/FondoTendalSecado.webp"],
    ["BackgroundTostado(1).jpeg", "background/FondoTostadora.webp"],
    ["BackgroundDescascarillado.jpeg", "background/FondoDescascarillado.webp"],
    // `BackgroundProcesar` es la misma escena que `BackgroundMolienda` pero sin
    // el molino ni los platos dibujados. Es la que sirve: el molino va encima
    // como sprite, y tenerlo también pintado en el fondo lo duplicaba.
    ["BackgroundProcesar.jpeg", "background/FondoMolienda.webp"]
];

// [origen, destino, tolerancia, ancho final]
const SPRITES = [
    // Canastas de Secar granos: cada destino tiene su lamina vacia y su
    // lamina llena. Las cuatro vienen ya recortadas, por eso tolerancia 0.
    //
    // `CanastaSol.png` se exporto con la capa al 50 %: su recorte es correcto
    // pero el fondo quedo en alfa 128 en vez de 0, y sin corregirlo la canasta
    // se ve translucida en el juego. `alfaMinimo` reescala 128..255 a 0..255.
    ["CanastaSol.png", "minigames/procesar/secado/CanastaSol.webp", 0, 512, { alfaMinimo: 128 }],
    ["CanastaDescarte.png", "minigames/procesar/secado/CanastaDescarte.webp", 0, 512],
    ["CanastaGranosBuenosSol.png", "minigames/procesar/secado/CanastaSolLlena.webp", 0, 512],
    ["CanastaGranosDañadosDescarte.png", "minigames/procesar/secado/CanastaDescarteLlena.webp", 0, 512],
    ["barrapulsar.jpeg", "minigames/procesar/tostado/BarraTueste.webp", 6, 1024],
    // `cacaotostado.jpeg` queda fuera: es un montón de granos oscuros sobre
    // fondo oscuro y el relleno se cuela entre ellos, así que sale moteado de
    // blanco a cualquier tolerancia. El estado de tueste se resuelve tiñendo
    // los propios granos en TostarScene.
    // OJO: el `molino.png` viejo NO es un sprite. Es BackgroundMolienda a
    // media resolución (1024x454 es la mitad exacta de 2048x908) y trae el
    // paisaje entero; el canal alfa que tenía fue lo que despistó. El bueno es
    // `Molino.jpeg`, que sí trae el molino solo sobre blanco.
    // `MolinoCompleto.png` trae el molino ya montado sobre la mesa, que es lo
    // que necesita: su mordaza de sujecion tiene asi un tablon donde morder.
    // Ya viene recortado con alfa propio, por eso tolerancia 0.
    ["MolinoCompleto.png", "minigames/procesar/molienda/Molino.webp", 0, 640],
    ["TazonChocolate.png", "minigames/procesar/molienda/TazonChocolate.webp", 5, 512],
    ["BarraChocolate.png", "minigames/procesar/molienda/BarraChocolate.webp", 5, 512],
    ["Azúcar.png", "minigames/procesar/molienda/Azucar.webp", 5, 256],
    ["Leche.png", "minigames/procesar/molienda/Leche.webp", 5, 256],
    ["MantecaCacao.png", "minigames/procesar/molienda/MantecaCacao.webp", 5, 256],
    // Iconos de los recuadros de ProcesarScene. Van aparte de la textura
    // que usa el minijuego: `GranoSecoBueno` sigue sirviendo dentro de Secar,
    // Tostar y Descascarillar, y pisarla cambiaria tambien el arte de la
    // partida.
    // Tolerancia 0: ambas fuentes ya vienen recortadas con alfa propio.
    ["CanastaGranosBuenos2.png", "minigames/procesar/secado/IconoSecarGranos.webp", 0, 512],
    ["Horno.png", "minigames/procesar/tostado/IconoTostar.webp", 0, 512]
];

// Láminas con varios objetos sueltos: se extrae el mejor ejemplar.
const RECORTES = [
    ["granosbuenos.png", "minigames/procesar/secado/GranoSecoBueno.webp", 12, 256],
    ["granosAgrietados.png", "minigames/procesar/secado/GranoSecoAgrietado.webp", 12, 256]
];

for (const destino of ["background", "minigames/procesar/secado", "minigames/procesar/tostado", "minigames/procesar/molienda"]) {
    mkdirSync(`${PUB}/${destino}`, { recursive: true });
}

console.log("--- Fondos (sin alfa, 1920 de ancho) ---");
for (const [origen, destino] of FONDOS) {
    const info = await sharp(`${DIR}/${origen}`)
        .flatten({ background: "#8FD3FF" })
        .resize({ width: 1920, withoutEnlargement: false })
        .webp({ quality: 82 })
        .toFile(`${PUB}/${destino}`);

    console.log(
        `  ${destino.padEnd(46)} ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`
    );
}

console.log("--- Sprites (alfa por difusion desde el borde) ---");
for (const [origen, destino, tolerancia, ancho, opciones = {}] of SPRITES) {
    let entrada = sharp(`${DIR}/${origen}`);

    if (tolerancia > 0) {
        const { buffer, info } = await quitarFondo(`${DIR}/${origen}`, { tolerancia });
        entrada = sharp(buffer, { raw: info });
    }
    else if (opciones.alfaMinimo) {
        const { buffer, info } = await normalizarAlfa(
            `${DIR}/${origen}`,
            opciones.alfaMinimo
        );
        entrada = sharp(buffer, { raw: info });
    }

    const info = await entrada
        .trim()
        .resize({ width: ancho, withoutEnlargement: true })
        .webp({ quality: 90, alphaQuality: 100 })
        .toFile(`${PUB}/${destino}`);

    console.log(
        `  ${destino.padEnd(46)} ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`
    );
}

console.log("--- Recortes por componente (filtro de solidez) ---");
for (const [origen, destino, tolerancia, ancho] of RECORTES) {
    const { buffer, info, esFondo } = await quitarFondo(`${DIR}/${origen}`, { tolerancia });

    const piezas = componentes(esFondo, info.width, info.height, 1500)
        .filter(p => p.solidez > 0.5);

    if (!piezas.length) {
        console.log(`  ${origen}: ninguna pieza solida, se omite`);
        continue;
    }

    // La más grande de las sólidas es el ejemplar mejor conservado.
    const p = piezas[0];

    const salida = await sharp(buffer, { raw: info })
        .extract({ left: p.minX, top: p.minY, width: p.ancho, height: p.alto })
        .resize({ width: ancho, withoutEnlargement: true })
        .webp({ quality: 90, alphaQuality: 100 })
        .toFile(`${PUB}/${destino}`);

    console.log(
        `  ${destino.padEnd(46)} ${salida.width}x${salida.height}  ${(salida.size / 1024).toFixed(0)} KB` +
        `   (${piezas.length} solidas de ${componentes(esFondo, info.width, info.height, 1500).length})`
    );
}
