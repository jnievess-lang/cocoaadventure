/**
 * Lanza el icono de una herramienta hacia el punto tocado y lo devuelve a su
 * sitio. Es solo retroalimentación visual: el nivel nunca depende de que la
 * animación termine, y si el asset no cargó la acción continúa igual.
 */
export default function animarHerramienta(scene, config) {
    const { texture, desdeX, desdeY, hastaX, hastaY, displayHeight } = config;

    if (!scene.textures.exists(texture)) {
        config.onComplete?.();
        return null;
    }

    const herramienta = scene.add.image(desdeX, desdeY, texture);

    herramienta
        .setScale(displayHeight / herramienta.height)
        .setDepth(config.depth ?? 60)
        .setAngle(-12);

    scene.tweens.add({
        targets: herramienta,
        x: hastaX,
        y: hastaY,
        angle: 14,
        duration: 220,
        ease: "Sine.Out",
        onComplete: () => {
            config.onComplete?.();

            scene.tweens.add({
                targets: herramienta,
                x: desdeX,
                y: desdeY,
                angle: -12,
                alpha: 0,
                duration: 260,
                ease: "Sine.In",
                onComplete: () => herramienta.destroy()
            });
        }
    });

    return herramienta;
}
