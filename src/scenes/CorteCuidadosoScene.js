import Phaser from "phaser";
import HudMinijuego from "../ui/HudMinijuego";
import GestorAudioMinijuego from "../managers/GestorAudioMinijuego";
import TutorialPanel from "../ui/TutorialPanel";
import ResultPanel from "../ui/ResultPanel";
import ControlFuerzaCorte from "../ui/ControlFuerzaCorte";
import MazorcaCortable from "../objects/MazorcaCortable";
import ProgressManager from "../managers/ProgressManager";

const CONFIGURACION_NIVEL = Object.freeze({
    totalMazorcas: 4,
    duracionSegundos: 60,
    vidasMaximas: 4,
    estrellasMaximas: 3,
    duracionBarridoMs: 1200,
    toleranciaLinea: 0.045,
    posicionXLinea: 0.44,
    duracionCargaMs: 2200,
    zonasSeguras: [
        { minimo: 0.25, maximo: 0.80 },
        { minimo: 0.28, maximo: 0.76 },
        { minimo: 0.31, maximo: 0.73 },
        { minimo: 0.34, maximo: 0.70 }
    ]
});

export default class CorteCuidadosoScene extends Phaser.Scene {

    constructor() {
        super("CorteCuidadosoScene");
    }

    create() {
        const { width, height } = this.scale;

        this.ancho = width;
        this.alto = height;
        this.mazorcasCortadas = 0;
        this.estadoNivel = "tutorial";
        this.estadoAntesSuspension = null;
        this.primeraVozPunto = false;
        this.primeraVozBaja = false;
        this.primeraVozAlta = false;
        this.resultadoMostrado = false;

        this.audio = new GestorAudioMinijuego(this);

        this.crearFondo();
        this.crearContador();
        this.crearHudMinijuego();
        this.crearMecanica();
        this.audio.ensureMusic();
        this.mostrarTutorial();
        this.configurarCicloDeVida();
    }

    crearFondo() {
        const fondo = this.add.image(
            this.ancho / 2,
            this.alto / 2,
            "FondoFincaCacao"
        );
        const escala = Math.max(
            this.ancho / fondo.width,
            this.alto / fondo.height
        );
        fondo.setScale(escala).setDepth(0);

        this.add.rectangle(
            this.ancho / 2,
            this.alto / 2,
            this.ancho,
            this.alto,
            0x173719,
            0.10
        ).setDepth(1);
    }

    crearContador() {
        this.panelContador = this.add.rectangle(
            this.ancho * 0.13,
            this.alto * 0.155,
            this.ancho * 0.15,
            this.alto * 0.06,
            0xFFF1C6,
            0.96
        ).setDepth(50);
        this.panelContador.setStrokeStyle(
            Math.max(3, this.alto * 0.004),
            0x7C431B,
            1
        );

        const icono = this.add.image(
            this.ancho * 0.095,
            this.alto * 0.155,
            "MazorcaMaduraNaranja"
        );
        icono.setScale((this.alto * 0.044) / icono.height).setDepth(51);

        this.textoContador = this.add.text(
            this.ancho * 0.145,
            this.alto * 0.155,
            `0 / ${CONFIGURACION_NIVEL.totalMazorcas}`,
            {
                fontFamily: "Trebuchet MS",
                fontSize: `${this.alto * 0.03}px`,
                color: "#5F3215",
                fontStyle: "bold"
            }
        ).setOrigin(0.5).setDepth(51);
    }

    crearHudMinijuego() {
        this.hud = new HudMinijuego(this, {
            lives: {
                maxLives: CONFIGURACION_NIVEL.vidasMaximas
            },
            timer: {
                durationSeconds: CONFIGURACION_NIVEL.duracionSegundos
            },
            controls: {},
            instructionAudio: "vozCorteCuidadosoInstruccion",
            audioManager: this.audio,
            onTimeUp: () => this.fallarNivel("tiempo"),
            onLivesEmpty: () => this.fallarNivel("vidas"),
            onGameplaySuspended: razon => this.suspenderJuego(razon),
            onGameplayResumed: razon => this.reanudarJuego(razon),
            onExit: () => this.scene.start("CosecharScene")
        });
    }

