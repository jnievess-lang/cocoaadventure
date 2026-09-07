import Phaser from "phaser";
import HudMinijuego from "../ui/HudMinijuego";
import GestorAudioMinijuego from "../managers/GestorAudioMinijuego";
import TutorialPanel from "../ui/TutorialPanel";
import ResultPanel from "../ui/ResultPanel";
import ContadorObjetivos from "../ui/ContadorObjetivos";
import ManoGuia from "../ui/ManoGuia";

/**
 * Esqueleto común de los minijuegos del módulo Mantener.
 *
 * Resuelve el fondo, el HUD, el tutorial, el contador, el resultado y el ciclo
 * de vida. Cada nivel solo aporta su mecánica implementando `crearMecanica`,
 * `habilitarMecanica` y `deshabilitarMecanica`, y avisa de lo que ocurre con
 * `registrarAcierto` y `registrarError`.
 */
export default class EscenaMantenimientoBase extends Phaser.Scene {

    constructor(clave, configuracionNivel) {
        super(clave);
        this.clave = clave;
        this.nivel = configuracionNivel;
    }

    /**
     * Pantalla de niveles a la que vuelve el nivel al salir o al terminar.
     * Los niveles de Mantener no la declaran y conservan su destino original.
     */
    get escenaModulo() {
        return this.nivel.escenaModulo ?? "MantenerScene";
    }

    create() {
        const { width, height } = this.scale;

        this.ancho = width;
        this.alto = height;
        this.estado = "tutorial";
        this.estadoPrevio = null;
        this.resultadoMostrado = false;
        this.vozDeAyudaUsada = false;
        this.temporizadores = new Set();
        this.eventoPista = null;

        this.audio = new GestorAudioMinijuego(this);

        this.crearFondo();
        this.crearContador();
        this.crearHudMinijuego();
        this.crearManoGuia();
        this.crearMecanica();
        this.audio.ensureMusic();
        this.mostrarTutorial();
        this.configurarCicloDeVida();
    }

    // ------------------------------------------------------------------
    // Temporizadores de juego.
    // ------------------------------------------------------------------

    /**
     * Espera que forma parte de la partida y, por tanto, debe detenerse cuando
     * el nivel se suspende.
     *
     * `this.time.delayedCall` a secas no sirve: el reloj de la escena sigue
     * corriendo durante la pausa y durante las voces del HUD, así que una espera
     * podía vencer con el nivel detenido, salir por su propia guarda de estado y
     * no volver a programarse nunca. Es lo que dejaba colgado a “Cuidado
     * correcto” si se pausaba justo después de acertar.
     */
    programar(retraso, callback) {
        const evento = this.time.delayedCall(retraso, () => {
            this.temporizadores.delete(evento);
            callback();
        });

        evento.paused = this.estado !== "jugando";
        this.temporizadores.add(evento);

        return evento;
    }

    pausarTemporizadores(pausados) {
        this.temporizadores.forEach(evento => {
            evento.paused = pausados;
        });
    }

    cancelarTemporizadores() {
        this.temporizadores.forEach(evento => evento.remove(false));
        this.temporizadores.clear();
        this.eventoPista = null;
    }

    /**
     * Apaga solo la ayuda. Las esperas de la mecánica se dejan correr: son las
     * que rematan la animación de lo último que hizo el niño, y todas comprueban
     * el estado antes de tocar nada.
     */
    detenerPista() {
        this.eventoPista?.remove(false);
        this.temporizadores.delete(this.eventoPista);
        this.eventoPista = null;
        this.manoGuia?.ocultar();
    }

    crearFondo() {
        const fondo = this.add.image(
            this.ancho / 2,
            this.alto / 2,
            this.nivel.fondo
        );

        // Se guarda porque la lupa de “Buscar plagas” necesita saber qué parte
        // del escenario debe verse ampliada dentro del cristal.
        this.fondo = fondo;

        // Los fondos del módulo son más anchos que el lienzo real del dispositivo.
        // Se escalan a "cover" y la mecánica se mantiene en la zona central.
        fondo.setScale(
            Math.max(this.ancho / fondo.width, this.alto / fondo.height)
        );

        fondo.setDepth(0);

        this.add.rectangle(
            this.ancho / 2,
            this.alto / 2,
            this.ancho,
            this.alto,
            0x173719,
            this.nivel.oscurecerFondo ?? 0.08
        ).setDepth(1);
    }

    crearContador() {
        this.contador = new ContadorObjetivos(this, {
            total: this.nivel.totalObjetivos,
            iconTexture: this.nivel.iconoContador
        });
    }

    /**
     * Ayuda visual del módulo, igual que en Cosecha. Se crea antes que la
     * mecánica para que la lupa de “Buscar plagas” no la incluya en lo que
     * amplía el cristal.
     */
    crearManoGuia() {
        this.manoGuia = new ManoGuia(this, {
            anchoVisual: this.alto * 0.15,
            radioCirculo: this.alto * 0.052,
            depth: 90
        });
    }

    crearHudMinijuego() {
        this.hud = new HudMinijuego(this, {
            lives: {
                maxLives: this.nivel.vidasMaximas ?? 3
            },
            timer: {
                durationSeconds: this.nivel.duracionSegundos ?? 60
            },
            controls: {},
            instructionAudio: this.nivel.voces.instruccion,
            audioManager: this.audio,
            onTimeUp: () => this.fallarNivel("tiempo"),
            onLivesEmpty: () => this.fallarNivel("vidas"),
            onGameplaySuspended: razon => this.suspenderJuego(razon),
            onGameplayResumed: razon => this.reanudarJuego(razon),
            onExit: () => this.scene.start(this.escenaModulo)
        });
    }

