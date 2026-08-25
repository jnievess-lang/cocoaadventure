import Phaser from "phaser";

/**
 * Paleta de herramientas del nivel "Cuidado correcto". Cada herramienta lleva
 * icono y etiqueta escrita, para que la elección no dependa solo del color ni
 * del audio.
 */
export default class SelectorHerramienta extends Phaser.GameObjects.Container {

    constructor(scene, config) {
        super(scene, 0, 0);
        scene.add.existing(this);

        this.config = config;
        this.habilitado = false;
        this.botones = new Map();

        const ancho = scene.scale.width;
        const alto = scene.scale.height;
        const cantidad = config.herramientas.length;
        const separacion = ancho * (config.separacion ?? 0.13);
        const inicioX = config.x - (separacion * (cantidad - 1)) / 2;

        config.herramientas.forEach((herramienta, indice) => {
            this.crearBoton(
                herramienta,
                inicioX + separacion * indice,
                config.y,
                ancho,
                alto
            );
        });

        this.setDepth(config.depth ?? 55);
    }

    crearBoton(herramienta, x, y, ancho, alto) {
        const contenedor = this.scene.add.container(x, y);

        const fondo = this.scene.add.rectangle(
            0,
            0,
            ancho * 0.105,
            alto * 0.20,
            0xFFF1C6,
            0.96
        );

        fondo.setStrokeStyle(Math.max(4, alto * 0.005), 0x7C431B, 1);

        const icono = this.scene.add.image(
            0,
            -alto * 0.025,
            herramienta.textura
        );

        icono.setScale((alto * 0.095) / icono.height);

        const etiqueta = this.scene.add.text(
            0,
            alto * 0.055,
            herramienta.etiqueta,
            {
                fontFamily: "Trebuchet MS",
                fontSize: `${alto * 0.021}px`,
                color: "#5F3215",
                fontStyle: "bold",
                align: "center",
                wordWrap: { width: ancho * 0.10 }
            }
        ).setOrigin(0.5);

        const zonaTactil = this.scene.add.rectangle(
            0,
            0,
            ancho * 0.115,
            alto * 0.23,
            0xFFFFFF,
            0.001
        );

        zonaTactil.on("pointerdown", () => {
            if (!this.habilitado) return;

            if (this.scene.cache.audio.exists("sfxBotonTocar")) {
                this.scene.sound.play("sfxBotonTocar", { volume: 1 });
            }

            contenedor.setScale(0.95);
        });

        zonaTactil.on("pointerout", () => contenedor.setScale(1));

        zonaTactil.on("pointerup", () => {
            if (!this.habilitado) return;

            contenedor.setScale(1);
            this.config.onSeleccionar?.(herramienta.clave, contenedor);
        });

        contenedor.add([fondo, icono, etiqueta, zonaTactil]);
        this.add(contenedor);

        this.botones.set(herramienta.clave, {
            contenedor,
            fondo,
            icono,
            zonaTactil
        });
    }

    obtenerPosicion(clave) {
        const boton = this.botones.get(clave);

        if (!boton) return null;

        return { x: boton.contenedor.x, y: boton.contenedor.y };
    }

    destacarError(clave) {
        const boton = this.botones.get(clave);

        if (!boton) return;

        boton.fondo.setFillStyle(0xF6C7B4, 0.96);

        this.scene.tweens.add({
            targets: boton.contenedor,
            x: boton.contenedor.x - this.scene.scale.width * 0.006,
            duration: 60,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                boton.contenedor.x = this.obtenerPosicionOriginal(clave);
                boton.fondo.setFillStyle(0xFFF1C6, 0.96);
            }
        });
    }

    obtenerPosicionOriginal(clave) {
        const indice = this.config.herramientas.findIndex(
            herramienta => herramienta.clave === clave
        );

        const separacion = this.scene.scale.width * (this.config.separacion ?? 0.13);
        const cantidad = this.config.herramientas.length;
        const inicioX = this.config.x - (separacion * (cantidad - 1)) / 2;

        return inicioX + separacion * indice;
    }

    habilitar() {
        this.habilitado = true;

        this.botones.forEach(boton => {
            boton.zonaTactil.setInteractive({ useHandCursor: true });
        });
    }

    deshabilitar() {
        this.habilitado = false;

        this.botones.forEach(boton => {
            boton.zonaTactil.disableInteractive();
            boton.contenedor.setScale(1);
        });
    }

}
