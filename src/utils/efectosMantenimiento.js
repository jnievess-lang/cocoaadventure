/**
 * Efectos visuales compartidos por los minijuegos de Mantener.
 *
 * Todo lo que se dibuja aquí es decorativo: ningún nivel debe esperar a que
 * termine un efecto para avanzar. Las partículas se generan por código para no
 * añadir imágenes al proyecto por un círculo de color.
 */

function asegurarTexturaCirculo(scene, clave, color, radio) {
    if (scene.textures.exists(clave)) return clave;

    const trazo = scene.make.graphics({ x: 0, y: 0, add: false });

    trazo.fillStyle(color, 1);
    trazo.fillCircle(radio, radio, radio);
    trazo.generateTexture(clave, radio * 2, radio * 2);
    trazo.destroy();

    return clave;
}

/**
 * Posición de la boquilla de la regadera, medida sobre el dibujo de 640 x 427:
 * el centro de la roseta cae en (68, 139) px. El agua debe nacer ahí y caer, no
 * aparecer flotando encima de la regadera.
 */
export const BOQUILLA_REGADERA = Object.freeze({ x: 0.107, y: 0.325 });

/**
 * Desplazamiento de la boquilla respecto al centro de la regadera, ya girado.
 *
 * El giro es imprescindible: la boquilla está arriba y a la izquierda del
 * centro, así que al inclinar la regadera para verter, el pico de verdad baja
 * casi media altura del dibujo. Calcularlo sin girar dejaba el chorro naciendo
 * muy por encima del pico, en el aire.
 */
function desplazamientoBoquilla(regadera, grados) {
    const dx = (BOQUILLA_REGADERA.x - regadera.originX) * regadera.displayWidth;
    const dy = (BOQUILLA_REGADERA.y - regadera.originY) * regadera.displayHeight;

    const radianes = (grados * Math.PI) / 180;
    const coseno = Math.cos(radianes);
    const seno = Math.sin(radianes);

    return {
        x: dx * coseno - dy * seno,
        y: dx * seno + dy * coseno
    };
}

/**
 * `grados` permite preguntar por el pico con una inclinación distinta de la
 * actual, que es lo que hace falta mientras la regadera todavía está girando.
 */
export function boquillaDe(regadera, grados) {
    if (!regadera?.active) return null;

    const desplazamiento = desplazamientoBoquilla(
        regadera,
        grados ?? regadera.angle
    );

    return {
        x: regadera.x + desplazamiento.x,
        y: regadera.y + desplazamiento.y
    };
}

/** Chorro corto de gotas que cae desde el punto indicado. */
export function regar(scene, x, y, opciones = {}) {
    const clave = asegurarTexturaCirculo(scene, "particulaGota", 0x4FC3F7, 10);
    const duracion = opciones.duracion ?? 620;

    const emisor = scene.add.particles(x, y, clave, {
        speedY: { min: 120, max: 240 },
        speedX: { min: -45, max: 45 },
        scale: { start: 0.75, end: 0.2 },
        alpha: { start: 0.95, end: 0 },
        lifespan: 620,
        quantity: 2,
        frequency: 26,
        gravityY: 620
    });

    emisor.setDepth(opciones.depth ?? 60);

    scene.time.delayedCall(duracion, () => emisor.stop());
    scene.time.delayedCall(duracion + 800, () => emisor.destroy());

    return emisor;
}

/** Nube fina de fungicida. */
export function rociar(scene, x, y, opciones = {}) {
    const clave = asegurarTexturaCirculo(scene, "particulaRocio", 0x8BC34A, 10);
    const duracion = opciones.duracion ?? 560;

    const emisor = scene.add.particles(x, y, clave, {
        speed: { min: 40, max: 130 },
        angle: { min: 200, max: 340 },
        scale: { start: 0.5, end: 1.1 },
        alpha: { start: 0.5, end: 0 },
        lifespan: 700,
        quantity: 3,
        frequency: 30
    });

    emisor.setDepth(opciones.depth ?? 60);

    scene.time.delayedCall(duracion, () => emisor.stop());
    scene.time.delayedCall(duracion + 900, () => emisor.destroy());

    return emisor;
}

/**
 * Un guante grande baja, se cierra sobre el objetivo y tira de él hacia arriba
 * hasta sacarlo de pantalla. Devuelve el guante por si hay que limpiarlo.
 */
export function arrancarConGuante(scene, objetivo, opciones = {}) {
    const alto = scene.scale.height;
    const arranque = objetivo.y - alto * 0.55;

    const guante = scene.add.image(objetivo.x, arranque, "GuanteAbierto");

    guante
        .setOrigin(0.5, 0.35)
        .setScale((alto * (opciones.tamano ?? 0.16)) / guante.height)
        .setDepth(opciones.depth ?? 70)
        .setAngle(-10);

    const escala = guante.scale;

    scene.tweens.add({
        targets: guante,
        y: objetivo.y - objetivo.displayHeight * 0.45,
        angle: 0,
        duration: 240,
        ease: "Quad.In",
        onComplete: () => {
            if (!guante.active) return;

            guante.setTexture("GuanteCerrado");
            guante.setScale(escala);

            // La maleza se oculta al ser agarrada: si no, se ve asomando por
            // detrás del puño y el tirón deja de leerse.
            objetivo.setVisible(false);

            scene.tweens.add({
                targets: [guante, objetivo],
                y: `-=${alto * 0.12}`,
                duration: 140,
                ease: "Back.Out",
                onComplete: () => {
                    opciones.onArrancar?.();

                    scene.tweens.add({
                        targets: [guante, objetivo],
                        y: -alto * 0.3,
                        angle: 18,
                        duration: 360,
                        ease: "Quad.In",
                        onComplete: () => {
                            guante.destroy();
                            objetivo.destroy();
                            opciones.onFin?.();
                        }
                    });
                }
            });
        }
    });

    return guante;
}

/**
 * Coloca la regadera arriba y a la derecha de la planta, de modo que su pico
 * quede justo encima. Se calcula desde la boquilla y no desde el centro del
 * dibujo, porque el pico está muy descentrado hacia la izquierda.
 */
export function colocarRegaderaSobre(scene, regadera, objetivo, opciones = {}) {
    if (!regadera?.active || !objetivo?.active) return null;

    // Se apunta con la inclinación que la regadera tendrá al verter, no con la
    // que tiene ahora. Si se coloca en horizontal, al inclinarse después el pico
    // cae dentro de las hojas y el chorro queda por encima de él.
    const desplazamiento = desplazamientoBoquilla(
        regadera,
        opciones.gradosAlVerter ?? 0
    );

    const picoX = objetivo.x;
    const picoY = objetivo.y - objetivo.displayHeight * (opciones.altura ?? 1.05);

    const destino = {
        x: picoX - desplazamiento.x,
        y: picoY - desplazamiento.y
    };

    return scene.tweens.add({
        targets: regadera,
        x: destino.x,
        y: destino.y,
        duration: opciones.duracion ?? 180,
        ease: "Sine.Out",
        onComplete: () => opciones.onListo?.()
    });
}

/** Inclina la regadera mientras vierte y la devuelve a su ángulo. */
export function inclinarRegadera(scene, regadera, opciones = {}) {
    if (!regadera?.active) return null;

    const anguloOriginal = regadera.angle;

    return scene.tweens.add({
        targets: regadera,
        angle: anguloOriginal - (opciones.grados ?? 38),
        duration: 180,
        ease: "Sine.Out",
        yoyo: true,
        hold: opciones.sostener ?? 420
    });
}
