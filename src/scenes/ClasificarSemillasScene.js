import Phaser from "phaser";
import HudMinijuego from "../ui/HudMinijuego";
import GestorAudioMinijuego from "../managers/GestorAudioMinijuego";
import GestorTrayectoriaSemillas from "../managers/GestorTrayectoriaSemillas";
import TutorialPanel from "../ui/TutorialPanel";
import ResultPanel from "../ui/ResultPanel";
import TableroClasificacionSemillas from "../ui/TableroClasificacionSemillas";
import CanastaSemillas from "../ui/CanastaSemillas";
import ProgressManager from "../managers/ProgressManager";

export const CONFIGURACION_NIVEL = Object.freeze({
    filas: 7,
    columnas: 7,
    minimoTrayectoria: 3,
    objetivoBuenas: 12,
    objetivoDanadas: 12,
    duracionSegundos: 90,
    vidasMaximas: 3,
    estrellasMaximas: 3,
    cantidadBombas: 2,
    permiteDiagonales: true,
    duracionResolucionMs: 550
});

export default class ClasificarSemillasScene extends Phaser.Scene {

    constructor() {
        super("ClasificarSemillasScene");
    }

    create() {
        this.ancho = this.scale.width;
        this.alto = this.scale.height;
        this.estadoNivel = "tutorial";
        this.estadoAntesSuspension = null;
        this.buenas = 0;
        this.danadas = 0;
        this.resultadoMostrado = false;
        this.ultimoError = -Infinity;

        this.audio = new GestorAudioMinijuego(this);
        this.crearFondo();
        this.crearCanastas();
        this.crearTablero();
        this.crearHud();
        this.crearGestorTrayectoria();
        this.mostrarElementosJuego(false);
        this.audio.ensureMusic();
        this.mostrarTutorial();
        this.configurarCicloDeVida();
    }

    crearFondo() {
        const fondo = this.add.image(this.ancho / 2, this.alto / 2, "FondoFincaCacao");
        fondo.setScale(Math.max(this.ancho / fondo.width, this.alto / fondo.height));
        this.add.rectangle(this.ancho / 2, this.alto / 2, this.ancho, this.alto, 0x173719, 0.17).setDepth(1);
    }

    crearCanastas() {
        const ancho = Math.min(this.ancho * 0.205, this.alto * 0.34);
        const alto = ancho * 0.70;
        const x = this.ancho * 0.82;
        this.canastaBuena = new CanastaSemillas(this, {
            x,
            y: this.alto * 0.37,
            ancho,
            alto,
            tipo: "buena",
            etiqueta: "BUENAS",
            objetivo: CONFIGURACION_NIVEL.objetivoBuenas
        });
        this.canastaDanada = new CanastaSemillas(this, {
            x,
            y: this.alto * 0.72,
            ancho,
            alto,
            tipo: "danada",
            etiqueta: "DAÑADAS",
            objetivo: CONFIGURACION_NIVEL.objetivoDanadas
        });
    }

    crearTablero() {
        const tamano = Math.min(this.alto * 0.72, this.ancho * 0.52);
        this.tablero = new TableroClasificacionSemillas(this, {
            ...CONFIGURACION_NIVEL,
            x: this.ancho * 0.39,
            y: this.alto * 0.57,
            tamano,
            requiereBuenas: () => this.buenas < CONFIGURACION_NIVEL.objetivoBuenas,
            requiereDanadas: () => this.danadas < CONFIGURACION_NIVEL.objetivoDanadas,
            probabilidadBuena: () => {
                const faltaBuena = this.buenas < CONFIGURACION_NIVEL.objetivoBuenas;
                const faltaDanada = this.danadas < CONFIGURACION_NIVEL.objetivoDanadas;
                if (faltaBuena && !faltaDanada) return 0.70;
                if (!faltaBuena && faltaDanada) return 0.30;
                return 0.50;
            },
            alMezclar: () => this.mostrarMensaje("Mezclando semillas…", this.tablero.x, this.tablero.y)
        });
    }

