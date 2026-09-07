import Phaser from "phaser";
import EscenaMantenimientoBase from "./EscenaMantenimientoBase";
import ObjetivoMantenimiento from "../objects/ObjetivoMantenimiento";
import HerramientaArrastrable from "../ui/HerramientaArrastrable";

/**
 * Mecánica compartida por Regar, Quitar malezas y Buscar plagas: se reparten
 * objetivos y distractores sobre el terreno, y el niño arrastra la herramienta
 * del nivel hasta los que necesitan atención.
 *
 * Los niveles que la usan solo aportan datos: fondo, herramienta, texturas y
 * posiciones. Buscar plagas sustituye la interacción sobrescribiendo
 * `crearInteraccion`.
 */
export default class EscenaBuscarObjetivos extends EscenaMantenimientoBase {

    crearMecanica() {
        this.objetivos = [];

        this.crearArbol();
        this.repartirObjetivos();
        this.crearInteraccion();
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

    get baseHerramienta() {
        return {
            x: this.ancho * (this.nivel.herramientaX ?? 0.085),
            y: this.alto * (this.nivel.herramientaY ?? 0.80)
        };
    }

    /** Interacción por defecto: arrastrar la herramienta hasta el objetivo. */
    crearInteraccion() {
        const base = this.baseHerramienta;

        this.herramienta = new HerramientaArrastrable(this, {
            x: base.x,
            y: base.y,
            texture: this.nivel.herramienta.textura,
            displayHeight: this.alto * (this.nivel.tamanoHerramienta ?? 0.20),
            // Al acertar se queda sobre la planta mientras dura la animación.
            esperaAlUsar: this.nivel.esperaAlUsar ?? 0,
            onSoltar: (x, y) => this.soltarHerramienta(x, y)
        });

        this.encajarHerramientaEnPantalla();
        this.crearEtiquetaHerramienta();
    }

    /**
     * Mete la herramienta dentro del lienzo si su dibujo se sale.
     *
     * La base es una fracción de la pantalla, pero lo que ocupa la herramienta
     * depende de la altura del lienzo y del origen de su dibujo. La lupa, que se
     * ancla en el cristal y no en el centro, se salía por la izquierda en toda
     * proporción de pantalla —hasta un 7,7 % del ancho en 4:3— y su mango caía
     * por debajo del borde inferior.
     *
     * Se reserva sitio abajo para la etiqueta, que va debajo del dibujo.
     */
    encajarHerramientaEnPantalla(margen = 0.02) {
        const herramienta = this.herramienta;

        if (!herramienta) return;

        const margenX = this.ancho * margen;
        const margenY = this.alto * margen;
        const reservaEtiqueta = this.alto * 0.075;

        const izquierda = herramienta.x - herramienta.originX * herramienta.displayWidth;
        const derecha = herramienta.x + (1 - herramienta.originX) * herramienta.displayWidth;
        const arriba = herramienta.y - herramienta.originY * herramienta.displayHeight;
        const abajo = herramienta.y + (1 - herramienta.originY) * herramienta.displayHeight;

        let dx = 0;
        let dy = 0;

        if (izquierda < margenX) dx = margenX - izquierda;
        else if (derecha > this.ancho - margenX) dx = this.ancho - margenX - derecha;

        if (arriba < margenY) dy = margenY - arriba;
        else if (abajo > this.alto - margenY - reservaEtiqueta) {
            dy = this.alto - margenY - reservaEtiqueta - abajo;
        }

        if (!dx && !dy) return;

        // Se mueve también la base, que es adonde la herramienta regresa al
        // soltarla: si no, volvería al sitio recortado en cada uso.
        herramienta.baseX += dx;
        herramienta.baseY += dy;
        herramienta.setPosition(herramienta.baseX, herramienta.baseY);
    }

    /**
     * La etiqueta se coloca bajo el borde real del dibujo, no a una distancia
     * fija de la base: con la lupa, mucho más alta y anclada en el cristal, una
     * distancia fija la dejaba escrita encima del mango.
     */
    crearEtiquetaHerramienta() {
        const herramienta = this.herramienta;

        const y = herramienta.baseY
            + (1 - herramienta.originY) * herramienta.displayHeight
            + this.alto * 0.028;

        this.etiquetaHerramienta = this.add.text(
            herramienta.baseX,
            y,
            this.nivel.herramienta.etiqueta,
            {
                fontFamily: "Trebuchet MS",
                fontSize: `${this.alto * 0.024}px`,
                color: "#FFF7D8",
                fontStyle: "bold",
                stroke: "#5F3215",
                strokeThickness: 5
            }
        ).setOrigin(0.5, 0).setDepth(79);
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
                // La herramienta manda: el objetivo no se resuelve al tocarlo.
                interactivo: false,
                resolucionExterna: Boolean(this.nivel.resolucionExterna),
                onTocarCorrecto: objetivo => this.resolverObjetivo(objetivo),
                onError: () => this.registrarError()
            }));
        });
    }

    /** Objetivo sin resolver más cercano al punto, si lo hay. */
    objetivoEn(x, y) {
        const candidatos = this.objetivos
            // Un objetivo bloqueado está en pleno temblor de error y no volvería
            // a responder: ignorarlo deja que el acierto de al lado sí cuente.
            .filter(objetivo => !objetivo.bloqueado && objetivo.contienePunto(x, y))
            .sort((a, b) => a.distanciaA(x, y) - b.distanciaA(x, y));

        return candidatos[0] ?? null;
    }

    /**
     * Devuelve si la herramienta sirvió de algo. Solo entonces se queda sobre la
     * planta el tiempo de la animación: tras un fallo debe volver enseguida, y
     * no quedarse un segundo plantada encima de la planta equivocada.
     */
    soltarHerramienta(x, y) {
        if (this.estado !== "jugando") return false;

        const objetivo = this.objetivoEn(x, y);

        if (!objetivo) return false;

        objetivo.seleccionar();
        return objetivo.esObjetivo;
    }

    resolverObjetivo(objetivo) {
        this.nivel.efecto?.(this, objetivo);
        this.registrarAcierto();
    }

    /** Objetivos correctos que aún faltan por atender. */
    objetivosPendientes() {
        return this.objetivos.filter(
            objetivo => objetivo.esObjetivo && !objetivo.resuelto && objetivo.active
        );
    }

    /** La mano recorre el camino real: de la base de la herramienta al objetivo. */
    mostrarPista() {
        const pendientes = this.objetivosPendientes();

        if (!pendientes.length || !this.manoGuia) return;

        const objetivo = Phaser.Utils.Array.GetRandom(pendientes);
        const base = this.baseHerramienta;

        this.manoGuia.mostrarDeslizamiento(
            { x: base.x, y: base.y },
            { x: objetivo.x, y: objetivo.y - objetivo.displayHeight * 0.35 },
            { duracionMovimientoMs: 1100, duracionVisibleMs: 3200 }
        );
    }

    habilitarMecanica() {
        this.herramienta?.habilitar();
    }

    deshabilitarMecanica() {
        this.herramienta?.deshabilitar();
        this.objetivos.forEach(objetivo => objetivo.deshabilitar());
    }

}
