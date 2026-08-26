import Phaser from "phaser";
import EscenaMantenimientoBase from "./EscenaMantenimientoBase";
import ProgressManager from "../managers/ProgressManager";

const UMBRAL_ARRASTRE = 26;

// Mismo desvanecido que la estela de corte de Sembrar, para que el gesto de
// "soplar" se lea igual que el de "cortar" en el resto del juego.
const DURACION_ESTELA_MS = 160;

const CONFIGURACION_NIVEL = Object.freeze({

    escenaModulo: "ProcesarScene",

    fondo: "FondoDescascarillado",
    oscurecerFondo: 0.08,

    tutorial: "Primero toca el grano para quebrar la cáscara. Después desliza el dedo para soplar la cascarilla.",

    tituloExito: "¡Nibs limpios!",

    voces: {
        instruccion: "vozDescascarillarInstruccion",
        ayuda: "vozDescascarillarAyuda",
        completado: "vozDescascarillarCompletado",
        tiempoAgotado: "vozDescascarillarTiempoAgotado"
    },

    duracionSegundos: 70,
    vidasMaximas: 3,

    totalObjetivos: 6,
    iconoContador: "SemillaCacaoBuena",

    guardarProgreso: estrellas => ProgressManager.completeDescascarillado(estrellas)

});

/**
 * Procesar, nivel 3: quebrar y aventar.
 *
 * Cada grano exige dos gestos distintos y en orden: un toque para quebrar la
 * cáscara y un deslizamiento para soplar la cascarilla. Es lo que separa este
 * nivel de cualquier minijuego de "toca lo correcto": aquí importa la
 * secuencia, y adelantarse cuesta una vida.
 */
export default class DescascarillarScene extends EscenaMantenimientoBase {

    constructor() {
        super("DescascarillarScene", CONFIGURACION_NIVEL);
    }

    crearMecanica() {
        this.granos = [];
        this.arrastrando = false;
        this.erroresDelGesto = new Set();
        this.puntosEstela = [];

        this.estela = this.add.graphics().setDepth(60);

        this.repartirGranos();
        this.escucharGestos();
    }

    repartirGranos() {
        const columnas = 3;
        const anchoGrano = this.ancho * 0.042;

        for (let i = 0; i < this.nivel.totalObjetivos; i++) {
            const columna = i % columnas;
            const fila = Math.floor(i / columnas);

            const grano = this.add.image(
                this.ancho * (0.30 + columna * 0.20) + Phaser.Math.Between(-16, 16),
                this.alto * (0.42 + fila * 0.24) + Phaser.Math.Between(-12, 12),
                "GranoSecoBueno"
            );

            grano
                .setScale(anchoGrano / grano.width)
                .setAngle(Phaser.Math.Between(-20, 20))
                .setDepth(20 + i);

            grano.estado = "entero";
            grano.escalaBase = grano.scale;

            this.granos.push(grano);
        }
    }

    escucharGestos() {
        this.input.on("pointerdown", puntero => {
            if (this.estado !== "jugando") return;

            this.arrastrando = false;
            this.erroresDelGesto.clear();
            this.inicioGesto = { x: puntero.x, y: puntero.y };
        });

        this.input.on("pointermove", puntero => {
            if (this.estado !== "jugando" || !puntero.isDown) return;
            if (!this.inicioGesto) return;

            const recorrido = Phaser.Math.Distance.Between(
                this.inicioGesto.x,
                this.inicioGesto.y,
                puntero.x,
                puntero.y
            );

            if (recorrido < UMBRAL_ARRASTRE) return;

            this.arrastrando = true;
            this.puntosEstela.push({
                x: puntero.x,
                y: puntero.y,
                tiempo: this.time.now
            });

            this.soplarEn(puntero.x, puntero.y);
        });

        this.input.on("pointerup", puntero => {
            if (this.estado !== "jugando") return;

            if (!this.arrastrando) this.golpearEn(puntero.x, puntero.y);

            this.arrastrando = false;
            this.inicioGesto = null;
        });
    }