    crearHud() {
        this.hud = new HudMinijuego(this, {
            lives: { maxLives: CONFIGURACION_NIVEL.vidasMaximas },
            timer: { durationSeconds: CONFIGURACION_NIVEL.duracionSegundos },
            controls: {},
            instructionAudio: "vozClasificarSemillasInstruccion",
            audioManager: this.audio,
            onTimeUp: () => this.fallarNivel("tiempo"),
            onLivesEmpty: () => this.fallarNivel("vidas"),
            onGameplaySuspended: razon => this.suspenderJuego(razon),
            onGameplayResumed: razon => this.reanudarJuego(razon),
            onExit: () => this.scene.start("CosecharScene")
        });
    }

    crearGestorTrayectoria() {
        this.gestorTrayectoria = new GestorTrayectoriaSemillas(this, {
            minimoTrayectoria: CONFIGURACION_NIVEL.minimoTrayectoria,
            permiteDiagonales: CONFIGURACION_NIVEL.permiteDiagonales,
            puedeInteractuar: () => ["practica", "jugando"].includes(this.estadoNivel),
            esZonaBloqueada: (x, y) => this.esZonaHud(x, y),
            obtenerFicha: (x, y) => this.tablero.obtenerFichaEnPunto(x, y),
            obtenerTamanoCelda: () => this.tablero.tamanoCelda,
            obtenerTablero: () => this.tablero,
            alConectar: longitud => this.reproducirConexion(longitud),
            alTrayectoriaCorta: seleccion => this.procesarTrayectoriaCorta(seleccion),
            alMezclarTipos: (ficha, seleccion) => this.procesarMezcla(ficha, seleccion),
            alTocarBomba: bomba => this.procesarBomba(bomba),
            alTrayectoriaValida: seleccion => this.procesarTrayectoriaValida(seleccion)
        });
    }

    esZonaHud(x, y) {
        return y <= this.alto * 0.18 || (x >= this.ancho * 0.88 && y >= this.alto * 0.83);
    }

    mostrarElementosJuego(visible) {
        this.hud.setVisible(visible);
        this.tablero.setVisible(visible);
        this.canastaBuena.setVisible(visible);
        this.canastaDanada.setVisible(visible);
    }

    mostrarTutorial() {
        this.audio.duckMusic();
        new TutorialPanel(this, {
            character: "CacaitoIndicaciones",
            text: "Une con tu dedo tres o más semillas del mismo tipo. Coloca las buenas en una canasta y las dañadas en la otra. Evita las bombas.",
            audio: "vozClasificarSemillasInstruccion",
            onVoiceStart: () => this.audio.duckMusic(),
            onVoiceComplete: () => this.audio.restoreMusic(),
            onComplete: () => this.iniciarPractica()
        });
    }

    iniciarPractica() {
        if (this.estadoNivel !== "tutorial") return;
        this.estadoNivel = "practica";
        this.tablero.cargarPractica();
        this.tablero.setVisible(true).setHabilitado(true);
        this.canastaBuena.setVisible(true);
        this.canastaDanada.setVisible(false);
        this.textoPractica = this.add.text(
            this.tablero.x,
            this.alto * 0.93,
            "Une las 3 semillas buenas.",
            {
                fontFamily: "Trebuchet MS",
                fontSize: `${this.alto * 0.035}px`,
                color: "#FFF7D8",
                fontStyle: "bold",
                stroke: "#5F3215",
                strokeThickness: Math.max(6, this.alto * 0.008)
            }
        ).setOrigin(0.5).setDepth(90);
        this.gestorTrayectoria.setHabilitado(true);
    }

    iniciarNivelReal() {
        this.estadoNivel = "jugando";
        this.textoPractica?.destroy();
        this.canastaDanada.setVisible(true);
        this.hud.setVisible(true);
        this.tablero.cargarNivel();
        this.tablero.setHabilitado(true);
        this.gestorTrayectoria.setHabilitado(true);
        this.hud.start();
    }

    reproducirConexion(longitud) {
        if (!this.cache.audio.exists("sfxConectarSemilla")) return;
        this.sound.play("sfxConectarSemilla", {
            volume: 0.30,
            rate: Math.min(1.28, 0.94 + longitud * 0.035)
        });
    }

    procesarTrayectoriaCorta() {
        if (!this.cache.audio.exists("sfxSeleccionIncorrecta")) return;
        this.sound.play("sfxSeleccionIncorrecta", { volume: 0.32 });
        this.mostrarMensaje("Une 3 o más", this.tablero.x, this.tablero.y - this.tablero.tamano * 0.44);
    }

