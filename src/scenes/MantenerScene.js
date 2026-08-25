import Phaser from "phaser";
import HarvestLevelCard from "../ui/HarvestLevelCard";
import ProgressManager from "../managers/ProgressManager";

export default class MantenerScene extends Phaser.Scene {

    constructor() {
        super("MantenerScene");
    }

    create() {

        const { width, height } = this.scale;

        this.width = width;
        this.height = height;
        this.progress = ProgressManager.load();

        this.crearFondo();
        this.crearPanel();
        this.crearDecoraciones();
        this.crearTitulo();
        this.crearBotonRegresar();
        this.crearNiveles();
        this.asegurarMusica();

    }

    crearFondo() {

        this.cameras.main.setBackgroundColor("#8FD3FF");

        const sol = this.add.circle(
            this.width * 0.09,
            this.height * 0.13,
            this.height * 0.075,
            0xFFF2A8,
            0.8
        );

        sol.setStrokeStyle(12, 0xFFFFFF, 0.25);

    }

    crearPanel() {

        const sombra = this.add.rectangle(
            this.width * 0.53,
            this.height * 0.51,
            this.width * 0.63,
            this.height * 0.84,
            0x1C5B3A,
            0.22
        );

        sombra.setStrokeStyle(9, 0x27784E, 0.35);

        const panel = this.add.rectangle(
            this.width * 0.52,
            this.height * 0.49,
            this.width * 0.62,
            this.height * 0.82,
            0x3FA469,
            1
        );

        panel.setStrokeStyle(9, 0x27784E, 1);

    }

    crearDecoraciones() {

        const arbol = this.add.image(
            this.width,
            0,
            "ArbolEsquinaSuperiorDerecha"
        );

        arbol
            .setOrigin(1, 0)
            .setScale((this.width * 0.24) / arbol.width);

        const guia = this.add.image(0, this.height, "CacaitoIndicaciones");

        guia
            .setOrigin(0, 1)
            .setScale((this.height * 0.61) / guia.height);

        this.tweens.add({
            targets: guia,
            y: guia.y - this.height * 0.012,
            duration: 1800,
            ease: "Sine.InOut",
            yoyo: true,
            repeat: -1
        });

    }

    crearTitulo() {

        const titulo = this.add.text(
            this.width * 0.52,
            this.height * 0.125,
            "MANTENIMIENTO",
            {
                fontFamily: "Trebuchet MS",
                fontSize: `${this.height * 0.055}px`,
                color: "#FFF7D8",
                fontStyle: "bold",
                stroke: "#1E5B39",
                strokeThickness: 8
            }
        );

        titulo.setOrigin(0.5);

    }

    crearBotonRegresar() {

        const boton = this.add.image(
            this.width * 0.07,
            this.height * 0.09,
            "btnRegresar"
        );

        const escalaBase = (this.width * 0.085) / boton.width;

        boton
            .setScale(escalaBase)
            .setInteractive({ useHandCursor: true });

        boton.on("pointerdown", () => {
            this.sound.play("sfxBotonTocar", { volume: 1 });
            boton.setScale(escalaBase * 0.95);
        });

        boton.on("pointerout", () => boton.setScale(escalaBase));

        boton.on("pointerup", () => {
            boton.setScale(escalaBase);
            this.detenerMusica();
            this.scene.start("ModulesScene");
        });

    }

    crearNiveles() {

        const mantener = this.progress.mantener;

        const niveles = [
            {
                x: this.width * 0.42,
                y: this.height * 0.34,
                label: "REGAR",
                iconTexture: "IconoRegadera",
                unlocked: mantener.regar.unlocked,
                stars: mantener.regar.stars,
                onClick: () => this.scene.start("RegarScene")
            },
            {
                x: this.width * 0.63,
                y: this.height * 0.34,
                label: "QUITAR MALEZAS",
                iconTexture: "TijeraPodaAbierta",
                unlocked: mantener.malezas.unlocked,
                stars: mantener.malezas.stars,
                onClick: () => this.scene.start("MalezasScene")
            },
            {
                x: this.width * 0.42,
                y: this.height * 0.69,
                label: "BUSCAR PLAGAS",
                iconTexture: "IconoLupa",
                unlocked: mantener.plagas.unlocked,
                stars: mantener.plagas.stars,
                onClick: () => this.scene.start("PlagasScene")
            },
            {
                x: this.width * 0.63,
                y: this.height * 0.69,
                label: "CUIDADO CORRECTO",
                iconTexture: "IconoFungicida",
                unlocked: mantener.cuidadoCorrecto.unlocked,
                stars: mantener.cuidadoCorrecto.stars,
                onClick: () => this.scene.start("CuidadoCorrectoScene")
            }
        ];

        niveles.forEach((nivel, indice) => {
            new HarvestLevelCard(this, {
                ...nivel,
                // Provisional: se apaga cuando existan los botones btnIcono*
                // con el nombre del nivel dibujado, como en Cosecha.
                showLabel: true,
                lockedMessage: "COMPLETA EL ANTERIOR",
                delay: 90 * indice
            });
        });

    }

    asegurarMusica() {

        let musica = this.sound.get("musicaFondo");

        if (!musica) {
            musica = this.sound.add("musicaFondo", {
                loop: true,
                volume: 0.22
            });
        }

        if (!musica.isPlaying) musica.play();

        musica.setVolume(0.22);

    }

    detenerMusica() {

        const musica = this.sound.get("musicaFondo");

        if (musica) {
            musica.stop();
            musica.destroy();
        }

    }

}