    /**
     * Redibuja la estela del dedo y descarta los puntos ya desvanecidos.
     * Va en `update` y no en el propio `pointermove` para que la cola siga
     * apagándose aunque el dedo se quede quieto.
     */
    update() {
        if (!this.estela?.active) return;

        const ahora = this.time.now;

        this.puntosEstela = this.puntosEstela.filter(
            punto => ahora - punto.tiempo <= DURACION_ESTELA_MS
        );

        this.estela.clear();

        if (this.estado !== "jugando") return;

        const grosor = Math.max(5, this.alto * 0.011);

        for (let i = 1; i < this.puntosEstela.length; i++) {
            const inicio = this.puntosEstela[i - 1];
            const fin = this.puntosEstela[i];

            const alpha = Phaser.Math.Clamp(
                1 - (ahora - fin.tiempo) / DURACION_ESTELA_MS,
                0,
                1
            );

            this.estela.lineStyle(grosor + 7, 0xFFD34E, alpha * 0.55);
            this.estela.lineBetween(inicio.x, inicio.y, fin.x, fin.y);
            this.estela.lineStyle(grosor, 0xFFFFFF, alpha * 0.95);
            this.estela.lineBetween(inicio.x, inicio.y, fin.x, fin.y);
        }
    }

    granoEn(x, y) {
        // El grano se dibuja pequeño, pero el área que acepta el dedo no puede
        // encogerse con él o dejaría de ser tocable en celular.
        const radioMinimo = this.ancho * 0.035;

        return this.granos.find(grano => {
            if (grano.estado === "limpio") return false;

            return Math.abs(x - grano.x) <=
                    Math.max(grano.displayWidth * 0.75, radioMinimo) &&
                Math.abs(y - grano.y) <=
                    Math.max(grano.displayHeight * 0.95, radioMinimo);
        }) ?? null;
    }

    /** Toque: solo sirve sobre un grano todavía entero. */
    golpearEn(x, y) {
        const grano = this.granoEn(x, y);
        if (!grano) return;

        if (grano.estado !== "entero") {
            this.registrarError();
            return;
        }

        grano.estado = "agrietado";
        grano.setTexture("GranoSecoAgrietado");
        grano.setScale(grano.escalaBase);

        this.sound.play("sfxSeleccionCorrecta", { volume: 0.4 });

        this.tweens.add({
            targets: grano,
            scale: grano.escalaBase * 1.16,
            duration: 90,
            yoyo: true,
            ease: "Sine.Out"
        });

        this.cameras.main.shake(90, 0.0025);
    }

    /** Deslizamiento: solo sirve sobre un grano ya quebrado. */
    soplarEn(x, y) {
        const grano = this.granoEn(x, y);
        if (!grano) return;

        if (grano.estado === "entero") {
            // Un mismo deslizamiento no puede costar seis vidas seguidas.
            if (this.erroresDelGesto.has(grano)) return;

            this.erroresDelGesto.add(grano);
            this.registrarError();
            return;
        }

        if (grano.estado !== "agrietado") return;

        grano.estado = "limpio";
        this.lanzarCascarilla(grano);

        grano.setTexture("SemillaCacaoBuena");
        grano.setScale(grano.escalaBase * 0.9);

        this.tweens.add({
            targets: grano,
            scale: grano.escalaBase,
            duration: 220,
            ease: "Back.Out"
        });

        this.registrarAcierto();
    }

    /** La cascarilla sale volando: es la señal de que el grano quedó limpio. */
    lanzarCascarilla(grano) {
        for (let i = 0; i < 3; i++) {
            const trozo = this.add.image(
                grano.x,
                grano.y,
                "GranoSecoAgrietado"
            );

            trozo
                .setScale(grano.escalaBase * 0.42)
                .setDepth(grano.depth + 1)
                .setTint(0xC7A183);

            this.tweens.add({
                targets: trozo,
                x: grano.x + Phaser.Math.Between(60, 190),
                y: grano.y - Phaser.Math.Between(30, 120),
                angle: Phaser.Math.Between(120, 360),
                alpha: 0,
                scale: grano.escalaBase * 0.18,
                duration: Phaser.Math.Between(420, 620),
                ease: "Sine.Out",
                onComplete: () => trozo.destroy()
            });
        }
    }

    habilitarMecanica() {
        this.input.enabled = true;
    }

    deshabilitarMecanica() {
        this.arrastrando = false;
        this.inicioGesto = null;

        // La estela no debe quedarse congelada en pantalla durante la pausa.
        this.puntosEstela = [];
        this.estela?.clear();
    }

}
