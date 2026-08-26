import { writeFileSync, mkdirSync } from "fs";

const PAGINA = "https://ttsfree.com/text-to-speech/spanish-ecuador";
const DESTINO = "public/audio/voice";
const VOZ = "es-EC-AndreaNeural";

const VOCES = [
    ["SecarGranosInstruccion", "Arrastra cada grano a su canasta. Los granos lisos van a la canasta del sol, y los agrietados a la canasta de descarte."],
    ["SecarGranosAyuda", "Míralo con calma. El grano agrietado tiene la cáscara partida, ese no sirve para secar."],
    ["SecarGranosCompletado", "¡Muy bien! Escogiste los granos buenos y ya están listos para el sol."],
    ["SecarGranosTiempoAgotado", "Se acabó el tiempo. Escoger granos requiere calma, probemos otra vez."],
    ["TostarInstruccion", "Mantén pulsado para avivar el fuego. Cuida que la aguja se quede dentro de la franja verde."],
    ["TostarAyuda", "Si sueltas, el fuego baja. Si aprietas demasiado, el cacao se quema."],
    ["TostarCompletado", "¡Perfecto! El cacao quedó justo en su punto de tueste."],
    ["TostarTiempoAgotado", "Se acabó el tiempo. Un buen tueste necesita paciencia, intentémoslo de nuevo."],
    ["DescascarillarInstruccion", "Primero toca el grano para quebrar la cáscara. Después desliza el dedo para soplar la cascarilla."],
    ["DescascarillarAyuda", "Ese grano todavía está entero. Tócalo una vez antes de soplar."],
    ["DescascarillarCompletado", "¡Excelente! Los granos quedaron limpios, sin nada de cascarilla."],
    ["DescascarillarTiempoAgotado", "Se acabó el tiempo. Recuerda: primero quebrar, después soplar."],
    ["MolerInstruccion", "Gira la manivela del molino con el dedo, en círculos. Cuando la pasta esté lista, agrega lo que pide la receta."],
    ["MolerAyuda", "No sueltes el dedo. Sigue girando en círculos alrededor de la manivela."],
    ["MolerCompletado", "¡Lo lograste! Convertiste el cacao en chocolate de verdad."],
    ["MolerTiempoAgotado", "Se acabó el tiempo. Moler cuesta esfuerzo, inténtalo una vez más."]
];

const UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36";

const dur = ms => new Promise(r => setTimeout(r, ms));

const campo = (html, nombre) => {
    const re = new RegExp(
        `<input[^>]*name=["']${nombre}["'][^>]*value=["']([^"']*)["']`,
        "i"
    );
    const alt = new RegExp(
        `<input[^>]*value=["']([^"']*)["'][^>]*name=["']${nombre}["']`,
        "i"
    );
    return (html.match(re) ?? html.match(alt) ?? [])[1] ?? "";
};

async function generar(nombre, texto) {
    // 1. Página nueva: el token `process` es de un solo uso.
    const inicial = await fetch(PAGINA, { headers: { "User-Agent": UA } });
    const html = await inicial.text();

    const cookies = (inicial.headers.getSetCookie?.() ?? [])
        .map(c => c.split(";")[0])
        .join("; ");

    const process = campo(html, "process");
    const csrf = campo(html, "csrf_token");
    const ref = campo(html, "ref");

    if (!process) throw new Error("no se encontro el token 'process'");

    // 2. Envío. `music` se omite a propósito: marcado mete musica de fondo.
    const fd = new FormData();
    fd.append("input_text", texto);
    fd.append("select_lang", "es-EC");
    fd.append("voiceID", VOZ);
    fd.append("voice", VOZ);
    fd.append("voice_service", "voice_bin");
    fd.append("process", process);
    fd.append("csrf_token", csrf);
    fd.append("volume_range", "0");
    fd.append("voice_pitch", "0");
    fd.append("music_source", "lib");
    fd.append("track_id", "");
    fd.append("music_url", "");
    fd.append("bgm_url", "");
    fd.append("bgm_range", "");
    fd.append("bgm_loop", "");
    fd.append("bgm_volume", "");
    fd.append("ads-fill", "");
    fd.append("ads-blocking", "");
    fd.append("action", PAGINA);
    fd.append("ref", ref);

    const cabeceras = {
        "User-Agent": UA,
        Referer: PAGINA,
        Origin: "https://ttsfree.com",
        "X-Requested-With": "XMLHttpRequest"
    };
    if (cookies) cabeceras.Cookie = cookies;

    // 3. `processing.php` es un stream SSE con el progreso, y el enlace final
    //    llega ahí dentro (link_mp3). Hay que estar escuchándolo ANTES de que
    //    el POST termine, o el proceso ya se consumió cuando uno se asoma.
    const escucha = leerSse(
        `https://ttsfree.com/voice/convert/processing.php?id=${process}`,
        cabeceras
    );

    const envio = await fetch(
        `https://ttsfree.com/voice/convert/voicegen.php?id=${process}`,
        { method: "POST", body: fd, headers: cabeceras }
    );

    const respuesta = await envio.text();

    const url = extraerMp3(respuesta) ?? (await escucha);

    if (!url) throw new Error("no llego el mp3: " + respuesta.slice(0, 160));

    // 4. Descarga.
    const audio = await fetch(url, { headers: cabeceras });
    const bytes = Buffer.from(await audio.arrayBuffer());

    if (bytes.length < 2000) throw new Error(`mp3 sospechoso (${bytes.length} B)`);

    writeFileSync(`${DESTINO}/${nombre}.mp3`, bytes);
    return bytes.length;
}

/**
 * Lee el stream de eventos y resuelve con el primer enlace .mp3 que aparezca,
 * venga en `link_mp3` o incrustado en el HTML del mensaje.
 */
async function leerSse(url, cabeceras, limiteMs = 70000) {
    try {
        const respuesta = await fetch(url, {
            headers: { ...cabeceras, Accept: "text/event-stream" },
            signal: AbortSignal.timeout(limiteMs)
        });

        if (!respuesta.body) return null;

        const decodificador = new TextDecoder();
        let acumulado = "";

        for await (const trozo of respuesta.body) {
            acumulado += decodificador.decode(trozo, { stream: true });

            const encontrado = extraerMp3(acumulado);
            if (encontrado) return encontrado;
        }

        return extraerMp3(acumulado);
    }
    catch {
        return null;
    }
}

function extraerMp3(texto) {
    // El SSE manda JSON con las barras escapadas (https:\/\/...). Hay que
    // deshacer el escape ANTES de buscar, o la URL se corta en la primera.
    const limpio = texto
        .replace(/\\\//g, "/")
        .replace(/&amp;/g, "&");

    const m = limpio.match(/https?:\/\/[^\s"'<>\\]+?\.mp3[^\s"'<>\\]*/);
    return m ? m[0] : null;
}

mkdirSync(DESTINO, { recursive: true });

let ok = 0;
const fallos = [];

const filtro = process.argv[2];
const pendientes = filtro
    ? VOCES.filter(([n]) => n.includes(filtro))
    : VOCES;

for (const [nombre, texto] of pendientes) {
    try {
        const bytes = await generar(nombre, texto);
        ok++;
        console.log(`  OK    ${nombre.padEnd(30)} ${(bytes / 1024).toFixed(0)} KB`);
    }
    catch (e) {
        fallos.push(nombre);
        console.log(`  FALLA ${nombre.padEnd(30)} ${e.message}`);
    }

    await dur(2000);
}

console.log(`\n${ok} de ${pendientes.length} generadas.`);
if (fallos.length) console.log("Faltan: " + fallos.join(", "));
