import Phaser from "phaser";
import FichaSemilla from "../objects/FichaSemilla";
import {
    generarMatrizSemillas,
    TIPOS_SEMILLA,
    validarMatrizSemillas,
    sonAdyacentes
} from "../utils/generadorMatrizSemillas";

export default class TableroClasificacionSemillas extends Phaser.GameObjects.Container {

    constructor(scene, config) {
        super(scene, config.x, config.y);
        scene.add.existing(this);
        this.config = config;
        this.filas = config.filas;
        this.columnas = config.columnas;
        this.tamano = config.tamano;
        this.margen = this.tamano * 0.065;
        this.ladoInterior = this.tamano - this.margen * 2;
        this.tamanoCelda = this.ladoInterior / Math.max(this.filas, this.columnas);
        this.fichas = [];
        this.matriz = [];
        this.habilitado = false;
        this.setDepth(config.depth ?? 10);
        this.crearMarcoYCeldas();
    }

    crearMarcoYCeldas() {
        this.marco = this.scene.add.image(0, 0, "MarcoTableroSemillas");
        this.marco.setDisplaySize(this.tamano, this.tamano);
        this.add(this.marco);

        this.celdas = this.scene.add.graphics();
        this.celdas.lineStyle(Math.max(2, this.tamanoCelda * 0.035), 0x6A3617, 0.72);
        for (let fila = 0; fila < this.filas; fila++) {
            for (let columna = 0; columna < this.columnas; columna++) {
                const pos = this.obtenerPosicion(fila, columna);
                this.celdas.fillStyle((fila + columna) % 2 ? 0xA95C24 : 0xBC6E2E, 0.28);
                this.celdas.fillRoundedRect(
                    pos.x - this.tamanoCelda * 0.45,
                    pos.y - this.tamanoCelda * 0.45,
                    this.tamanoCelda * 0.90,
                    this.tamanoCelda * 0.90,
                    this.tamanoCelda * 0.10
                );
                this.celdas.strokeRoundedRect(
                    pos.x - this.tamanoCelda * 0.45,
                    pos.y - this.tamanoCelda * 0.45,
                    this.tamanoCelda * 0.90,
                    this.tamanoCelda * 0.90,
                    this.tamanoCelda * 0.10
                );
            }
        }
        this.add(this.celdas);
    }

    obtenerPosicion(fila, columna) {
        return {
            x: -this.ladoInterior / 2 + this.tamanoCelda * (columna + 0.5),
            y: -this.ladoInterior / 2 + this.tamanoCelda * (fila + 0.5)
        };
    }

    cargarNivel(opciones = {}) {
        this.limpiarFichas();
        this.matriz = generarMatrizSemillas({
            ...this.config,
            ...opciones,
            requiereBuenas: this.config.requiereBuenas?.() ?? true,
            requiereDanadas: this.config.requiereDanadas?.() ?? true,
            probabilidadBuena: this.config.probabilidadBuena?.() ?? 0.5
        });
        this.crearFichasDesdeMatriz();
    }

    cargarPractica() {
        this.limpiarFichas();
        this.matriz = Array.from({ length: this.filas }, () =>
            Array(this.columnas).fill(null)
        );
        const fila = Math.floor(this.filas / 2);
        const inicio = Math.floor(this.columnas / 2) - 1;
        for (let columna = inicio; columna < inicio + 3; columna++) {
            this.matriz[fila][columna] = TIPOS_SEMILLA.BUENA;
        }
        this.crearFichasDesdeMatriz();
    }

    crearFichasDesdeMatriz() {
        this.fichas = Array.from({ length: this.filas }, () =>
            Array(this.columnas).fill(null)
        );
        this.matriz.forEach((fila, f) => fila.forEach((tipo, c) => {
            if (tipo) this.fichas[f][c] = this.crearFicha(tipo, f, c);
        }));
    }

    crearFicha(tipo, fila, columna, desplazamientoY = 0) {
        const posicion = this.obtenerPosicion(fila, columna);
        const ficha = new FichaSemilla(this.scene, {
            tipo,
            fila,
            columna,
            x: posicion.x,
            y: posicion.y + desplazamientoY,
            tamanoCelda: this.tamanoCelda,
            depth: 4
        });
        this.add(ficha);
        return ficha;
    }

    obtenerFichaEnPunto(xMundo, yMundo) {
        if (!this.habilitado) return null;
        const localX = xMundo - this.x;
        const localY = yMundo - this.y;
        const columna = Math.floor((localX + this.ladoInterior / 2) / this.tamanoCelda);
        const fila = Math.floor((localY + this.ladoInterior / 2) / this.tamanoCelda);
        if (fila < 0 || columna < 0 || fila >= this.filas || columna >= this.columnas) return null;
        return this.fichas[fila]?.[columna] ?? null;
    }

    setHabilitado(habilitado) {
        this.habilitado = habilitado;
        return this;
    }

    cancelarSeleccion() {
        this.fichas.flat().filter(Boolean).forEach(ficha => ficha.marcarSeleccionada(false));
    }

