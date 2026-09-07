import EscenaBuscarObjetivos from "./EscenaBuscarObjetivos";
import ProgressManager from "../managers/ProgressManager";
import {
    regar,
    inclinarRegadera,
    boquillaDe,
    colocarRegaderaSobre
} from "../utils/efectosMantenimiento";

// Cuánto se inclina la regadera para verter. El mismo número manda en las tres
// cuentas —dónde se coloca, cuánto gira y de dónde sale el agua— para que el
// chorro nazca siempre en el pico y no flotando sobre él.
const GRADOS_VERTIDO = 38;

const CONFIGURACION_NIVEL = Object.freeze({

    fondo: "FondoFincaCacao",

    tutorial: "Arrastra la regadera hasta las plantas caídas para darles agua. Suéltala encima y la regadera vuelve sola a su sitio. Las que ya están verdes no necesitan más.",

    tituloExito: "¡Bien regado!",

    voces: {
        instruccion: "vozRegarInstruccion",
        ayuda: "vozRegarAyuda",
        completado: "vozRegarCompletado",
        tiempoAgotado: "vozRegarTiempoAgotado"
    },

    duracionSegundos: 60,
    vidasMaximas: 3,

    totalObjetivos: 5,
    totalDistractores: 3,
    iconoContador: "IconoRegadera",
    tamanoObjetivo: 0.085,
    tamanoHerramienta: 0.16,

    // La regadera en reposo, sin gotas dibujadas: el agua la ponen las
    // partículas al verter, y así no se ve mojando mientras se arrastra.
    herramienta: {
        clave: "regadera",
        textura: "IconoRegaderaQuieta",
        etiqueta: "Regadera"
    },

    // Se queda vertiendo sobre la planta antes de regresar a su sitio.
    esperaAlUsar: 1000,

    objetivos: [
        { textura: "PlantaMarchita", texturaResuelta: "PlantaSana" }
    ],

    distractores: [
        { textura: "PlantaSana" }
    ],

    posiciones: [
        { x: 0.16, y: 0.72 },
        { x: 0.36, y: 0.72 },
        { x: 0.56, y: 0.72 },
        { x: 0.76, y: 0.72 },
        { x: 0.22, y: 0.92 },
        { x: 0.39, y: 0.92 },
        { x: 0.56, y: 0.92 },
        { x: 0.73, y: 0.92 }
    ],

    // La regadera se acomoda arriba y a la derecha de la planta, se inclina y
    // el agua sale por su boquilla mientras la planta se endereza y reverdece.
    efecto: (escena, objetivo) => {
        const regadera = escena.herramienta;

        // Los tweens que mueven la regadera se le anotan: si el niño la vuelve a
        // agarrar antes de que termine de verter, el arrastre manda y estos se
        // cortan en lugar de pelearse con el dedo.
        regadera.registrarTweenEfecto(colocarRegaderaSobre(escena, regadera, objetivo, {
            gradosAlVerter: -GRADOS_VERTIDO,
            onListo: () => {
                regadera.registrarTweenEfecto(inclinarRegadera(escena, regadera, {
                    grados: GRADOS_VERTIDO
                }));

                if (escena.cache.audio.exists("sfxRiegoAgua")) {
                    escena.sound.play("sfxRiegoAgua", { volume: 0.5 });
                }

                escena.time.delayedCall(120, () => {
                    // Se pregunta por el pico ya inclinado del todo, no por el
                    // de este instante: el emisor se queda fijo donde nace y la
                    // regadera aún está terminando de girar.
                    const salida = boquillaDe(regadera, -GRADOS_VERTIDO) ?? {
                        x: objetivo.x,
                        y: objetivo.y - objetivo.displayHeight
                    };

                    regar(escena, salida.x, salida.y, {
                        depth: objetivo.depth + 5
                    });
                });
            }
        }));
    },

    guardarProgreso: estrellas => ProgressManager.completeRegar(estrellas)

});

export default class RegarScene extends EscenaBuscarObjetivos {

    constructor() {
        super("RegarScene", CONFIGURACION_NIVEL);
    }

}
