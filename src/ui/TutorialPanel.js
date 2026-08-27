import Phaser from "phaser";

export default class TutorialPanel extends Phaser.GameObjects.Container {

    constructor(scene, config) {
        super(scene, 0, 0);
        scene.add.existing(this);

        this.config = config;
        this.gameWidth = scene.scale.width;
        this.gameHeight = scene.scale.height;
        this.closing = false;

        this.setDepth(2500);
        this.createBlocker();
        this.createCharacter();
        this.createBubble();
        this.createText();
        this.createActions();
        this.playAnimation();
    }

    createBlocker() {
        const blocker = this.scene.add.rectangle(
            this.gameWidth / 2,
            this.gameHeight / 2,
            this.gameWidth,
            this.gameHeight,
            0x10220D,
            0.30
        ).setInteractive();

        this.add(blocker);
    }

    createCharacter() {
        this.character = this.scene.add.image(
            -this.gameWidth * 0.18,
            this.gameHeight * 0.98,
            this.config.character
        );

        this.character
            .setOrigin(0, 1)
            .setScale((this.gameHeight * 0.45) / this.character.height);

        this.add(this.character);
    }

    createBubble() {
        this.bubble = this.scene.add.image(
            this.gameWidth * 0.29,
            this.gameHeight * 0.52,
            "GloboTexto"
        );

        // El globo crece con el ancho, pero tiene un límite basado en la altura
        // para no invadir la pantalla en celulares ultrapanorámicos.
        this.bubbleScale = Math.min(
            (this.gameWidth * 0.34) / this.bubble.width,
            (this.gameHeight * 0.64) / this.bubble.height
        );
        this.bubble.setScale(0).setAlpha(0);
        this.add(this.bubble);
    }

    createText() {
        const anchoGlobo = this.bubble.width * this.bubbleScale;
        const altoGlobo = this.bubble.height * this.bubbleScale;

        // La cola ocupa la parte inferior del PNG. Estas proporciones mantienen
        // el texto dentro del cuerpo blanco y lejos del borde oscuro.
        this.anchoSeguroTexto = anchoGlobo * 0.82;
        this.altoSeguroTexto = altoGlobo * (this.config.confirmText ? 0.37 : 0.60);

        this.text = this.scene.add.text(
            this.bubble.x,
            this.bubble.y - altoGlobo * (this.config.confirmText ? 0.12 : 0.07),
            this.config.text,
            {
                fontFamily: "Trebuchet MS",
                fontSize: `${this.gameHeight * 0.043}px`,
                color: "#3B2416",
                fontStyle: "bold",
                align: "center",
                lineSpacing: Math.max(1, Math.round(this.gameHeight * 0.002)),
                wordWrap: {
                    width: this.anchoSeguroTexto,
                    useAdvancedWrap: true
                }
            }
        );

        this.text.setOrigin(0.5).setAlpha(0);
        this.ajustarTextoAlGlobo();
        this.add(this.text);
    }

    ajustarTextoAlGlobo() {
        const tamanoInicial = Math.round(this.gameHeight * 0.043);
        const tamanoMinimoPreferido = Math.round(this.gameHeight * 0.028);
        const tamanoMinimoAbsoluto = Math.max(12, Math.round(this.gameHeight * 0.021));

        let tamano = tamanoInicial;
        this.text.setFontSize(tamano);

        // Phaser recalcula width/height al cambiar el tamaño. Primero se intenta
        // conservar al menos 2,8 % de la altura (mayor que el 2,5 % anterior).
        while (
            tamano > tamanoMinimoPreferido
            && (this.text.width > this.anchoSeguroTexto || this.text.height > this.altoSeguroTexto)
        ) {
            tamano -= 1;
            this.text.setFontSize(tamano);
        }

        // Respaldo para textos futuros excepcionalmente largos: nunca se deja
        // que una instrucción se salga del globo, aunque incumpla la longitud
        // recomendada en la guía de contenidos.
        while (
            tamano > tamanoMinimoAbsoluto
            && (this.text.width > this.anchoSeguroTexto || this.text.height > this.altoSeguroTexto)
        ) {
            tamano -= 1;
            this.text.setFontSize(tamano);
        }

        this.fontSizeAplicado = tamano;
    }

    createActions() {
        if (!this.config.confirmText) return;

        const y = this.gameHeight * 0.59;

        this.confirmButton = this.createButton(
            this.gameWidth * 0.33,
            y,
            this.config.confirmText,
            () => this.hideTutorial(),
            0xE57B25
        );

        if (this.config.replayText) {
            this.replayButton = this.createButton(
                this.gameWidth * 0.20,
                y,
                this.config.replayText,
                () => this.playVoice(),
                0x4B9B49
            );
        }
    }