    procesarMezcla(ficha) {
        this.sound.play("sfxSeleccionIncorrecta", { volume: 0.55 });
        this.mostrarMarcaError(this.tablero.x + ficha.x, this.tablero.y + ficha.y);
    }

    procesarTrayectoriaValida(seleccion) {
        if (this.estadoNivel === "practica") {
            this.estadoNivel = "resolviendo";
            this.gestorTrayectoria.setHabilitado(false);
            this.tablero.setHabilitado(false);
            this.reproducirRecoleccion();
            this.tablero.resolverTrayectoria(
                seleccion,
                this.canastaBuena.obtenerDestino(),
                CONFIGURACION_NIVEL.duracionResolucionMs,
                () => this.iniciarNivelReal()
            );
            return;
        }
        if (this.estadoNivel !== "jugando") return;

        const tipo = seleccion[0].tipo;
        const cantidad = seleccion.length;
        const canasta = tipo === "buena" ? this.canastaBuena : this.canastaDanada;
        if (tipo === "buena") {
            this.buenas = Math.min(CONFIGURACION_NIVEL.objetivoBuenas, this.buenas + cantidad);
            this.canastaBuena.establecerValor(this.buenas);
        }
        else {
            this.danadas = Math.min(CONFIGURACION_NIVEL.objetivoDanadas, this.danadas + cantidad);
            this.canastaDanada.establecerValor(this.danadas);
        }

        this.estadoNivel = "resolviendo";
        this.bloquearMatrizDuranteResolucion();
        this.reproducirRecoleccion();
        this.tablero.resolverTrayectoria(
            seleccion,
            canasta.obtenerDestino(),
            CONFIGURACION_NIVEL.duracionResolucionMs,
            () => this.finalizarResolucion()
        );
    }

    procesarBomba(bomba) {
        if (this.estadoNivel !== "jugando") return;
        this.reproducirBomba();
        const vidas = this.hud.loseLife();
        if (vidas <= 0 || this.resultadoMostrado) return;

        this.estadoNivel = "resolviendo";
        this.bloquearMatrizDuranteResolucion();
        this.tablero.resolverBomba(
            bomba,
            CONFIGURACION_NIVEL.duracionResolucionMs,
            () => this.finalizarResolucion()
        );
    }

    bloquearMatrizDuranteResolucion() {
        this.hud.pausarTemporizador();
        this.tablero.setHabilitado(false);
        this.gestorTrayectoria.setHabilitado(false);
    }

    finalizarResolucion() {
        if (this.resultadoMostrado) return;
        if (
            this.buenas >= CONFIGURACION_NIVEL.objetivoBuenas &&
            this.danadas >= CONFIGURACION_NIVEL.objetivoDanadas
        ) {
            this.completarNivel();
            return;
        }
        this.estadoNivel = "jugando";
        this.tablero.setHabilitado(true);
        this.gestorTrayectoria.setHabilitado(true);
        this.hud.reanudarTemporizador();
    }

    reproducirRecoleccion() {
        this.sonidoRecoleccion?.stop();
        this.sonidoRecoleccion?.destroy();
        this.sonidoRecoleccion = this.sound.add("sfxRecolectarSemillas", { volume: 1 });
        this.sonidoRecoleccion.once("complete", () => {
            this.sonidoRecoleccion?.destroy();
            this.sonidoRecoleccion = null;
        });
        this.sonidoRecoleccion.play();
    }

    reproducirBomba() {
        this.sonidoBomba?.stop();
        this.sonidoBomba?.destroy();
        this.sonidoBomba = this.sound.add("sfxBombaSemillas", { volume: 0.55 });
        this.sonidoBomba.once("complete", () => {
            this.sonidoBomba?.destroy();
            this.sonidoBomba = null;
        });
        this.sonidoBomba.play();
    }

    mostrarMarcaError(x, y) {
        const marca = this.add.text(x, y, "×", {
            fontFamily: "Trebuchet MS",
            fontSize: `${this.alto * 0.10}px`,
            color: "#E44737",
            fontStyle: "bold",
            stroke: "#FFFFFF",
            strokeThickness: Math.max(5, this.alto * 0.007)
        }).setOrigin(0.5).setDepth(100).setScale(0.3);
        this.tweens.add({ targets: marca, scale: 1, alpha: 0, duration: 480, ease: "Back.Out", onComplete: () => marca.destroy() });
    }