    crearMecanica() {
        this.mazorcaCortable = new MazorcaCortable(this, {
            duracionBarridoMs: CONFIGURACION_NIVEL.duracionBarridoMs,
            toleranciaLinea: CONFIGURACION_NIVEL.toleranciaLinea,
            posicionXLinea: CONFIGURACION_NIVEL.posicionXLinea,
            onPedunculoSeleccionado: () => this.seleccionarPedunculo(),
            onPuntoIncorrecto: () => this.marcarPuntoIncorrecto()
        });
        this.mazorcaCortable.setVisible(false);

        this.controlFuerza = new ControlFuerzaCorte(this, {
            x: this.ancho * 0.70,
            y: this.alto * 0.83,
            width: Math.min(this.ancho * 0.42, this.alto * 0.82),
            height: this.alto * 0.20,
            duracionCargaMs: CONFIGURACION_NIVEL.duracionCargaMs,
            zonaSegura: CONFIGURACION_NIVEL.zonasSeguras[0],
            onLiberar: resultado => this.evaluarCorte(resultado)
        });
    }

    mostrarTutorial() {
        this.audio.duckMusic();

        new TutorialPanel(this, {
            character: "CacaitoIndicaciones",
            text: "Toca cuando la línea roja pase sobre el tallito de la mazorca. Luego mantén presionado y suelta en la zona verde.",
            audio: "vozCorteCuidadosoInstruccion",
            onVoiceStart: () => this.audio.duckMusic(),
            onComplete: () => {
                this.audio.restoreMusic();
                this.iniciarNivel();
            }
        });
    }

    iniciarNivel() {
        if (this.estadoNivel !== "tutorial") return;

        this.hud.start();
        this.mazorcaCortable.setVisible(true);
        this.prepararRonda();
    }

    prepararRonda() {
        if (this.mazorcasCortadas >= CONFIGURACION_NIVEL.totalMazorcas) return;

        this.estadoNivel = "buscandoPedunculo";
        this.controlFuerza.ocultar();

        this.mazorcaCortable.prepararRonda();
    }

    marcarPuntoIncorrecto() {
        if (this.estadoNivel !== "buscandoPedunculo") return;

        const esPrimerError = !this.primeraVozPunto;

        this.sound.play("sfxSeleccionIncorrecta", { volume: 0.72 });
        this.mazorcaCortable.reforzarAyuda();

        if (esPrimerError) {
            this.primeraVozPunto = true;
            this.mazorcaCortable.mostrarObjetivoPedunculo();
        }

        const vidasRestantes = this.hud.loseLife();
        if (vidasRestantes <= 0 || this.estadoNivel === "fallido") return;

        if (esPrimerError) {
            this.hud.reproducirRetroalimentacion(
                "vozCorteCuidadosoPuntoIncorrecto"
            );
        }
    }

    seleccionarPedunculo() {
        if (this.estadoNivel !== "buscandoPedunculo") return;

        this.estadoNivel = "ajustandoFuerza";
        this.sound.play("sfxSeleccionCorrecta", { volume: 0.68 });
        this.mazorcaCortable.mostrarTijera();
        this.controlFuerza.mostrar(
            CONFIGURACION_NIVEL.zonasSeguras[this.mazorcasCortadas]
        );
    }

    evaluarCorte({ resultado }) {
        if (this.estadoNivel !== "ajustandoFuerza") return;

        if (resultado === "ideal") {
            this.realizarCorteCorrecto();
            return;
        }

        this.procesarFuerzaIncorrecta(resultado);
    }

    realizarCorteCorrecto() {
        this.estadoNivel = "resolviendoCorte";
        this.controlFuerza.deshabilitar();
        this.sound.play("sfxCorteTijera", { volume: 1 });
        this.mazorcasCortadas++;
        this.textoContador.setText(
            `${this.mazorcasCortadas} / ${CONFIGURACION_NIVEL.totalMazorcas}`
        );

        const ultimaMazorca = (
            this.mazorcasCortadas >= CONFIGURACION_NIVEL.totalMazorcas
        );

        if (ultimaMazorca) this.hud.stop();

        this.mazorcaCortable.cortar(() => {
            if (ultimaMazorca) this.completarNivel();
            else this.prepararRonda();
        });
    }

