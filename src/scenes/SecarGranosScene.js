import Phaser from "phaser";
import EscenaMantenimientoBase from "./EscenaMantenimientoBase";
import GranoArrastrable from "../objects/GranoArrastrable";
import ProgressManager from "../managers/ProgressManager";

const CONFIGURACION_NIVEL = Object.freeze({

    escenaModulo: "ProcesarScene",

    fondo: "FondoTendalSecado",
    oscurecerFondo: 0.05,

    tutorial: "Arrastra cada grano a su canasta. Los granos lisos van a la canasta del sol, y los agrietados a la canasta de descarte.",

    tituloExito: "¡Listos para el sol!",

    voces: {
        instruccion: "vozSecarGranosInstruccion",
        ayuda: "vozSecarGranosAyuda",
        completado: "vozSecarGranosCompletado",
        tiempoAgotado: "vozSecarGranosTiempoAgotado"
    },

    duracionSegundos: 75,
    vidasMaximas: 3,

    totalObjetivos: 8,
    iconoContador: "GranoSecoBueno",

    guardarProgreso: estrellas => ProgressManager.completeSecado(estrellas)

});

/**
 * Procesar, nivel 1: escoger antes de secar.
 *
 * La mecánica es de arrastre a destino, no de toque: el niño tiene que decidir
 * a qué canasta pertenece cada grano y llevarlo hasta allá. Saber *que* un
 * grano está dañado no basta; hay que separarlo del lote.
 */
export default class SecarGranosScene extends EscenaMantenimientoBase {

    constructor() {
        super("SecarGranosScene", CONFIGURACION_NIVEL);
    }

    crearMecanica() {
        this.granos = [];

        // El reparto se decide antes que nada: cada canasta necesita saber
        // cuántos granos le tocan para reconocer cuándo está llena.
        this.tipos = this.sortearTipos();

        this.crearCanastas();
        this.crearTendal();
    }

    sortearTipos() {
        const tipos = [];

        for (let i = 0; i < this.nivel.totalObjetivos; i++) {
            tipos.push(i % 2 === 0 ? "bueno" : "agrietado");
        }

        return Phaser.Utils.Array.Shuffle(tipos);
    }

    contar(tipo) {
        return this.tipos.filter(t => t === tipo).length;
    }

    crearCanastas() {
        const anchoCanasta = this.ancho * 0.17;
        const y = this.alto * 0.80;

        // Las dos empiezan vacías: cuál es cuál lo dice la etiqueta, no el
        // contenido. Así el niño lee en vez de reconocer el dibujo.
        this.canastaBuenos = this.crearCanasta({
            x: this.ancho * 0.22,
            y,
            ancho: anchoCanasta,
            texturaLlena: "CanastaSecadoBuenos",
            tipo: "bueno",
            capacidad: this.contar("bueno"),
            etiqueta: "AL SOL"
        });

        this.canastaDescarte = this.crearCanasta({
            x: this.ancho * 0.78,
            y,
            ancho: anchoCanasta,
            texturaLlena: "CanastaSecadoDanados",
            tipo: "agrietado",
            capacidad: this.contar("agrietado"),
            etiqueta: "DESCARTE"
        });

        this.canastas = [this.canastaBuenos, this.canastaDescarte];
    }

    crearCanasta(config) {
        const imagen = this.add.image(config.x, config.y, "CanastaSecadoVacia");

        imagen
            .setScale(config.ancho / imagen.width)
            .setDepth(30);

        this.add.text(
            config.x,
            config.y + imagen.displayHeight * 0.58,
            config.etiqueta,
            {
                fontFamily: "Trebuchet MS",
                fontSize: `${this.alto * 0.028}px`,
                color: "#FFF4D6",
                fontStyle: "bold",
                stroke: "#4A2718",
                strokeThickness: 6
            }
        ).setOrigin(0.5).setDepth(31);

        return {
            imagen,
            tipo: config.tipo,
            texturaLlena: config.texturaLlena,
            capacidad: config.capacidad,
            anchoObjetivo: config.ancho,
            recibidos: 0,
            llena: false,
            x: config.x,
            y: config.y
        };
    }

    /**
     * Los granos se reparten sobre el tendal en una rejilla suelta, con algo
     * de desorden para que no parezca una tabla.
     */
    crearTendal() {
        const columnas = 4;
        const anchoGrano = this.ancho * 0.055;

        this.tipos.forEach((tipo, indice) => {
            const columna = indice % columnas;
            const fila = Math.floor(indice / columnas);

            const x = this.ancho * (0.32 + columna * 0.12) +
                Phaser.Math.Between(-18, 18);

            const y = this.alto * (0.30 + fila * 0.17) +
                Phaser.Math.Between(-14, 14);

            this.granos.push(new GranoArrastrable(this, {
                x,
                y,
                tipo,
                texture: tipo === "bueno"
                    ? "GranoSecoBueno"
                    : "GranoSecoAgrietado",
                displayWidth: anchoGrano,
                depth: 20 + indice,
                resolverDestino: (px, py) => this.canastaEn(px, py),
                onSeleccionar: () => this.pulsarCanastas(),
                onAcierto: (grano, destino) => this.registrarGrano(destino),
                onDestinoIncorrecto: () => this.registrarError()
            }));
        });
    }

    canastaEn(x, y) {
        return this.canastas.find(canasta => {
            const imagen = canasta.imagen;

            return Math.abs(x - imagen.x) <= imagen.displayWidth * 0.62 &&
                Math.abs(y - imagen.y) <= imagen.displayHeight * 0.75;
        }) ?? null;
    }

    /**
     * Al levantar un grano laten LAS DOS canastas, no solo la correcta.
     *
     * Es deliberado: destacar únicamente el destino bueno le daría la respuesta
     * al niño y el nivel dejaría de enseñar a distinguir el grano. El latido
     * dice "estos son los destinos", no "ve hacia allá".
     */
    pulsarCanastas() {
        this.canastas.forEach(canasta => this.latir(canasta, 1.05, 220));
    }

    latir(canasta, factor, duracion) {
        const escala = canasta.imagen.scale;

        this.tweens.add({
            targets: canasta.imagen,
            scale: escala * factor,
            duration: duracion,
            yoyo: true,
            ease: "Sine.Out"
        });
    }

    registrarGrano(destino) {
        destino.recibidos++;

        // Latido fuerte del destino que acaba de recibir el grano.
        this.latir(destino, 1.12, 130);

        if (!destino.llena && destino.recibidos >= destino.capacidad) {
            this.llenarCanasta(destino);
        }

        this.registrarAcierto();
    }

    /**
     * La canasta solo cambia de imagen cuando recibió todos sus granos. El
     * ancho se recalcula porque las tres láminas no tienen la misma proporción
     * y, si se conservara la escala, la canasta daría un salto de tamaño.
     */
    llenarCanasta(canasta) {
        canasta.llena = true;
        canasta.imagen.setTexture(canasta.texturaLlena);
        canasta.imagen.setScale(canasta.anchoObjetivo / canasta.imagen.width);

        const escala = canasta.imagen.scale;

        canasta.imagen.setScale(escala * 0.86);

        this.tweens.add({
            targets: canasta.imagen,
            scale: escala,
            duration: 380,
            ease: "Back.Out"
        });
    }

    habilitarMecanica() {
        this.granos.forEach(grano => grano.habilitar());
    }

    deshabilitarMecanica() {
        this.granos.forEach(grano => grano.deshabilitar());
    }

}
