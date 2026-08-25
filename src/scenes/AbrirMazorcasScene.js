import Phaser from "phaser";
import HudMinijuego from "../ui/HudMinijuego";
import GestorAudioMinijuego from "../managers/GestorAudioMinijuego";
import GestorCorteDeslizante from "../managers/GestorCorteDeslizante";
import TutorialPanel from "../ui/TutorialPanel";
import ResultPanel from "../ui/ResultPanel";
import MazorcaVoladora from "../objects/MazorcaVoladora";
import ProgressManager from "../managers/ProgressManager";
import {
    crearBolsaMazorcas,
    esMazorcaMadura,
    extraerTipoMazorcas
} from "../utils/bolsaMazorcas";

export const CONFIGURACION_NIVEL = Object.freeze({
    objetivoMazorcas: 11,
    duracionSegundos: 90,
    vidasMaximas: 3,
    estrellasMaximas: 3,
    maximoSimultaneas: 3,
    intervaloAparicionMinMs: 1600,
    intervaloAparicionMaxMs: 2200,
    duracionVueloMinMs: 4200,
    duracionVueloMaxMs: 5200,
    proteccionPerdidaVidaMs: 800
});

export default class AbrirMazorcasScene extends Phaser.Scene {

    constructor() {
        super("AbrirMazorcasScene");
    }

