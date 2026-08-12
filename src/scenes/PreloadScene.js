import Phaser from "phaser";

export default class PreloadScene extends Phaser.Scene {

    constructor() {
        super("PreloadScene");
    }

    preload() {
         // Menú principal
        this.load.image("logo", "images/ui/logoCocoaAdventure.png");
        this.load.image("btnPlay", "images/buttons/btnPlay.png");
        this.load.image("btnLogros", "images/buttons/btnLogros.png");
        this.load.image("btnConfiguracion", "images/buttons/btnConfiguracion.png");

        // Pantalla de módulos
        this.load.image("btnRegresar", "images/buttons/btnRegresar.png");

        this.load.image("btnSembrarModulo", "images/modules/btnSembrarModulo.png");
        this.load.image("btnMantenerModulo", "images/modules/btnMantenerModulo.png");
        this.load.image("btnCosecharModulo", "images/modules/btnCosecharModulo.png");
        this.load.image("btnProcesarModulo", "images/modules/btnProcesarModulo.png");

        this.load.image("CacaitoModulo", "images/characters/CacaitoModulo.png");
        this.load.image("ArbolEsquinaSuperiorDerecha", "images/decorations/ArbolEsquinaSuperiorDerecha.png");
        this.load.image("ArbolEsquinaSuperiorIzquierda","images/decorations/ArbolEsquinaSuperiorIzquierda.png");

        // Modulo Sembrar
        this.load.image("btnLimpiarTerreno", "images/buttons/btnLimpiarTerreno.png");
        this.load.image("btnPrepararTierra", "images/buttons/btnPrepararTierra.png");
        this.load.image("btnPlantarPlantula", "images/buttons/btnPlantarPlantula.png");
        this.load.image("CacaitoSembrando", "images/characters/CacaitoSembrando.png");

        this.load.image("EstrellaLlena", "images/ui/EstrellaLlena.png");
        this.load.image("EstrellaVacia", "images/ui/EstrellaVacia.png");

        // Modulo Sembrar: Nivel 1
        this.load.image(
            "MosaicoTierra",
            "/images/background/MozaicoTierra.png"
        );

        this.load.image(
            "MosaicoCesped",
            "/images/background/MozaicoCesped.png"
        );

        // Objetos
        this.load.image(
            "Piedra",
            "/images/objects/Piedra.png"
        );

        this.load.image(
            "Hoja",
            "/images/objects/Hoja.png"
        );

        // Botón
        this.load.image(
            "btnPausa",
            "/images/ui/btnPausa.png"
        );

        //Cacaito Indicaciones Limpiar terreno
        this.load.image(
            "GloboTexto",
            "images/ui/GloboTexto.png"
        );

        this.load.image(
            "CacaitoIndicaciones",
            "images/characters/CacaitoIndicaciones.png"
        );

        //Audios
        this.load.audio(
            "vozLimpiarTerreno",
            "audio/voice/LimpiarTerreno.mp3"
        );
    }

    create() {

        console.log("PreloadScene iniciada");

        this.scene.start("MainMenuScene");
    }
}