    createButton(x, y, label, callback, color) {
        const container = this.scene.add.container(x, y).setAlpha(0);
        const background = this.scene.add.rectangle(
            0,
            0,
            this.gameWidth * 0.115,
            this.gameHeight * 0.068,
            color,
            1
        );

        background
            .setStrokeStyle(5, 0x6A3818, 1)
            .setInteractive({ useHandCursor: true });

        const text = this.scene.add.text(0, 0, label, {
            fontFamily: "Trebuchet MS",
            fontSize: `${this.gameHeight * 0.021}px`,
            color: "#FFFFFF",
            fontStyle: "bold"
        }).setOrigin(0.5);

        background.on("pointerdown", () => {
            this.scene.sound.play("sfxBotonTocar", { volume: 1 });
            container.setScale(0.96);
        });
        background.on("pointerout", () => container.setScale(1));
        background.on("pointerup", () => {
            container.setScale(1);
            callback();
        });

        container.add([background, text]);
        this.add(container);
        return container;
    }

    // Las animaciones de entrada pueden terminar cuando el panel ya se cerró
    // o la escena cambió. Cada callback comprueba que el panel siga vivo antes
    // de tocar la escena.
    sigueActivo() {
        return !!this.scene && this.active && !this.closing;
    }

    playAnimation() {
        this.scene.tweens.add({
            targets: this.character,
            x: this.gameWidth * 0.02,
            duration: 500,
            ease: "Back.Out",
            onComplete: () => {
                if (!this.sigueActivo()) return;
                this.scene.time.delayedCall(180, () => {
                    if (this.sigueActivo()) this.showBubble();
                });
            }
        });
    }

    showBubble() {
        if (!this.sigueActivo()) return;

        const actionTargets = [this.text];
        if (this.confirmButton) actionTargets.push(this.confirmButton);
        if (this.replayButton) actionTargets.push(this.replayButton);

        this.scene.tweens.add({
            targets: this.bubble,
            alpha: 1,
            scale: this.bubbleScale,
            duration: 250,
            ease: "Back.Out",
            onComplete: () => {
                if (!this.sigueActivo()) return;
                this.scene.tweens.add({ targets: actionTargets, alpha: 1, duration: 160 });
                this.playVoice();
            }
        });
    }

    playVoice() {
        if (!this.sigueActivo()) return;

        if (this.voice) {
            this.voice.stop();
            this.voice.destroy();
        }

        this.config.onVoiceStart?.();

        // Sin la voz cargada el tutorial sigue siendo legible: el globo de
        // texto conserva la instrucción completa.
        if (!this.scene.cache.audio.exists(this.config.audio)) {
            this.config.onVoiceComplete?.();
            if (!this.config.confirmText) {
                this.programarTemporizadorVoz(2600, () => this.hideTutorial());
            }
            return;
        }

        const voice = this.scene.sound.add(this.config.audio, { volume: 1 });
        this.voice = voice;
        let terminada = false;

        const finish = () => {
            if (terminada || !this.sigueActivo()) return;
            terminada = true;

            this.limpiarTemporizadorVoz();

            this.config.onVoiceComplete?.();
            if (this.voice === voice) {
                voice.destroy();
                this.voice = null;
            }
            if (!this.config.confirmText) this.hideTutorial();
        };

        // El oyente se registra antes de iniciar la reproducción para no
        // perder el evento en WebView cuando el audio ya está decodificado.
        voice.once("complete", finish);

        if (voice.play()) {

            // Cuando el tutorial no tiene botón de continuar, su cierre depende
            // del evento `complete`. Algunos WebView no lo emiten al finalizar
            // ciertos MP3. El respaldo usa el reloj del navegador, independiente
            // del reloj de Phaser, para que una escena pausada no deje el globo
            // bloqueado permanentemente.
            this.programarTemporizadorVoz(
                (voice.duration || 6) * 1000 + 350,
                finish
            );
        }
        else this.programarTemporizadorVoz(400, finish);
    }

    programarTemporizadorVoz(duracionMs, callback) {
        this.limpiarTemporizadorVoz();
        this.temporizadorVoz = window.setTimeout(() => {
            this.temporizadorVoz = null;
            callback();
        }, duracionMs);
    }

    limpiarTemporizadorVoz() {
        if (this.temporizadorVoz == null) return;
        window.clearTimeout(this.temporizadorVoz);
        this.temporizadorVoz = null;
    }

    hideTutorial() {
        if (this.closing) return;
        this.closing = true;

        this.limpiarTemporizadorVoz();

        if (this.voice) {
            this.voice.stop();
            this.voice.destroy();
            this.voice = null;
            this.config.onVoiceComplete?.();
        }

        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 260,
            onComplete: () => {
                this.destroy(true);
                this.config.onComplete?.();
            }
        });
    }

    destroy(fromScene) {
        this.limpiarTemporizadorVoz();
        if (this.voice) {
            this.voice.stop();
            this.voice.destroy();
            this.voice = null;
        }
        super.destroy(fromScene);
    }

}
