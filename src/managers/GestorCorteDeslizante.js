import Phaser from "phaser";
import intersectaSegmentoElipse from "../utils/intersectaSegmentoElipse";

const DURACION_ESTELA_MS = 140;

export default class GestorCorteDeslizante {

    constructor(scene, config) {
        this.scene = scene;
        this.config = config;
        this.habilitado = false;
        this.gestoActivo = false;
        this.superoDistanciaMinima = false;
        this.puntos = [];
        this.distanciaMinima = config.distanciaMinima ?? Math.max(
            24,
            scene.scale.width * 0.018
        );

        this.estela = scene.add.graphics().setDepth(config.depth ?? 40);

        this.alPresionar = pointer => this.iniciar(pointer);
        this.alMover = pointer => this.mover(pointer);
        this.alSoltar = pointer => this.terminar(pointer);
        this.alCancelar = () => this.cancelar();
        this.alCancelarDom = () => this.cancelar();
        this.alActualizar = () => this.dibujarEstela();

        scene.input.on("pointerdown", this.alPresionar);
        scene.input.on("pointermove", this.alMover);
        scene.input.on("pointerup", this.alSoltar);
        scene.input.on("pointerupoutside", this.alSoltar);
        scene.events.on(Phaser.Scenes.Events.UPDATE, this.alActualizar);
        scene.game.canvas?.addEventListener("pointercancel", this.alCancelarDom);
    }

    setHabilitado(habilitado) {
        this.habilitado = habilitado;
        if (!habilitado) this.cancelar();
        return this;
    }

    iniciar(pointer) {
        if (!this.habilitado || !this.config.puedeInteractuar?.()) return;
        if (this.config.esZonaBloqueada?.(pointer.x, pointer.y)) return;

        this.gestoActivo = true;
        this.superoDistanciaMinima = false;
        this.puntos = [this.crearPunto(pointer)];
    }

    mover(pointer) {
        if (!this.gestoActivo || !pointer.isDown) return;

        this.procesarPunto(pointer);
    }

    procesarPunto(pointer) {
        if (!this.gestoActivo || !pointer) return;

        const anterior = this.puntos[this.puntos.length - 1];
        const actual = this.crearPunto(pointer);
        const origen = this.puntos[0];

        if (actual.x === anterior.x && actual.y === anterior.y) return;

        if (!this.superoDistanciaMinima) {
            const distancia = Phaser.Math.Distance.Between(
                origen.x,
                origen.y,
                actual.x,
                actual.y
            );

            if (distancia >= this.distanciaMinima) {
                this.superoDistanciaMinima = true;
                this.comprobarCortes(origen, actual);
            }
        }
        else {
            this.comprobarCortes(anterior, actual);
        }

        if (!this.habilitado) return;

        this.puntos.push(actual);
        this.eliminarPuntosAntiguos(actual.tiempo);
        this.dibujarEstela();
    }

    terminar(pointer) {
        if (!this.gestoActivo) return;

        // Phaser puede entregar un gesto táctil muy rápido sin un último
        // pointermove. Procesar aquí el segmento final también cubre
        // pointerupoutside sin convertir un toque inmóvil en corte.
        this.procesarPunto(pointer);
        this.gestoActivo = false;
        this.scene.time.delayedCall(DURACION_ESTELA_MS, () => {
            if (!this.gestoActivo) {
                this.puntos = [];
                this.estela?.clear();
            }
        });
    }

    comprobarCortes(inicio, fin) {
        const objetivos = this.config.obtenerObjetivos?.() ?? [];

        objetivos.forEach(objetivo => {
            if (!objetivo?.puedeCortarse?.()) return;

            if (intersectaSegmentoElipse(
                inicio,
                fin,
                objetivo.obtenerAreaCorte()
            )) {
                this.config.alCortar?.(objetivo, inicio, fin);
            }
        });
    }

    crearPunto(pointer) {
        return {
            x: pointer.x,
            y: pointer.y,
            tiempo: this.scene.time.now
        };
    }

    eliminarPuntosAntiguos(ahora) {
        while (
            this.puntos.length > 2 &&
            ahora - this.puntos[0].tiempo > DURACION_ESTELA_MS
        ) {
            this.puntos.shift();
        }
    }

    dibujarEstela() {
        if (!this.estela?.active) return;

        const ahora = this.scene.time.now;
        this.eliminarPuntosAntiguos(ahora);
        this.estela.clear();

        for (let indice = 1; indice < this.puntos.length; indice++) {
            const inicio = this.puntos[indice - 1];
            const fin = this.puntos[indice];
            const antiguedad = ahora - fin.tiempo;
            const alpha = Phaser.Math.Clamp(
                1 - antiguedad / DURACION_ESTELA_MS,
                0,
                1
            );
            const grosor = Math.max(5, this.scene.scale.height * 0.011);

            this.estela.lineStyle(grosor + 7, 0xFFD34E, alpha * 0.55);
            this.estela.lineBetween(inicio.x, inicio.y, fin.x, fin.y);
            this.estela.lineStyle(grosor, 0xFFFFFF, alpha * 0.95);
            this.estela.lineBetween(inicio.x, inicio.y, fin.x, fin.y);
        }
    }

    cancelar() {
        this.gestoActivo = false;
        this.superoDistanciaMinima = false;
        this.puntos = [];
        this.estela?.clear();
    }

    destroy() {
        if (!this.scene) return;

        this.cancelar();
        this.scene.input.off("pointerdown", this.alPresionar);
        this.scene.input.off("pointermove", this.alMover);
        this.scene.input.off("pointerup", this.alSoltar);
        this.scene.input.off("pointerupoutside", this.alSoltar);
        this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.alActualizar);
        this.scene.game.canvas?.removeEventListener(
            "pointercancel",
            this.alCancelarDom
        );
        this.estela?.destroy();
        this.estela = null;
        this.scene = null;
    }
}