    resolverTrayectoria(seleccionadas, destino, duracion, alCompletar) {
        seleccionadas.forEach((ficha, indice) => {
            this.matriz[ficha.fila][ficha.columna] = null;
            this.fichas[ficha.fila][ficha.columna] = null;
            this.scene.tweens.add({
                targets: ficha,
                x: destino.x - this.x,
                y: destino.y - this.y,
                scale: 0.28,
                alpha: 0,
                duration: Math.max(260, duracion - 130),
                delay: indice * 35,
                ease: "Quad.In",
                onComplete: () => ficha.destroy(true)
            });
        });
        this.scene.time.delayedCall(duracion, () => this.rellenar(alCompletar));
    }

    resolverBomba(bomba, duracion, alCompletar) {
        this.matriz[bomba.fila][bomba.columna] = null;
        this.fichas[bomba.fila][bomba.columna] = null;
        bomba.explotar();
        this.scene.time.delayedCall(duracion, () => this.rellenar(alCompletar));
    }

    crearMatrizCompactada() {
        const matriz = Array.from({ length: this.filas }, () => Array(this.columnas).fill(null));
        const objetos = Array.from({ length: this.filas }, () => Array(this.columnas).fill(null));
        for (let columna = 0; columna < this.columnas; columna++) {
            const existentes = [];
            for (let fila = this.filas - 1; fila >= 0; fila--) {
                const ficha = this.fichas[fila][columna];
                if (ficha) existentes.push(ficha);
            }
            existentes.forEach((ficha, indice) => {
                const filaDestino = this.filas - 1 - indice;
                matriz[filaDestino][columna] = ficha.tipo;
                objetos[filaDestino][columna] = ficha;
            });
        }
        return { matriz, objetos };
    }

    completarHuecos(base) {
        const configValidacion = {
            ...this.config,
            requiereBuenas: this.config.requiereBuenas?.() ?? true,
            requiereDanadas: this.config.requiereDanadas?.() ?? true,
            probabilidadBuena: this.config.probabilidadBuena?.() ?? 0.5
        };
        const bombasActuales = base.flat().filter(tipo => tipo === TIPOS_SEMILLA.BOMBA).length;
        const faltanBombas = Math.max(0, this.config.cantidadBombas - bombasActuales);
        const huecos = [];
        base.forEach((fila, f) => fila.forEach((tipo, c) => {
            if (tipo == null) huecos.push({ fila: f, columna: c });
        }));

        for (let intento = 0; intento < 100; intento++) {
            const candidata = base.map(fila => [...fila]);
            let bombasColocadas = 0;
            const orden = Phaser.Utils.Array.Shuffle([...huecos]);
            for (const celda of orden) {
                if (bombasColocadas >= faltanBombas) break;
                const bombas = candidata.flatMap((fila, f) => fila.map((tipo, c) =>
                    tipo === TIPOS_SEMILLA.BOMBA ? { fila: f, columna: c } : null
                )).filter(Boolean);
                if (bombas.every(otra => !sonAdyacentes(celda, otra, true))) {
                    candidata[celda.fila][celda.columna] = TIPOS_SEMILLA.BOMBA;
                    bombasColocadas++;
                }
            }
            if (bombasColocadas !== faltanBombas) continue;

            huecos.forEach(({ fila, columna }) => {
                if (candidata[fila][columna] != null) return;
                candidata[fila][columna] = Math.random() < (this.config.probabilidadBuena?.() ?? 0.5)
                    ? TIPOS_SEMILLA.BUENA
                    : TIPOS_SEMILLA.DANADA;
            });
            if (validarMatrizSemillas(candidata, configValidacion)) return candidata;
        }
        return generarMatrizSemillas(configValidacion);
    }

    rellenar(alCompletar) {
        const { matriz: compacta, objetos } = this.crearMatrizCompactada();
        const completa = this.completarHuecos(compacta);
        const preservaCompactacion = completa.every((fila, f) => fila.every((tipo, c) =>
            compacta[f][c] == null || compacta[f][c] === tipo
        ));

        if (!preservaCompactacion) {
            this.config.alMezclar?.();
            this.limpiarFichas();
            this.matriz = completa;
            this.crearFichasDesdeMatriz();
            alCompletar?.();
            return;
        }

        this.matriz = completa;
        this.fichas = Array.from({ length: this.filas }, () => Array(this.columnas).fill(null));
        completa.forEach((fila, f) => fila.forEach((tipo, c) => {
            let ficha = objetos[f][c];
            const posicion = this.obtenerPosicion(f, c);
            if (ficha) {
                ficha.fila = f;
                ficha.columna = c;
                this.scene.tweens.add({ targets: ficha, x: posicion.x, y: posicion.y, duration: 250, ease: "Bounce.Out" });
            }
            else {
                ficha = this.crearFicha(tipo, f, c, -this.tamano * 0.18);
                this.scene.tweens.add({ targets: ficha, y: posicion.y, duration: 330, ease: "Bounce.Out" });
            }
            this.fichas[f][c] = ficha;
        }));
        this.scene.time.delayedCall(350, () => alCompletar?.());
    }

    limpiarFichas() {
        this.fichas.flat?.().filter(Boolean).forEach(ficha => ficha.destroy(true));
        this.fichas = [];
    }

    destroy(fromScene) {
        this.limpiarFichas();
        super.destroy(fromScene);
    }
}
