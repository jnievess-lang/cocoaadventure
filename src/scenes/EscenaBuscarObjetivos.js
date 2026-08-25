import Phaser from "phaser";
import EscenaMantenimientoBase from "./EscenaMantenimientoBase";
import ObjetivoMantenimiento from "../objects/ObjetivoMantenimiento";
import SelectorHerramienta from "../ui/SelectorHerramienta";
import animarHerramienta from "../utils/animarHerramienta";

/**
 * Mecánica compartida por Regar, Quitar malezas y Buscar plagas: se reparten
 * objetivos y distractores sobre el terreno y el niño toca únicamente los que
 * necesitan atención.
 *
 * Los niveles que la usan solo aportan datos: fondo, herramienta, texturas y
 * posiciones.
 */
export default class EscenaBuscarObjetivos extends EscenaMantenimientoBase {

    crearMecanica() {
        this.objetivos = [];

        this.crearArbol();
        this.crearInsigniaHerramienta();
        this.repartirObjetivos();
    }

    /**
     * Los niveles que ocurren sobre el árbol de cacao reutilizan la misma
     * ilustración de primer plano que “Seleccionar maduras”. Cuando existe,
     * las posiciones se miden dentro del árbol y no sobre el lienzo.
     */
    crearArbol() {
        if (!this.nivel.arbol) {
            this.arbol = null;
            return;
        }

        this.arbol = this.add.image(
            this.ancho * 0.53,
            this.alto * 0.56,
            this.nivel.arbol
        );

        this.arbol
            .setScale((this.alto * 0.88) / this.arbol.height)
            .setDepth(3);
    }

    resolverPosicion(posicion) {
        if (!this.arbol) {
            return {
                x: this.ancho * posicion.x,
                y: this.alto * posicion.y
            };
        }

        const izquierda = this.arbol.x - this.arbol.displayWidth / 2;
        const arriba = this.arbol.y - this.arbol.displayHeight / 2;

        return {
            x: izquierda + this.arbol.displayWidth * posicion.x,
            y: arriba + this.arbol.displayHeight * posicion.y
        };
    }

    /**
     * Insignia informativa con la herramienta activa del nivel. Reutiliza el
     * selector con una sola opción y nunca se habilita: su función es que el
     * niño lea el nombre de la herramienta que está usando.
     */
    crearInsigniaHerramienta() {
        const herramienta = this.nivel.herramienta;

        this.insignia = new SelectorHerramienta(this, {
            x: this.ancho * (this.nivel.herramientaX ?? 0.075),
            y: this.alto * (this.nivel.herramientaY ?? 0.86),
            herramientas: [herramienta],
            depth: 45
        });
    }

    repartirObjetivos() {
        const posiciones = Phaser.Utils.Array.Shuffle(
            this.nivel.posiciones.slice()
        );

        const piezas = [];

        for (let i = 0; i < this.nivel.totalObjetivos; i++) {
            piezas.push({
                ...Phaser.Utils.Array.GetRandom(this.nivel.objetivos),
                esObjetivo: true
            });
        }

        const totalDistractores = Math.min(
            posiciones.length - this.nivel.totalObjetivos,
            this.nivel.totalDistractores ?? 0
        );

        for (let i = 0; i < totalDistractores; i++) {
            piezas.push({
                ...Phaser.Utils.Array.GetRandom(this.nivel.distractores),
                esObjetivo: false
            });
        }

        Phaser.Utils.Array.Shuffle(piezas).forEach((pieza, indice) => {
            const posicion = this.resolverPosicion(posiciones[indice]);

            this.objetivos.push(new ObjetivoMantenimiento(this, {
                x: posicion.x,
                y: posicion.y,
                texture: pieza.textura,
                texturaResuelta: pieza.texturaResuelta ?? null,
                displayWidth: this.ancho * (
                    pieza.tamano ?? this.nivel.tamanoObjetivo ?? 0.085
                ),
                esObjetivo: pieza.esObjetivo,
                depth: 10 + indice,
                onTocarCorrecto: objetivo => this.resolverObjetivo(objetivo),
                onError: () => this.registrarError()
            }));
        });
    }

    resolverObjetivo(objetivo) {
        animarHerramienta(this, {
            texture: this.nivel.herramienta.textura,
            desdeX: this.ancho * (this.nivel.herramientaX ?? 0.075),
            desdeY: this.alto * (this.nivel.herramientaY ?? 0.86),
            hastaX: objetivo.x,
            hastaY: objetivo.y - objetivo.displayHeight * 0.55,
            displayHeight: this.alto * 0.10
        });

        this.registrarAcierto();
    }

    habilitarMecanica() {
        this.objetivos.forEach(objetivo => objetivo.habilitar());
    }

    deshabilitarMecanica() {
        this.objetivos.forEach(objetivo => objetivo.deshabilitar());
    }

}