    mostrarTutorial() {
        this.audio.duckMusic();

        new TutorialPanel(this, {
            character: "CacaitoIndicaciones",
            text: this.nivel.tutorial,
            audio: this.nivel.voces.instruccion,
            // Sin botones, igual que en Cosecha: el tutorial se cierra solo al
            // terminar la voz. La instrucción se puede volver a escuchar con
            // `btnRepetirAudio` del HUD, ya dentro del nivel.
            onVoiceStart: () => this.audio.duckMusic(),
            onComplete: () => {
                this.audio.restoreMusic();
                this.iniciarNivel();
            }
        });
    }

    iniciarNivel() {
        if (this.estado !== "tutorial") return;

        this.estado = "jugando";
        this.hud.start();
        this.habilitarMecanica();
        this.reiniciarInactividad();
    }

    // ------------------------------------------------------------------
    // Ayuda por inactividad.
    // ------------------------------------------------------------------

    /**
     * Cada vez que el niño hace algo, el reloj de la pista vuelve a cero. Si se
     * queda quieto, la mano aparece sola y se repite hasta que vuelva a actuar.
     */
    reiniciarInactividad() {
        this.detenerPista();

        if (this.estado !== "jugando") return;

        this.eventoPista = this.programar(
            this.nivel.esperaPistaMs ?? 7000,
            () => this.lanzarPista()
        );
    }

    lanzarPista() {
        if (this.estado !== "jugando") return;

        this.mostrarPista();

        this.eventoPista = this.programar(
            this.nivel.repetirPistaMs ?? 9000,
            () => this.lanzarPista()
        );
    }

    /** Cada nivel decide qué señala la mano. Sin implementar, no hay pista. */
    mostrarPista() {}

    registrarAcierto() {
        if (this.estado !== "jugando") return;

        this.sound.play("sfxSeleccionCorrecta", { volume: 0.68 });
        this.contador.avanzar();
        this.reiniciarInactividad();

        if (this.contador.estaCompleto()) this.completarNivel();
    }

    /**
     * Un error cuesta una vida y, la primera vez, dispara la voz de ayuda.
     * La ayuda no penaliza: el HUD pausa el cronómetro mientras suena.
     */
    registrarError() {
        if (this.estado !== "jugando") return;

        this.sound.play("sfxSeleccionIncorrecta", { volume: 0.72 });

        const vidasRestantes = this.hud.loseLife();

        if (vidasRestantes <= 0) return;

        this.reiniciarInactividad();

        // Tras un fallo la mano no espera a la inactividad: es justo cuando hace
        // falta. Si además toca la voz de ayuda, la mano entra al terminarla,
        // para que se vea lo que la voz acaba de explicar.
        if (!this.vozDeAyudaUsada && this.nivel.voces.ayuda) {
            this.vozDeAyudaUsada = true;

            this.hud.reproducirRetroalimentacion(
                this.nivel.voces.ayuda,
                () => this.mostrarPista()
            );

            return;
        }

        this.mostrarPista();
    }

    completarNivel() {
        if (this.resultadoMostrado) return;

        this.resultadoMostrado = true;
        this.estado = "completado";
        this.hud.stop();
        this.deshabilitarMecanica();
        this.detenerPista();

        const estrellas = this.hud.calculateStars(3);
        this.nivel.guardarProgreso(estrellas);

        this.audio.playVoice(this.nivel.voces.completado, () => {
            if (!this.scene.isActive(this.clave)) return;
            this.mostrarResultado(this.nivel.tituloExito, estrellas);
        });
    }

    fallarNivel(razon) {
        if (this.resultadoMostrado) return;

        this.resultadoMostrado = true;
        this.estado = "fallido";
        this.hud.stop();
        this.deshabilitarMecanica();
        this.detenerPista();
        this.sound.play("sfxDerrota", { volume: 0.65 });

        if (razon === "tiempo") {
            this.audio.playVoice(this.nivel.voces.tiempoAgotado, () => {
                if (!this.scene.isActive(this.clave)) return;
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
            onNext: () => this.scene.start(this.escenaModulo)
        });
    }

    suspenderJuego(razon) {
        if (this.estado === "jugando") this.estadoPrevio = this.estado;

        this.estado = razon ?? "suspendido";
        this.deshabilitarMecanica();
        this.pausarTemporizadores(true);
        this.manoGuia?.ocultar();
    }

    reanudarJuego() {
        if (this.resultadoMostrado) return;

        this.estado = this.estadoPrevio ?? "jugando";
        this.estadoPrevio = null;
        this.habilitarMecanica();
        this.pausarTemporizadores(false);
    }

    configurarCicloDeVida() {
        this.manejarVisibilidad = () => {
            if (document.hidden && this.estado === "jugando") this.hud.pause();
        };

        document.addEventListener("visibilitychange", this.manejarVisibilidad);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            document.removeEventListener(
                "visibilitychange",
                this.manejarVisibilidad
            );

            this.cancelarTemporizadores();

            // Phaser ya destruye los GameObjects y el HUD de la escena.
            // Volver a destruirlos deja `scene` indefinido y rompe scene.start().
            this.audio?.destroy();
        });
    }

    // ------------------------------------------------------------------
    // Puntos de extensión que cada nivel debe implementar.
    // ------------------------------------------------------------------

    crearMecanica() {
        throw new Error(`${this.clave} debe implementar crearMecanica().`);
    }

    habilitarMecanica() {
        throw new Error(`${this.clave} debe implementar habilitarMecanica().`);
    }

    deshabilitarMecanica() {
        throw new Error(`${this.clave} debe implementar deshabilitarMecanica().`);
    }

}
