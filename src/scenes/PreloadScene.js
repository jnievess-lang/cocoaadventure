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

        // Módulo Cosecha y minijuego: seleccionar mazorcas maduras
        this.load.image("FondoFincaCacao", "images/background/FondoFincaCacao.webp");
        this.load.image("ArbolCacaoSeleccion", "images/decorations/ArbolCacaoSeleccion.webp");
        this.load.image("CacaitoCosechando", "images/characters/CacaitoCosechando.webp");
        this.load.image("MazorcaMaduraAmarilla", "images/objects/MazorcaMaduraAmarilla.webp");
        this.load.image("MazorcaMaduraNaranja", "images/objects/MazorcaMaduraNaranja.webp");
        this.load.image("MazorcaVerde", "images/objects/MazorcaVerde.webp");
        this.load.image("MazorcaDanada", "images/objects/MazorcaDanada.webp");
        this.load.image("IndicadorCorrecto", "images/ui/IndicadorCorrecto.webp");
        this.load.image("IndicadorEspera", "images/ui/IndicadorEspera.webp");
        this.load.image("CandadoNivel", "images/ui/CandadoNivel.webp");
        this.load.image("CorazonLleno", "images/ui/CorazonLleno.png");
        this.load.image("CorazonVacio", "images/ui/CorazonVacio.png");
        this.load.image("PanelTemporizador", "images/ui/PanelTemporizador.png");
        this.load.image("btnRepetirAudio", "images/ui/btnRepetirAudio.png");
        this.load.image("btnIconoMazorcasListas", "images/buttons/btnIconoMazorcasListas.png");

        // Módulo Cosecha: Nivel 2, corte cuidadoso
        this.load.image("btnIconoCorteCuidadoso", "images/buttons/btnIconoCorteCuidadoso.png");
        this.load.image("RamaMazorcaCorte", "images/minigames/cosechar/corte-cuidadoso/RamaMazorcaCorte.webp");
        this.load.image("RamaCortadaCorte", "images/minigames/cosechar/corte-cuidadoso/RamaCortadaCorte.webp");
        this.load.image("MazorcaDesprendidaCorte", "images/minigames/cosechar/corte-cuidadoso/MazorcaDesprendidaCorte.webp");
        this.load.image("TijeraPodaAbierta", "images/objects/TijeraPodaAbierta.webp");
        this.load.image("TijeraPodaCerrada", "images/objects/TijeraPodaCerrada.webp");
        this.load.image("btnMantenerCorte", "images/buttons/btnMantenerCorte.png");

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

        // Módulo Sembrar: Nivel 2 - Preparar tierra
        this.load.image("Fertilizante", "images/objects/Fertilizante.png");
        this.load.image("FertilizanteCortado", "images/objects/FertilizanteCortado.png");
        this.load.image("Insecticida", "images/objects/Insecticida.png");
        this.load.image("InsecticidaCortado", "images/objects/InsecticidaCortado.png");
        this.load.image("Bomba", "images/objects/Bomba.png");
        this.load.image("Explosion", "images/objects/Explosion.png");

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

        this.load.audio("musicaFondo", "audio/music/MusicaFondo.mp3");
        this.load.audio("sfxAvisoTiempo", "audio/sfx/AvisoTiempo.mp3");
        this.load.audio("sfxBotonTocar", "audio/sfx/BotonTocar.m4a");
        this.load.audio("sfxDerrota", "audio/sfx/Derrota.mp3");
        this.load.audio("sfxEstrellaResultado", "audio/sfx/EstrellaResultado.mp3");
        this.load.audio("sfxSeleccionCorrecta", "audio/sfx/SeleccionCorrecta.mp3");
        this.load.audio("sfxSeleccionIncorrecta", "audio/sfx/SeleccionIncorrecta.mp3");
        this.load.audio("vozSeleccionMadurasInstruccion", "audio/voice/SeleccionMadurasInstruccion.mp3");
        this.load.audio("vozSeleccionMadurasVerde", "audio/voice/SeleccionMadurasVerde.mp3");
        this.load.audio("vozSeleccionMazorcaDaniada", "audio/voice/SeleccionMazorcaDaniada.mp3");
        this.load.audio("vozSeleccionMadurasCompletado", "audio/voice/SeleccionMadurasCompletado.mp3");
        this.load.audio("vozSeleccionMadurasTiempoAgotado", "audio/voice/SeleccionMadurasTiempoAgotado.mp3");
        this.load.audio("sfxCorteTijera", "audio/sfx/CorteTijera.mp3");
        this.load.audio("vozCorteCuidadosoInstruccion", "audio/voice/CorteCuidadosoInstruccion.mp3");
        this.load.audio("vozCorteCuidadosoPuntoIncorrecto", "audio/voice/CorteCuidadosoPuntoIncorrecto.mp3");
        this.load.audio("vozCorteCuidadosoFuerzaBaja", "audio/voice/CorteCuidadosoFuerzaBaja.mp3");
        this.load.audio("vozCorteCuidadosoFuerzaAlta", "audio/voice/CorteCuidadosoFuerzaAlta.mp3");
        this.load.audio("vozCorteCuidadosoCompletado", "audio/voice/CorteCuidadosoCompletado.mp3");
        this.load.audio("vozCorteCuidadosoTiempoAgotado", "audio/voice/CorteCuidadosoTiempoAgotado.mp3");
        this.load.audio("vozPrepararTierra", "audio/voice/PrepararTierra.mp3");
    }

    create() {

        console.log("PreloadScene iniciada");

        this.scene.start("MainMenuScene");
    }
}
