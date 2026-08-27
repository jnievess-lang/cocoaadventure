import Phaser from "phaser";

export default class PreloadScene extends Phaser.Scene {

    constructor() {
        super("PreloadScene");
    }

    preload() {
        window.actualizarPantallaCarga?.(0, "Preparando la aventura...");

        this.load.on("progress", progress => {
            window.actualizarPantallaCarga?.(progress);
        });

        this.load.once("complete", () => {
            window.actualizarPantallaCarga?.(1, "¡Todo listo!");
        });

         // Menú principal
        this.load.image("logo", "images/ui/logoCocoaAdventure.png");
        this.load.image("btnPlay", "images/buttons/btnPlay.png");
        this.load.image("btnLogros", "images/buttons/btnLogros.png");
        this.load.image("btnConfiguracion", "images/buttons/btnConfiguracion.png");

        // Pantalla de módulos
        this.load.image("btnRegresar", "images/buttons/btnRegresar.png");

        // Pantalla de configuración
        this.load.image("fondoConfiguracion", "images/background/fondoConfiguracion.png");
        this.load.image("TableroConfiguracion", "images/ui/TableroConfiguracion.png");

        // Pantalla de logros
        this.load.image("FondoTrofeos", "images/background/FondoTrofeos.png");
        this.load.image("StandTrofeos", "images/achievements/StandTrofeos.png");
        this.load.image("trofeoSembrar", "images/achievements/trofeosembrar.png");
        this.load.image("trofeoMantener", "images/achievements/trofeomantener.png");
        this.load.image("trofeoCosechar", "images/achievements/trofeocosechar.png");
        this.load.image("trofeoProcesar", "images/achievements/trofeoprocesar.png");

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
        this.load.image("ManoIndicadoraTutorial", "images/ui/ManoIndicadoraTutorial.png");
        this.load.image("btnIconoMazorcasListas", "images/buttons/btnIconoMazorcasListas.png");

        // Módulo Cosecha: Nivel 2, corte cuidadoso
        this.load.image("btnIconoCorteCuidadoso", "images/buttons/btnIconoCorteCuidadoso.png");
        this.load.image("RamaMazorcaCorte", "images/minigames/cosechar/corte-cuidadoso/RamaMazorcaCorte.webp");
        this.load.image("RamaCortadaCorte", "images/minigames/cosechar/corte-cuidadoso/RamaCortadaCorte.webp");
        this.load.image("MazorcaDesprendidaCorte", "images/minigames/cosechar/corte-cuidadoso/MazorcaDesprendidaCorte.webp");
        this.load.image("TijeraPodaAbierta", "images/objects/TijeraPodaAbierta.webp");
        this.load.image("TijeraPodaCerrada", "images/objects/TijeraPodaCerrada.webp");
        this.load.image("btnMantenerCorte", "images/buttons/btnMantenerCorte.png");

        // Módulo Cosecha: Nivel 3, abrir mazorcas
        this.load.image("btnIconoAbrirMazorcas", "images/buttons/btnIconoAbrirMazorcas.png");
        this.load.image("MazorcaAmarillaMitadIzquierda", "images/minigames/cosechar/abrir-mazorcas/MazorcaAmarillaMitadIzquierda.webp");
        this.load.image("MazorcaAmarillaMitadDerecha", "images/minigames/cosechar/abrir-mazorcas/MazorcaAmarillaMitadDerecha.webp");
        this.load.image("MazorcaNaranjaMitadIzquierda", "images/minigames/cosechar/abrir-mazorcas/MazorcaNaranjaMitadIzquierda.webp");
        this.load.image("MazorcaNaranjaMitadDerecha", "images/minigames/cosechar/abrir-mazorcas/MazorcaNaranjaMitadDerecha.webp");

        // Módulo Cosecha: Nivel 4, clasificar semillas
        this.load.image("btnIconoClasificarSemillas", "images/buttons/btnIconoClasificarSemillas.png");
        this.load.image("SemillaCacaoBuena", "images/objects/SemillaCacaoBuena.webp");
        this.load.image("SemillaCacaoDanada", "images/objects/SemillaCacaoDanada.webp");
        this.load.image("BombaSemillas", "images/objects/BombaSemillas.webp");
        this.load.image("CanastaSemillas", "images/objects/CanastaSemillas.webp");
        this.load.image("CanastaSemillasBuenasNivel1", "images/objects/CanastaSemillasBuenasNivel1.webp");
        this.load.image("CanastaSemillasBuenasNivel2", "images/objects/CanastaSemillasBuenasNivel2.webp");
        this.load.image("CanastaSemillasBuenasNivel3", "images/objects/CanastaSemillasBuenasNivel3.webp");
        this.load.image("CanastaSemillasDanadasNivel1", "images/objects/CanastaSemillasDanadasNivel1.webp");
        this.load.image("CanastaSemillasDanadasNivel2", "images/objects/CanastaSemillasDanadasNivel2.webp");
        this.load.image("CanastaSemillasDanadasNivel3", "images/objects/CanastaSemillasDanadasNivel3.webp");
        this.load.image("MarcoTableroSemillas", "images/minigames/cosechar/clasificar-semillas/MarcoTableroSemillas.webp");
        this.load.image("CeldaTableroSemillas", "images/minigames/cosechar/clasificar-semillas/CeldaTableroSemillas.webp");

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

        // Módulo Sembrar: Nivel 3 - Plantar plántula
        this.load.image("HuecoTierra", "images/objects/huecoTierra.png");
        this.load.image("PlantulaCacao", "images/objects/PlantulaCacao.png");
        this.load.image("PlantulaCacaoCayendo", "images/objects/plantulaCacaoCayendo.png");
        this.load.image("PlantulaCacaoCaida", "images/objects/plantulaCacaoCaida.png");

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
        this.load.audio("sfxAperturaMazorca", "audio/sfx/AperturaMazorca.m4a");
        this.load.audio("vozAbrirMazorcasInstruccion", "audio/voice/AbrirMazorcasInstruccion.mp3");
        this.load.audio("vozAbrirMazorcasCompletado", "audio/voice/AbrirMazorcasCompletado.mp3");
        this.load.audio("vozAbrirMazorcasTiempoAgotado", "audio/voice/AbrirMazorcasTiempoAgotado.mp3");
        this.load.audio("sfxConectarSemilla", "audio/sfx/ConectarSemilla.mp3");
        this.load.audio("sfxRecolectarSemillas", "audio/sfx/RecolectarSemillas.m4a");
        this.load.audio("sfxBombaSemillas", "audio/sfx/BombaSemillas.m4a");
        this.load.audio("vozClasificarSemillasInstruccion", "audio/voice/ClasificarSemillasInstruccion.mp3");
        this.load.audio("vozClasificarSemillasCompletado", "audio/voice/ClasificarSemillasCompletado.mp3");
        this.load.audio("vozClasificarSemillasTiempoAgotado", "audio/voice/ClasificarSemillasTiempoAgotado.mp3");
        this.load.audio("vozPrepararTierra", "audio/voice/PrepararTierra.mp3");
        this.load.audio("vozPlantarPlantula", "audio/voice/PlantarPlantula.mp3");

        // ==========================
        // Módulo Mantener
        // ==========================

        // Reutiliza los recursos ya aprobados de Cosecha: FondoFincaCacao,
        // ArbolCacaoSeleccion, las mazorcas, TijeraPodaAbierta e
        // IndicadorCorrecto. Aquí solo se registra lo que es propio del módulo.

        // Herramientas
        this.load.image("IconoRegadera", "images/icons/IconoRegadera.webp");
        this.load.image("IconoGuantes", "images/icons/IconoGuantes.webp");
        this.load.image("IconoLupa", "images/icons/IconoLupa.webp");
        this.load.image("IconoFungicida", "images/icons/IconoFungicida.webp");

        // Estados de la planta
        this.load.image("PlantaSana", "images/objects/PlantaSana.webp");
        this.load.image("PlantaMarchita", "images/objects/PlantaMarchita.webp");
        this.load.image("PlantaHongos", "images/objects/PlantaHongos.webp");
        this.load.image("PlantaPlagas", "images/objects/PlantaPlagas.webp");

        // Malezas
        this.load.image("MalezaFlor", "images/objects/MalezaFlor.webp");
        this.load.image("PastoSeco", "images/objects/PastoSeco.webp");

        // Plagas y enfermedades
        this.load.image("Pulgon", "images/objects/Pulgon.webp");
        this.load.image("Gusano", "images/objects/Gusano.webp");
        this.load.image("HojaManchada", "images/objects/HojaManchada.webp");
        this.load.image("EscobaBruja", "images/objects/EscobaBruja.webp");

        // Retroalimentación visual
        this.load.image("IndicadorError", "images/ui/IndicadorError.webp");

        // Voces del módulo Mantener (es-EC-AndreaNeural).
        // Ver docs/voces_mantener.md para los guiones aprobados.
        this.load.audio("vozRegarInstruccion", "audio/voice/RegarInstruccion.mp3");
        this.load.audio("vozRegarAyuda", "audio/voice/RegarAyuda.mp3");
        this.load.audio("vozRegarCompletado", "audio/voice/RegarCompletado.mp3");
        this.load.audio("vozRegarTiempoAgotado", "audio/voice/RegarTiempoAgotado.mp3");

        this.load.audio("vozMalezasInstruccion", "audio/voice/MalezasInstruccion.mp3");
        this.load.audio("vozMalezasAyuda", "audio/voice/MalezasAyuda.mp3");
        this.load.audio("vozMalezasCompletado", "audio/voice/MalezasCompletado.mp3");
        this.load.audio("vozMalezasTiempoAgotado", "audio/voice/MalezasTiempoAgotado.mp3");

        this.load.audio("vozPlagasInstruccion", "audio/voice/PlagasInstruccion.mp3");
        this.load.audio("vozPlagasAyuda", "audio/voice/PlagasAyuda.mp3");
        this.load.audio("vozPlagasCompletado", "audio/voice/PlagasCompletado.mp3");
        this.load.audio("vozPlagasTiempoAgotado", "audio/voice/PlagasTiempoAgotado.mp3");

        this.load.audio("vozCuidadoCorrectoInstruccion", "audio/voice/CuidadoCorrectoInstruccion.mp3");
        this.load.audio("vozCuidadoCorrectoAyuda", "audio/voice/CuidadoCorrectoAyuda.mp3");
        this.load.audio("vozCuidadoCorrectoCompletado", "audio/voice/CuidadoCorrectoCompletado.mp3");
        this.load.audio("vozCuidadoCorrectoTiempoAgotado", "audio/voice/CuidadoCorrectoTiempoAgotado.mp3");

        // ==========================
        // Módulo Procesar
        // ==========================

        // Reutiliza de Cosecha: SemillaCacaoBuena como nib limpio,
        // IndicadorCorrecto e IndicadorError, y todo el HUD.

        // Fondos de los cuatro niveles
        this.load.image("FondoTendalSecado", "images/background/FondoTendalSecado.webp");
        this.load.image("FondoTostadora", "images/background/FondoTostadora.webp");
        this.load.image("FondoDescascarillado", "images/background/FondoDescascarillado.webp");
        this.load.image("FondoMolienda", "images/background/FondoMolienda.webp");

        // Nivel 1: secar granos
        this.load.image("CanastaSecadoVacia", "images/minigames/procesar/secado/CanastaSecadoVacia.webp");
        this.load.image("CanastaSecadoBuenos", "images/minigames/procesar/secado/CanastaSecadoBuenos.webp");
        this.load.image("CanastaSecadoDanados", "images/minigames/procesar/secado/CanastaSecadoDanados.webp");
        this.load.image("GranoSecoBueno", "images/minigames/procesar/secado/GranoSecoBueno.webp");
        this.load.image("GranoSecoAgrietado", "images/minigames/procesar/secado/GranoSecoAgrietado.webp");

        // Nivel 2: tostar
        this.load.image("BarraTueste", "images/minigames/procesar/tostado/BarraTueste.webp");

        // Nivel 4: moler
        this.load.image("Molino", "images/minigames/procesar/molienda/Molino.webp");
        this.load.image("TazonChocolate", "images/minigames/procesar/molienda/TazonChocolate.webp");
        this.load.image("BarraChocolate", "images/minigames/procesar/molienda/BarraChocolate.webp");
        this.load.image("Azucar", "images/minigames/procesar/molienda/Azucar.webp");
        this.load.image("Leche", "images/minigames/procesar/molienda/Leche.webp");
        this.load.image("MantecaCacao", "images/minigames/procesar/molienda/MantecaCacao.webp");

        // Voces del módulo Procesar (es-EC-AndreaNeural, generadas en ttsfree).
        // Ver docs/plan_procesar.md para los guiones aprobados.
        [
            "SecarGranos",
            "Tostar",
            "Descascarillar",
            "Moler"
        ].forEach(nivel => {
            ["Instruccion", "Ayuda", "Completado", "TiempoAgotado"].forEach(tipo => {
                this.load.audio(
                    `voz${nivel}${tipo}`,
                    `audio/voice/${nivel}${tipo}.mp3`
                );
            });
        });
    }

    create() {

        console.log("PreloadScene iniciada");

        this.scene.start("MainMenuScene");
    }
}