    create() {
        const { width, height } = this.scale;

        this.ancho = width;
        this.alto = height;
        this.estadoNivel = "tutorial";
        this.estadoAntesSuspension = null;
        this.mazorcasAbiertas = 0;
        this.mazorcasActivas = new Set();
        this.carrilesOcupados = new Set();
        this.bolsaTipos = crearBolsaMazorcas();
        this.incorrectasConsecutivas = 0;
        this.centrosCarriles = this.crearCentrosCarriles(
            CONFIGURACION_NIVEL.maximoSimultaneas
        );
        this.protegidoHasta = 0;
        this.eventoAparicion = null;
        this.resultadoMostrado = false;

        this.audio = new GestorAudioMinijuego(this);
        this.crearFondo();
        this.crearContador();
        this.crearHud();
        this.crearGestorCorte();
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
            0.08
        ).setDepth(1);
    }

    crearContador() {
        this.panelContador = this.add.rectangle(
            this.ancho * 0.16,
            this.alto * 0.145,
            this.ancho * 0.15,
            this.alto * 0.058,
            0xFFF1C6,
            0.96
        ).setDepth(52);
        this.panelContador.setStrokeStyle(
            Math.max(3, this.alto * 0.004),
            0x7C431B,
            1
        );

        const icono = this.add.image(
            this.ancho * 0.125,
            this.alto * 0.145,
            "MazorcaMaduraNaranja"
        );
        icono.setScale((this.alto * 0.043) / icono.height).setDepth(53);

        this.textoContador = this.add.text(
            this.ancho * 0.176,
            this.alto * 0.145,
            `0 / ${CONFIGURACION_NIVEL.objetivoMazorcas}`,
            {
                fontFamily: "Trebuchet MS",
                fontSize: `${this.alto * 0.029}px`,
                color: "#5F3215",
                fontStyle: "bold"
            }
        ).setOrigin(0.5).setDepth(53);
    }

    crearHud() {
        this.hud = new HudMinijuego(this, {
            lives: {
                maxLives: CONFIGURACION_NIVEL.vidasMaximas
            },
            timer: {
                durationSeconds: CONFIGURACION_NIVEL.duracionSegundos
            },
            controls: {},
            instructionAudio: "vozAbrirMazorcasInstruccion",
            audioManager: this.audio,
            onTimeUp: () => this.fallarNivel("tiempo"),
            onLivesEmpty: () => this.fallarNivel("vidas"),
            onGameplaySuspended: razon => this.suspenderJuego(razon),
            onGameplayResumed: razon => this.reanudarJuego(razon),
            onExit: () => this.scene.start("CosecharScene")
        });
    }

    crearGestorCorte() {
        this.gestorCorte = new GestorCorteDeslizante(this, {
            distanciaMinima: Math.max(24, this.ancho * 0.018),
            puedeInteractuar: () => this.estadoNivel === "jugando",
            esZonaBloqueada: (x, y) => this.esZonaHud(x, y),
            obtenerObjetivos: () => [...this.mazorcasActivas],
            alCortar: (mazorca, inicio, fin) => {
                this.procesarCorte(mazorca, inicio, fin);
            }
        });
    }

    esZonaHud(x, y) {
        const zonaSuperior = y <= this.alto * 0.19;
        const botonAudio = x >= this.ancho * 0.875 && y >= this.alto * 0.80;
        return zonaSuperior || botonAudio;
    }

    mostrarTutorial() {
        this.audio.duckMusic();

        new TutorialPanel(this, {
            character: "CacaitoIndicaciones",
            text: "Desliza tu dedo sobre las mazorcas amarillas y anaranjadas para abrirlas. Evita las verdes y las dañadas. No dejes caer las maduras.",
            audio: "vozAbrirMazorcasInstruccion",
            onVoiceStart: () => this.audio.duckMusic(),
            onVoiceComplete: () => this.audio.restoreMusic(),
            onComplete: () => this.mostrarDemostracion()
        });
    }

    mostrarDemostracion() {
        if (this.estadoNivel !== "tutorial") return;
        this.estadoNivel = "demostracion";

        const x = this.ancho * 0.50;
        const y = this.alto * 0.52;
        const altura = this.alto * 0.25;
        const mazorca = this.add.image(x, y, "MazorcaMaduraNaranja")
            .setDepth(70);
        mazorca.setScale(altura / mazorca.height);

        const destello = this.add.star(
            x + altura * 0.24,
            y - altura * 0.18,
            4,
            altura * 0.025,
            altura * 0.07,
            0xFFF4A6,
            0.95
        ).setDepth(71);

        const linea = this.add.graphics().setDepth(75);
        const progreso = { valor: 0 };
        const inicioX = x - altura * 0.58;
        const finX = x + altura * 0.58;

        this.tweens.add({
            targets: progreso,
            valor: 1,
            duration: 430,
            delay: 160,
            ease: "Cubic.Out",
            onUpdate: () => {
                linea.clear();
                linea.lineStyle(
                    Math.max(8, this.alto * 0.012),
                    0xFFD34E,
                    0.65
                );
                linea.lineBetween(
                    inicioX,
                    y + altura * 0.18,
                    Phaser.Math.Linear(inicioX, finX, progreso.valor),
                    y - altura * 0.18
                );
                linea.lineStyle(
                    Math.max(4, this.alto * 0.007),
                    0xFFFFFF,
                    1
                );
                linea.lineBetween(
                    inicioX,
                    y + altura * 0.18,
                    Phaser.Math.Linear(inicioX, finX, progreso.valor),
                    y - altura * 0.18
                );
            },
            onComplete: () => {
                mazorca.setVisible(false);
                destello.setVisible(false);
                this.mostrarMitadesDemostracion(x, y, altura);
            }
        });

        this.time.delayedCall(1200, () => {
            mazorca.destroy();
            destello.destroy();
            linea.destroy();
            this.iniciarNivel();
        });
    }

    mostrarMitadesDemostracion(x, y, altura) {
        const izquierda = this.add.image(
            x,
            y,
            "MazorcaNaranjaMitadIzquierda"
        ).setDepth(71).setScale((altura * 0.82) / 768);
        const derecha = this.add.image(
            x,
            y,
            "MazorcaNaranjaMitadDerecha"
        ).setDepth(71).setScale((altura * 0.82) / 768);

        this.tweens.add({
            targets: izquierda,
            x: x - this.ancho * 0.045,
            angle: -13,
            alpha: 0,
            duration: 570,
            onComplete: () => izquierda.destroy()
        });
        this.tweens.add({
            targets: derecha,
            x: x + this.ancho * 0.045,
            angle: 13,
            alpha: 0,
            duration: 570,
            onComplete: () => derecha.destroy()
        });
    }

    iniciarNivel() {
        if (this.estadoNivel !== "demostracion") return;

        this.estadoNivel = "jugando";
        this.hud.start();
        this.gestorCorte.setHabilitado(true);
        this.programarAparicion(180);
    }

    programarAparicion(retraso) {
        this.eventoAparicion?.remove(false);
        this.eventoAparicion = this.time.delayedCall(retraso, () => {
            this.eventoAparicion = null;

            if (this.estadoNivel !== "jugando") return;

            this.intentarCrearMazorca();
            this.programarAparicion(Phaser.Math.Between(
                CONFIGURACION_NIVEL.intervaloAparicionMinMs,
                CONFIGURACION_NIVEL.intervaloAparicionMaxMs
            ));
        });
    }

    intentarCrearMazorca() {
        if (
            this.mazorcasActivas.size >= CONFIGURACION_NIVEL.maximoSimultaneas
        ) return;

        const carrilesDisponibles = this.centrosCarriles.map(
            (_, indice) => indice
        ).filter(
            carril => !this.carrilesOcupados.has(carril)
        );
        if (carrilesDisponibles.length === 0) return;

        const carril = Phaser.Utils.Array.GetRandom(carrilesDisponibles);
        const tipo = extraerTipoMazorcas(
            this.bolsaTipos,
            this.incorrectasConsecutivas
        );

        this.incorrectasConsecutivas = esMazorcaMadura(tipo)
            ? 0
            : this.incorrectasConsecutivas + 1;

        const mazorca = new MazorcaVoladora(this, {
            tipo,
            carril,
            alturaVisual: Math.min(this.alto * 0.24, this.ancho * 0.14),
            duracionVueloMs: Phaser.Math.Between(
                CONFIGURACION_NIVEL.duracionVueloMinMs,
                CONFIGURACION_NIVEL.duracionVueloMaxMs
            ),
            trayectoria: this.crearTrayectoria(carril),
            alSalir: objetivo => this.procesarCaida(objetivo),
            alRetirar: objetivo => this.retirarMazorca(objetivo)
        });

        this.mazorcasActivas.add(mazorca);
        this.carrilesOcupados.add(carril);
    }

    crearTrayectoria(carril) {
        const centroX = this.ancho * this.centrosCarriles[carril];
        const variacion = this.ancho * 0.035;

        return {
            inicio: {
                x: centroX + Phaser.Math.Between(-variacion, variacion),
                y: this.alto * 1.14
            },
            control: {
                x: centroX + Phaser.Math.Between(-variacion, variacion),
                y: -this.alto * Phaser.Math.FloatBetween(0.30, 0.48)
            },
            final: {
                x: centroX + Phaser.Math.Between(-variacion, variacion),
                y: this.alto * 1.16
            }
        };
    }

    crearCentrosCarriles(cantidad) {
        const total = Math.max(1, Math.floor(cantidad));
        if (total === 1) return [0.5];

        return Array.from(
            { length: total },
            (_, indice) => 0.26 + (0.48 * indice) / (total - 1)
        );
    }

    procesarCorte(mazorca, inicio, fin) {
        if (this.estadoNivel !== "jugando" || !mazorca.puedeCortarse()) return;

        this.mostrarLineaCorte(inicio, fin);

        if (mazorca.madura) {
            this.procesarAcierto(mazorca);
            return;
        }

        this.procesarError(mazorca);
    }

    procesarAcierto(mazorca) {
        const aceptada = mazorca.abrir(() => {
            if (this.estadoNivel === "finalizando") this.completarNivel();
        });
        if (!aceptada) return;

        this.sound.play("sfxAperturaMazorca", { volume: 0.85 });
        this.mazorcasAbiertas++;
        this.textoContador.setText(
            `${this.mazorcasAbiertas} / ${CONFIGURACION_NIVEL.objetivoMazorcas}`
        );
        this.mostrarPunto(mazorca.x, mazorca.y);

        if (
            this.mazorcasAbiertas >= CONFIGURACION_NIVEL.objetivoMazorcas
        ) {
            this.estadoNivel = "finalizando";
            this.hud.stop();
            this.gestorCorte.setHabilitado(false);
            this.detenerApariciones();
            this.limpiarMazorcas(mazorca);
        }
    }

    procesarError(mazorca) {
        if (!mazorca.rechazar()) return;

        if (!this.intentarPerderVida()) return;

        if (this.estadoNivel === "jugando") {
            this.sound.play("sfxSeleccionIncorrecta", { volume: 0.72 });
        }
    }

    procesarCaida(mazorca) {
        if (this.estadoNivel !== "jugando" || !mazorca.madura) return;
        if (!this.intentarPerderVida()) return;

        this.mostrarAvisoVida(mazorca.x);
    }

    intentarPerderVida() {
        if (
            this.estadoNivel !== "jugando" ||
            this.time.now < this.protegidoHasta
        ) return false;

        this.protegidoHasta = this.time.now +
            CONFIGURACION_NIVEL.proteccionPerdidaVidaMs;
        this.hud.loseLife();
        return true;
    }

    mostrarLineaCorte(inicio, fin) {
        const linea = this.add.graphics().setDepth(42);
        linea.lineStyle(Math.max(10, this.alto * 0.014), 0xFFD34E, 0.7);
        linea.lineBetween(inicio.x, inicio.y, fin.x, fin.y);
        linea.lineStyle(Math.max(5, this.alto * 0.008), 0xFFFFFF, 1);
        linea.lineBetween(inicio.x, inicio.y, fin.x, fin.y);

        this.tweens.add({
            targets: linea,
            alpha: 0,
            duration: 220,
            onComplete: () => linea.destroy()
        });
    }

    mostrarPunto(x, y) {
        const texto = this.add.text(x, y, "+1", {
            fontFamily: "Trebuchet MS",
            fontSize: `${this.alto * 0.055}px`,
            color: "#FFF7A8",
            fontStyle: "bold",
            stroke: "#4C7A17",
            strokeThickness: Math.max(5, this.alto * 0.007)
        }).setOrigin(0.5).setDepth(90);

        this.tweens.add({
            targets: texto,
            y: y - this.alto * 0.09,
            alpha: 0,
            scale: 1.18,
            duration: 620,
            ease: "Quad.Out",
            onComplete: () => texto.destroy()
        });
    }

    mostrarAvisoVida(x) {
        const y = this.alto * 0.82;
        const contenedor = this.add.container(
            Phaser.Math.Clamp(x, this.ancho * 0.12, this.ancho * 0.88),
            y
        ).setDepth(90);
        const texto = this.add.text(-this.alto * 0.025, 0, "−1", {
            fontFamily: "Trebuchet MS",
            fontSize: `${this.alto * 0.046}px`,
            color: "#FFFFFF",
            fontStyle: "bold",
            stroke: "#8B241E",
            strokeThickness: Math.max(5, this.alto * 0.007)
        }).setOrigin(1, 0.5);
        const corazon = this.add.image(
            this.alto * 0.006,
            0,
            "CorazonLleno"
        );
        corazon.setScale((this.alto * 0.055) / corazon.height);
        contenedor.add([texto, corazon]);

        this.tweens.add({
            targets: contenedor,
            y: y - this.alto * 0.085,
            alpha: 0,
            duration: 620,
            ease: "Quad.Out",
            onComplete: () => contenedor.destroy(true)
        });
    }

    retirarMazorca(mazorca) {
        this.mazorcasActivas.delete(mazorca);
        this.carrilesOcupados.delete(mazorca.carril);
    }

    suspenderJuego() {
        this.estadoAntesSuspension = this.estadoNivel;
        this.estadoNivel = "suspendido";
        this.gestorCorte.setHabilitado(false);
        if (this.eventoAparicion) this.eventoAparicion.paused = true;
    }

    reanudarJuego() {
        const estadoAnterior = this.estadoAntesSuspension;
        this.estadoAntesSuspension = null;
        this.estadoNivel = estadoAnterior === "jugando"
            ? "jugando"
            : estadoAnterior ?? "jugando";

        if (this.estadoNivel === "jugando") {
            this.gestorCorte.setHabilitado(true);
            if (this.eventoAparicion) this.eventoAparicion.paused = false;
            else this.programarAparicion(350);
        }
    }

    completarNivel() {
        if (this.resultadoMostrado) return;

        this.resultadoMostrado = true;
        this.estadoNivel = "resultado";
        const estrellas = this.hud.calculateStars(
            CONFIGURACION_NIVEL.estrellasMaximas
        );
        ProgressManager.completeAbrirMazorcas(estrellas);

        this.audio.playVoice("vozAbrirMazorcasCompletado", () => {
            if (!this.scene.isActive("AbrirMazorcasScene")) return;
            this.mostrarResultado("¡Mazorcas abiertas!", estrellas);
        });
    }

    fallarNivel(razon) {
        if (this.resultadoMostrado) return;

        this.resultadoMostrado = true;
        this.estadoNivel = "resultado";
        this.hud.stop();
        this.gestorCorte.setHabilitado(false);
        this.detenerApariciones();
        this.limpiarMazorcas();

        const mostrarPanel = () => {
            if (!this.scene.isActive("AbrirMazorcasScene")) return;
            this.mostrarResultado(
                razon === "tiempo" ? "Tiempo agotado" : "¡Practiquemos otra vez!",
                0
            );
        };

        if (!this.cache.audio.exists("sfxDerrota")) {
            this.finalizarDerrota(razon, mostrarPanel);
            return;
        }

        const derrota = this.sound.add("sfxDerrota", { volume: 0.65 });
        derrota.once("complete", () => {
            derrota.destroy();
            this.finalizarDerrota(razon, mostrarPanel);
        });

        if (!derrota.play()) {
            derrota.destroy();
            if (razon === "tiempo") {
                this.finalizarDerrota(razon, mostrarPanel);
            }
            else {
                mostrarPanel();
            }
        }
        else if (razon !== "tiempo") {
            mostrarPanel();
        }
    }

    finalizarDerrota(razon, mostrarPanel) {
        if (razon !== "tiempo") return;

        this.audio.playVoice("vozAbrirMazorcasTiempoAgotado", mostrarPanel);
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

    detenerApariciones() {
        this.eventoAparicion?.remove(false);
        this.eventoAparicion = null;
    }

    limpiarMazorcas(excepto = null) {
        [...this.mazorcasActivas].forEach(mazorca => {
            if (mazorca !== excepto) mazorca.destroy(true);
        });
    }

    configurarCicloDeVida() {
        this.manejarVisibilidad = () => {
            if (document.hidden && this.estadoNivel === "jugando") {
                this.gestorCorte.cancelar();
                this.hud.pause();
            }
        };

        document.addEventListener("visibilitychange", this.manejarVisibilidad);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            document.removeEventListener("visibilitychange", this.manejarVisibilidad);
            this.detenerApariciones();
            this.gestorCorte?.destroy();
            this.audio?.destroy();
        });
    }
}
