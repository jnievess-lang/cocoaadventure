import Phaser from "phaser";

/**
 * Lupa que amplía de verdad lo que tiene debajo.
 *
 * Usa una segunda cámara de Phaser con zoom, recortada en círculo con una
 * máscara, que se mueve con la lupa. Alrededor del cristal dibuja un anillo que
 * se va llenando mientras se sostiene la lupa sobre una plaga: al completarse,
 * la plaga queda encontrada.
 *
 * Si la máscara circular no estuviera disponible, el cristal se vería cuadrado
 * pero el aumento y el anillo seguirían funcionando.
 */
export default class LupaAumento {

    constructor(scene, config) {
        this.scene = scene;
        this.config = config;
        this.radio = config.radio;
        // El anillo se dibuja sobre el aro de la lupa, no sobre el cristal, y
        // por encima del propio sprite: si no, el dibujo de la lupa lo tapa.
        this.radioAnillo = config.radioAnillo ?? config.radio;
        this.progreso = 0;
        this.objetivoActual = null;
        this.activa = false;

        this.crearCamara();
        this.crearAnillo();
    }

    crearCamara() {
        const lado = this.radio * 2;

        this.camara = this.scene.cameras.add(0, 0, lado, lado);
        this.camara.setZoom(this.config.zoom ?? 2);
        this.camara.setVisible(false);
        this.camara.transparent = true;

        this.mascara = this.scene.make.graphics({ x: 0, y: 0, add: false });
        this.camara.setMask(
            new Phaser.Display.Masks.GeometryMask(this.scene, this.mascara)
        );
    }

    crearAnillo() {
        this.anillo = this.scene.add.graphics();
        this.anillo.setDepth(this.config.depth ?? 90);
        this.anillo.setVisible(false);
    }

    /**
     * La cámara de la lupa solo debe mostrar el escenario: ni el HUD, ni la
     * propia lupa, ni el anillo, o se verían duplicados dentro del cristal.
     */
    definirContenido(visibles) {
        this.visibles = visibles;
        this.actualizarIgnorados();
    }

    actualizarIgnorados() {
        if (!this.visibles) return;

        const ignorar = this.scene.children.list.filter(
            objeto => !this.visibles.includes(objeto)
        );

        this.camara.ignore(ignorar);
    }

    mover(x, y) {
        this.x = x;
        this.y = y;

        this.camara.setPosition(x - this.radio, y - this.radio);
        this.camara.centerOn(x, y);

        this.mascara.clear();
        this.mascara.fillStyle(0xFFFFFF, 1);
        this.mascara.fillCircle(x, y, this.radio);
    }

    mostrar(x, y) {
        this.activa = true;
        this.actualizarIgnorados();
        this.mover(x, y);
        this.camara.setVisible(true);
        this.anillo.setVisible(true);
        this.dibujarAnillo();
    }

    ocultar() {
        this.activa = false;
        this.objetivoActual = null;
        this.progreso = 0;
        this.camara.setVisible(false);
        this.anillo.setVisible(false);
        this.anillo.clear();
    }

    /**
     * Avanza el anillo mientras la lupa siga sobre el mismo objetivo. Al
     * cambiar de objetivo el progreso vuelve a empezar, para que haya que
     * detenerse en cada plaga.
     */
    actualizar(objetivo, delta) {
        if (!this.activa) return false;

        if (objetivo !== this.objetivoActual) {
            this.objetivoActual = objetivo;
            this.progreso = 0;
        }

        if (!objetivo) {
            this.dibujarAnillo();
            return false;
        }

        this.progreso = Math.min(
            1,
            this.progreso + delta / (this.config.duracionBusqueda ?? 900)
        );

        this.dibujarAnillo();

        if (this.progreso < 1) return false;

        this.progreso = 0;
        this.objetivoActual = null;
        return true;
    }

    dibujarAnillo() {
        if (!this.anillo) return;

        const radio = this.radioAnillo;
        const grosor = Math.max(8, radio * 0.16);

        this.anillo.clear();

        // Pista oscura para que el avance se distinga sobre cualquier fondo.
        this.anillo.lineStyle(grosor, 0x2E1A0E, 0.55);
        this.anillo.strokeCircle(this.x, this.y, radio);

        if (this.progreso <= 0) return;

        this.anillo.lineStyle(grosor, 0x9CCC3A, 1);
        this.anillo.beginPath();
        this.anillo.arc(
            this.x,
            this.y,
            radio,
            Phaser.Math.DegToRad(-90),
            Phaser.Math.DegToRad(-90 + 360 * this.progreso),
            false
        );
        this.anillo.strokePath();
    }

    destroy() {
        this.scene?.cameras?.remove(this.camara);
        this.mascara?.destroy();
        this.anillo?.destroy();
    }

}
