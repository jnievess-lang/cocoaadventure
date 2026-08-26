import sharp from "sharp";

/**
 * Quita el fondo de una ilustración con relleno por difusión desde el borde,
 * usando tolerancia LOCAL: un píxel se considera fondo si se parece al vecino
 * desde el que se llegó, no al color inicial.
 *
 * Es lo que permite recorrer una pared con degradado o una mesa de madera
 * completa sin salirse: el avance se frena de golpe contra el contorno marrón
 * grueso que llevan todas las ilustraciones del proyecto.
 */
export async function quitarFondo(entrada, opciones = {}) {
    const tolerancia = opciones.tolerancia ?? 22;

    const { data, info } = await sharp(entrada)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const { width: w, height: h, channels: ch } = info;
    const total = w * h;

    const esFondo = new Uint8Array(total);
    const visitado = new Uint8Array(total);
    const pila = [];

    const rgb = i => [data[i * ch], data[i * ch + 1], data[i * ch + 2]];

    const distancia = (a, b) => {
        const [r1, g1, b1] = rgb(a);
        const [r2, g2, b2] = rgb(b);
        return Math.max(
            Math.abs(r1 - r2),
            Math.abs(g1 - g2),
            Math.abs(b1 - b2)
        );
    };

    const sembrar = i => {
        // Un píxel ya transparente también es fondo válido de partida.
        if (visitado[i]) return;
        visitado[i] = 1;
        esFondo[i] = 1;
        pila.push(i);
    };

    for (let x = 0; x < w; x++) {
        sembrar(x);
        sembrar((h - 1) * w + x);
    }
    for (let y = 0; y < h; y++) {
        sembrar(y * w);
        sembrar(y * w + w - 1);
    }

    while (pila.length) {
        const i = pila.pop();
        const x = i % w;
        const y = (i / w) | 0;

        const vecinos = [];
        if (x > 0) vecinos.push(i - 1);
        if (x < w - 1) vecinos.push(i + 1);
        if (y > 0) vecinos.push(i - w);
        if (y < h - 1) vecinos.push(i + w);

        for (const v of vecinos) {
            if (visitado[v]) continue;
            if (distancia(i, v) > tolerancia) continue;

            visitado[v] = 1;
            esFondo[v] = 1;
            pila.push(v);
        }
    }

    // Alfa binario primero.
    const salida = Buffer.from(data);
    for (let i = 0; i < total; i++) {
        salida[i * ch + 3] = esFondo[i] ? 0 : data[i * ch + 3];
    }

    // Suaviza un píxel el filo para que no quede aserrado al escalar.
    const suavizado = Buffer.from(salida);
    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            const i = y * w + x;
            if (esFondo[i]) continue;

            let fondoAlrededor = 0;
            for (const v of [i - 1, i + 1, i - w, i + w]) {
                if (esFondo[v]) fondoAlrededor++;
            }

            if (fondoAlrededor > 0) {
                suavizado[i * ch + 3] = Math.round(
                    255 * (1 - fondoAlrededor / 6)
                );
            }
        }
    }

    return {
        buffer: suavizado,
        info: { width: w, height: h, channels: ch },
        esFondo
    };
}

/**
 * Etiqueta las manchas opacas y devuelve el recuadro de cada una, de mayor a
 * menor. Sirve para sacar sprites individuales de una lámina que trae varios
 * objetos sueltos, como los granos agrietados.
 */
export function componentes(esFondo, w, h, minimoPixeles = 400) {
    const etiqueta = new Int32Array(w * h).fill(-1);
    const cajas = [];

    for (let inicio = 0; inicio < w * h; inicio++) {
        if (esFondo[inicio] || etiqueta[inicio] !== -1) continue;

        const id = cajas.length;
        const pila = [inicio];
        etiqueta[inicio] = id;

        let minX = w, maxX = 0, minY = h, maxY = 0, area = 0;

        while (pila.length) {
            const i = pila.pop();
            const x = i % w;
            const y = (i / w) | 0;

            area++;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;

            const vecinos = [];
            if (x > 0) vecinos.push(i - 1);
            if (x < w - 1) vecinos.push(i + 1);
            if (y > 0) vecinos.push(i - w);
            if (y < h - 1) vecinos.push(i + w);

            for (const v of vecinos) {
                if (esFondo[v] || etiqueta[v] !== -1) continue;
                etiqueta[v] = id;
                pila.push(v);
            }
        }

        const ancho = maxX - minX + 1;
        const alto = maxY - minY + 1;

        cajas.push({
            minX,
            maxX,
            minY,
            maxY,
            area,
            ancho,
            alto,
            // Un objeto real llena buena parte de su recuadro. Un contorno que
            // se quedó hueco porque el relleno se metió dentro, no.
            solidez: area / (ancho * alto)
        });
    }

    return cajas
        .filter(c => c.area >= minimoPixeles)
        .sort((a, b) => b.area - a.area);
}

/** Recorta al contenido, escala al ancho pedido y escribe el WebP final. */
export async function escribirWebp(buffer, info, destino, anchoObjetivo) {
    await sharp(buffer, { raw: info })
        .trim()
        .resize({ width: anchoObjetivo, withoutEnlargement: true })
        .webp({ quality: 90 })
        .toFile(destino);
}
