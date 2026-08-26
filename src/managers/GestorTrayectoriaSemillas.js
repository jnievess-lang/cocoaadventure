import Phaser from "phaser";
import { sonAdyacentes } from "../utils/generadorMatrizSemillas";
import { interpolarCeldas } from "../utils/trayectoriaSemillas";

export default class GestorTrayectoriaSemillas {

    constructor(scene, config) {
        this.scene = scene;
        this.config = config;
        this.habilitado = false;
        this.activo = false;
        this.bloqueadoHastaSoltar = false;
        this.seleccion = [];
        this.ultimoPunto = null;
        this.tablero = config.obtenerTablero?.() ?? null;
        this.grafico = scene.add.graphics();
        if (this.tablero) {
            // El trazo queda sobre las celdas, pero detrás de las fichas.
            this.tablero.addAt(this.grafico, Math.min(2, this.tablero.length));
        }
        else {
            this.grafico.setDepth(config.depth ?? 70);
        }
        this.ultimaConexionMs = -Infinity;

        this.alPresionar = pointer => this.iniciar(pointer);
        this.alMover = pointer => this.mover(pointer);
        this.alSoltar = pointer => this.terminar(pointer);
        this.alCancelarDom = () => this.cancelar();

        scene.input.on("pointerdown", this.alPresionar);
        scene.input.on("pointermove", this.alMover);
        scene.input.on("pointerup", this.alSoltar);
        scene.input.on("pointerupoutside", this.alSoltar);
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
        const ficha = this.config.obtenerFicha?.(pointer.x, pointer.y);
        if (!ficha) return;

        this.activo = true;
        this.bloqueadoHastaSoltar = false;
        this.seleccion = [];
        this.ultimoPunto = { x: pointer.x, y: pointer.y };
        this.procesarFicha(ficha);
    }

    mover(pointer) {
        if (!this.activo || !pointer.isDown || this.bloqueadoHastaSoltar) return;
        this.procesarMovimiento(pointer);
    }

    procesarMovimiento(pointer) {
        const actual = { x: pointer.x, y: pointer.y };
        interpolarCeldas(
            this.ultimoPunto,
            actual,
            this.config.obtenerTamanoCelda?.() ?? 80
        ).forEach(punto => {
            if (this.bloqueadoHastaSoltar) return;
            const ficha = this.config.obtenerFicha?.(punto.x, punto.y);
            if (ficha) this.procesarFicha(ficha);
        });
        this.ultimoPunto = actual;
        this.dibujar(pointer);
    }

    procesarFicha(ficha) {
        if (!this.activo || !ficha?.active) return;
        if (ficha.tipo === "bomba") {
            const seleccionAnterior = [...this.seleccion];
            this.cancelarSeleccionVisual();
            this.bloqueadoHastaSoltar = true;
            this.config.alTocarBomba?.(ficha, seleccionAnterior);
            return;
        }

        const ultima = this.seleccion.at(-1);
        if (!ultima) {
            this.agregar(ficha);
            return;
        }
        if (ficha === ultima) return;

        if (this.seleccion.length >= 2 && ficha === this.seleccion.at(-2)) {
            const retirada = this.seleccion.pop();
            retirada.marcarSeleccionada(false);
            this.dibujar();
            return;
        }
        if (this.seleccion.includes(ficha)) return;
        if (!sonAdyacentes(ultima, ficha, this.config.permiteDiagonales ?? true)) return;

        if (ficha.tipo !== this.seleccion[0].tipo) {
            const seleccionAnterior = [...this.seleccion];
            this.cancelarSeleccionVisual();
            this.bloqueadoHastaSoltar = true;
            this.config.alMezclarTipos?.(ficha, seleccionAnterior);
            return;
        }
        this.agregar(ficha);
    }

    agregar(ficha) {
        this.seleccion.push(ficha);
        ficha.marcarSeleccionada(true);
        if (this.scene.time.now - this.ultimaConexionMs >= 70) {
            this.ultimaConexionMs = this.scene.time.now;
            this.config.alConectar?.(this.seleccion.length);
        }
        this.dibujar();
    }

