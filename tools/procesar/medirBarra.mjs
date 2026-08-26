import sharp from "sharp";

const { data, info } = await sharp(
    "public/images/minigames/procesar/tostado/BarraTueste.webp"
)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

const { width: w, height: h, channels: ch } = info;
const y = Math.floor(h / 2);

let inicio = -1;
let fin = -1;

for (let x = 0; x < w; x++) {
    const i = (y * w + x) * ch;
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];

    const esVerde = g > 110 && g > r + 40 && g > b + 40;

    if (esVerde && inicio === -1) inicio = x;
    if (esVerde) fin = x;
}

console.log(`barra ${w}x${h}`);
console.log(
    `zona verde: x ${inicio} a ${fin}  =>  ` +
    `${(inicio / w).toFixed(3)} a ${(fin / w).toFixed(3)} del ancho`
);
