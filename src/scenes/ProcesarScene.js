import Phaser from "phaser";
import HarvestLevelCard from "../ui/HarvestLevelCard";
import ProgressManager from "../managers/ProgressManager";
import AudioSettingsManager from "../managers/AudioSettingsManager";

export default class ProcesarScene extends Phaser.Scene {

    constructor() {
        super("ProcesarScene");
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
            0x7D2C77,
            0.22
        );

        sombra.setStrokeStyle(9, 0x461245, 0.35);

        const panel = this.add.rectangle(
            this.width * 0.52,
            this.height * 0.49,
            this.width * 0.62,
            this.height * 0.82,
            0x7D2C77,
            1
        );

        panel.setStrokeStyle(9, 0x461245, 1);

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

        // Reutiliza el guía ya aprobado del módulo Mantener: la pose de
        // indicaciones sirve igual aquí y evita un personaje nuevo.
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
            "PROCESAR",
            {
                fontFamily: "Trebuchet MS",
                fontSize: `${this.height * 0.055}px`,
                color: "#FFF7D8",
                fontStyle: "bold",
                stroke: "#461245",
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

    /**
     * Los cuatro niveles siguen el orden real del beneficio del cacao:
     * secado, tostado, descascarillado y molienda. Cada uno estrena su propia
     * mecánica: arrastrar a destino, sostener un equilibrio, encadenar dos
     * gestos y girar en círculos.
     */
    crearNiveles() {

        const procesar = this.progress.procesar;

        const niveles = [
            {
                x: this.width * 0.42,
                y: this.height * 0.34,
                label: "SECAR GRANOS",
                iconTexture: "CanastaSecadoBuenos",
                unlocked: procesar.secado.unlocked,
                stars: procesar.secado.stars,
                onClick: () => this.scene.start("SecarGranosScene")
            },
            {
                x: this.width * 0.63,
                y: this.height * 0.34,
                label: "TOSTAR",
                iconTexture: "GranoSecoBueno",
                unlocked: procesar.tostado.unlocked,
                stars: procesar.tostado.stars,
                onClick: () => this.scene.start("TostarScene")
            },
            {
                x: this.width * 0.42,
                y: this.height * 0.69,
                label: "DESCASCARILLAR",
                iconTexture: "GranoSecoAgrietado",
                unlocked: procesar.descascarillado.unlocked,
                stars: procesar.descascarillado.stars,
                onClick: () => this.scene.start("DescascarillarScene")
            },
            {
                x: this.width * 0.63,
                y: this.height * 0.69,
                label: "MOLER",
                iconTexture: "TazonChocolate",
                unlocked: procesar.molienda.unlocked,
                stars: procesar.molienda.stars,
                onClick: () => this.scene.start("MolerScene")
            }
        ];

        niveles.forEach((nivel, indice) => {
            new HarvestLevelCard(this, {
                ...nivel,
                // Provisional: se apaga cuando existan los botones btnIcono*
                // con el nombre del nivel dibujado, como en Cosecha.
                showLabel: true,
                // Un nivel sin escena todavía está "próximamente"; uno ya
                // construido pero cerrado espera al anterior.
                lockedMessage: nivel.onClick
                    ? "COMPLETA EL ANTERIOR"
                    : "PRÓXIMAMENTE",
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
        AudioSettingsManager.applyToMusic(musica);

    }

    detenerMusica() {

        const musica = this.sound.get("musicaFondo");

        if (musica) {
            musica.stop();
            musica.destroy();
        }

    }

}