    procesarFuerzaIncorrecta(tipo) {
        this.estadoNivel = "retroalimentacion";
        this.sound.play("sfxSeleccionIncorrecta", { volume: 0.72 });
        this.controlFuerza.mostrarError(
            tipo,
            () => this.prepararTrasFuerzaIncorrecta(tipo)
        );
        this.mazorcaCortable.mostrarError(tipo);

        const vidasRestantes = this.hud.loseLife();
        if (vidasRestantes <= 0 || this.estadoNivel === "fallido") return;
    }

    prepararTrasFuerzaIncorrecta(tipo) {
        if (this.estadoNivel !== "retroalimentacion") return;

        const propiedad = tipo === "baja"
            ? "primeraVozBaja"
            : "primeraVozAlta";
        const audio = tipo === "baja"
            ? "vozCorteCuidadosoFuerzaBaja"
            : "vozCorteCuidadosoFuerzaAlta";

        this.estadoNivel = "ajustandoFuerza";

        if (!this[propiedad]) {
            this[propiedad] = true;
            this.hud.reproducirRetroalimentacion(audio);
        }
        else {
            this.controlFuerza.prepararReintento();
        }
    }

    completarNivel() {
        if (this.resultadoMostrado) return;

        this.resultadoMostrado = true;
        this.estadoNivel = "completado";
        this.controlFuerza.ocultar();
        this.mazorcaCortable.deshabilitarTodo();

        const estrellas = this.hud.calculateStars(
            CONFIGURACION_NIVEL.estrellasMaximas
        );
        ProgressManager.completeCorteCuidadoso(estrellas);

        this.audio.playVoice("vozCorteCuidadosoCompletado", () => {
            if (!this.scene.isActive("CorteCuidadosoScene")) return;
            this.mostrarResultado("¡Corte cuidadoso!", estrellas);
        });
    }

    fallarNivel(razon) {
        if (this.resultadoMostrado) return;

        this.resultadoMostrado = true;
        this.estadoNivel = "fallido";
        this.hud.stop();
        this.controlFuerza.ocultar();
        this.mazorcaCortable.deshabilitarTodo();
        this.sound.play("sfxDerrota", { volume: 0.65 });

        if (razon === "tiempo") {
            this.audio.playVoice("vozCorteCuidadosoTiempoAgotado", () => {
                if (!this.scene.isActive("CorteCuidadosoScene")) return;
                this.mostrarResultado("Tiempo agotado", 0);
            });
            return;
        }

        this.mostrarResultado("¡Practiquemos otra vez!", 0);
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

    suspenderJuego() {
        this.estadoAntesSuspension = this.estadoNivel;
        this.estadoNivel = "suspendido";
        this.controlFuerza.deshabilitar();
        this.mazorcaCortable.deshabilitarTodo();
    }

    reanudarJuego() {
        const estadoAnterior = this.estadoAntesSuspension;
        this.estadoAntesSuspension = null;
        this.estadoNivel = estadoAnterior ?? "buscandoPedunculo";

        if (this.estadoNivel === "buscandoPedunculo") {
            this.mazorcaCortable.habilitarPedunculo();
        }
        else if (this.estadoNivel === "ajustandoFuerza") {
            this.controlFuerza.prepararReintento();
        }
    }

    configurarCicloDeVida() {
        this.manejarVisibilidad = () => {
            if (
                document.hidden &&
                ["buscandoPedunculo", "ajustandoFuerza"].includes(this.estadoNivel)
            ) {
                this.hud.pause();
            }
        };

        document.addEventListener("visibilitychange", this.manejarVisibilidad);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            document.removeEventListener("visibilitychange", this.manejarVisibilidad);
            // Phaser destruye automáticamente los GameObjects y el HUD de la escena.
            // Volver a destruirlos aquí deja `scene` indefinido e interrumpe scene.start().
            this.audio?.destroy();
        });
    }
}