    terminar(pointer) {
        if (!this.activo) return;
        if (!this.bloqueadoHastaSoltar && pointer) this.procesarMovimiento(pointer);

        const seleccion = [...this.seleccion];
        this.activo = false;
        this.bloqueadoHastaSoltar = false;
        this.seleccion = [];
        this.grafico.clear();

        if (!seleccion.length) return;
        if (seleccion.length < (this.config.minimoTrayectoria ?? 3)) {
            seleccion.forEach(ficha => ficha.marcarSeleccionada(false));
            this.config.alTrayectoriaCorta?.(seleccion);
            return;
        }
        this.config.alTrayectoriaValida?.(seleccion);
    }

    dibujar(pointer = null) {
        this.grafico.clear();
        if (!this.seleccion.length) return;
        const tablero = this.tablero ?? this.config.obtenerTablero?.();
        const tipo = this.seleccion[0].tipo;
        const colorHalo = tipo === "buena" ? 0xFFC928 : 0xA94F2B;
        const colorExterior = tipo === "buena" ? 0xFFE36B : 0xD98250;
        const colorInterior = tipo === "buena" ? 0xFFFFFF : 0xFFD0A8;
        const puntos = this.seleccion.map(ficha => ({
            x: this.tablero ? ficha.x : tablero.x + ficha.x,
            y: this.tablero ? ficha.y : tablero.y + ficha.y
        }));
        if (pointer && this.activo) {
            puntos.push({
                x: this.tablero ? pointer.x - tablero.x : pointer.x,
                y: this.tablero ? pointer.y - tablero.y : pointer.y
            });
        }

        for (let indice = 1; indice < puntos.length; indice++) {
            this.grafico.lineStyle(Math.max(22, this.scene.scale.height * 0.030), colorHalo, 0.40);
            this.grafico.lineBetween(puntos[indice - 1].x, puntos[indice - 1].y, puntos[indice].x, puntos[indice].y);
            this.grafico.lineStyle(Math.max(14, this.scene.scale.height * 0.019), colorExterior, 0.88);
            this.grafico.lineBetween(puntos[indice - 1].x, puntos[indice - 1].y, puntos[indice].x, puntos[indice].y);
            this.grafico.lineStyle(Math.max(6, this.scene.scale.height * 0.008), colorInterior, 0.95);
            this.grafico.lineBetween(puntos[indice - 1].x, puntos[indice - 1].y, puntos[indice].x, puntos[indice].y);
        }

        if (tipo === "danada") {
            puntos.slice(0, -1).forEach(punto => {
                this.grafico.fillStyle(0xFFD0A8, 1);
                this.grafico.fillPoints([
                    { x: punto.x, y: punto.y - 7 },
                    { x: punto.x + 7, y: punto.y },
                    { x: punto.x, y: punto.y + 7 },
                    { x: punto.x - 7, y: punto.y }
                ], true);
            });
        }
    }

    cancelarSeleccionVisual() {
        this.seleccion.forEach(ficha => ficha.marcarSeleccionada(false));
        this.seleccion = [];
        this.grafico.clear();
    }

    cancelar() {
        this.cancelarSeleccionVisual();
        this.activo = false;
        this.bloqueadoHastaSoltar = false;
        this.ultimoPunto = null;
    }

    destroy() {
        if (!this.scene) return;
        this.cancelar();
        this.scene.input.off("pointerdown", this.alPresionar);
        this.scene.input.off("pointermove", this.alMover);
        this.scene.input.off("pointerup", this.alSoltar);
        this.scene.input.off("pointerupoutside", this.alSoltar);
        this.scene.game.canvas?.removeEventListener("pointercancel", this.alCancelarDom);
        this.grafico?.destroy();
        this.grafico = null;
        this.tablero = null;
        this.scene = null;
    }
}
