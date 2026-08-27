import Phaser from "phaser";
import "./pantallaCargaInicial.js";
import "./style.css";

import config from "./config";

const game = new Phaser.Game(config);

const updateOrientation = () => {
    const portrait = window.innerHeight > window.innerWidth;
    document.body.classList.toggle("portrait-device", portrait);

    if (!game.loop) return;

    if (portrait && game.loop.running) game.loop.sleep();
    if (!portrait && !game.loop.running) game.loop.wake();
};

window.addEventListener("resize", updateOrientation);
window.addEventListener("orientationchange", updateOrientation);
window.addEventListener("load", updateOrientation);
requestAnimationFrame(updateOrientation);

// Phaser.Scale.RESIZE fija el buffer del canvas en píxeles CSS, sin contar el
// devicePixelRatio del dispositivo. En cualquier celular moderno (densidad >1)
// eso deja el lienzo con menos píxeles reales que la pantalla, y todo se ve
// borroso al ser reescalado por el navegador. Por eso el modo es NONE y el
// tamaño se controla aquí: el buffer usa píxeles físicos (nítido) mientras el
// tamaño en pantalla (CSS) se mantiene igual al viewport mediante scale.zoom.
const LIMITE_DENSIDAD_PIXELES = 3;

function aplicarTamanoLienzo() {
    const densidad = Math.min(window.devicePixelRatio || 1, LIMITE_DENSIDAD_PIXELES);
    const anchoCss = window.innerWidth;
    const altoCss = window.innerHeight;
    const anchoBuffer = Math.round(anchoCss * densidad);
    const altoBuffer = Math.round(altoCss * densidad);

    if (game.canvas.width === anchoBuffer && game.canvas.height === altoBuffer) return;

    game.scale.zoom = 1 / densidad;
    game.scale.resize(anchoBuffer, altoBuffer);
}

aplicarTamanoLienzo();

// Las escenas calculan toda su disposición a partir de this.scale.width/height
// una sola vez en create(). Un redimensionamiento genuino (rotación, cambio de
// densidad al mover la ventana entre pantallas, etc.) deja esos valores
// obsoletos, así que reiniciamos la escena activa para que vuelva a ejecutar
// create() con las dimensiones correctas sin tener que tocar cada escena.
const ESCENAS_SIN_REINICIO_POR_REDIMENSION = new Set(["BootScene", "PreloadScene"]);
let temporizadorRedimension = null;

const programarRedimension = () => {
    if (temporizadorRedimension) clearTimeout(temporizadorRedimension);

    temporizadorRedimension = setTimeout(() => {
        temporizadorRedimension = null;
        aplicarTamanoLienzo();

        const [escenaActiva] = game.scene.getScenes(true);
        if (!escenaActiva) return;
        if (ESCENAS_SIN_REINICIO_POR_REDIMENSION.has(escenaActiva.scene.key)) return;

        escenaActiva.scene.restart();
    }, 200);
};

window.addEventListener("resize", programarRedimension);
window.addEventListener("orientationchange", programarRedimension);