    mostrarMensaje(texto, x, y) {
        const mensaje = this.add.text(x, y, texto, {
            fontFamily: "Trebuchet MS",
            fontSize: `${this.alto * 0.032}px`,
            color: "#FFF8D8",
            fontStyle: "bold",
            stroke: "#5E3117",
            strokeThickness: Math.max(5, this.alto * 0.006)
        }).setOrigin(0.5).setDepth(110);
        this.tweens.add({ targets: mensaje, y: y - this.alto * 0.045, alpha: 0, duration: 720, onComplete: () => mensaje.destroy() });
    }

    suspenderJuego() {
        this.estadoAntesSuspension = this.estadoNivel;
        this.estadoNivel = "suspendido";
        this.gestorTrayectoria.cancelar();
        this.tablero.setHabilitado(false);
        if (this.sonidoRecoleccion?.isPlaying) this.sonidoRecoleccion.pause();
        if (this.sonidoBomba?.isPlaying) this.sonidoBomba.pause();
    }

    reanudarJuego() {
        const anterior = this.estadoAntesSuspension;
        this.estadoAntesSuspension = null;
        this.estadoNivel = anterior === "jugando" ? "jugando" : anterior ?? "jugando";
        if (this.estadoNivel === "jugando") {
            this.tablero.setHabilitado(true);
            this.gestorTrayectoria.setHabilitado(true);
        }
        if (this.sonidoRecoleccion?.isPaused) this.sonidoRecoleccion.resume();
        if (this.sonidoBomba?.isPaused) this.sonidoBomba.resume();
    }

    completarNivel() {
        if (this.resultadoMostrado) return;
        this.resultadoMostrado = true;
        this.estadoNivel = "resultado";
        this.hud.stop();
        this.tablero.setHabilitado(false);
        this.gestorTrayectoria.setHabilitado(false);
        const estrellas = this.hud.calculateStars(CONFIGURACION_NIVEL.estrellasMaximas);
        ProgressManager.completeRevisionAcopio(estrellas);
        this.audio.playVoice("vozClasificarSemillasCompletado", () => {
            if (this.scene.isActive("ClasificarSemillasScene")) this.mostrarResultado("¡Semillas clasificadas!", estrellas);
        });
    }

    fallarNivel(razon) {
        if (this.resultadoMostrado) return;
        this.resultadoMostrado = true;
        this.estadoNivel = "resultado";
        this.hud.stop();
        this.tablero.setHabilitado(false);
        this.gestorTrayectoria.setHabilitado(false);
        const mostrar = () => {
            if (this.scene.isActive("ClasificarSemillasScene")) {
                this.mostrarResultado(razon === "tiempo" ? "Tiempo agotado" : "¡Practiquemos otra vez!", 0);
            }
        };
        const despuesDerrota = () => razon === "tiempo"
            ? this.audio.playVoice("vozClasificarSemillasTiempoAgotado", mostrar)
            : mostrar();
        const derrota = this.sound.add("sfxDerrota", { volume: 0.65 });
        derrota.once("complete", () => { derrota.destroy(); despuesDerrota(); });
        if (!derrota.play()) { derrota.destroy(); despuesDerrota(); }
    }

    mostrarResultado(titulo, estrellas) {
        new ResultPanel(this, {
            title: titulo,
            stars: estrellas,
            retryText: "Reintentar",
            nextText: "Niveles",
            onRetry: () => this.scene.restart(),
            onNext: () => this.scene.start("CosecharScene")
        });
    }

    configurarCicloDeVida() {
        this.manejarVisibilidad = () => {
            if (document.hidden && this.estadoNivel === "jugando") {
                this.gestorTrayectoria.cancelar();
                this.hud.pause();
            }
        };
        document.addEventListener("visibilitychange", this.manejarVisibilidad);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            document.removeEventListener("visibilitychange", this.manejarVisibilidad);
            this.gestorTrayectoria?.destroy();
            this.sonidoRecoleccion?.destroy();
            this.sonidoBomba?.destroy();
            this.audio?.destroy();
        });
    }
}
