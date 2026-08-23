import Phaser from "phaser";
import CacaoPod from "../objects/CacaoPod";
import TutorialPanel from "../ui/TutorialPanel";
import ResultPanel from "../ui/ResultPanel";
import ProgressManager from "../managers/ProgressManager";

export default class SeleccionarMadurasScene extends Phaser.Scene {

    constructor() {
        super("SeleccionarMadurasScene");
    }

    create() {

        const { width, height } = this.scale;

        this.width = width;
        this.height = height;
        this.totalRipe = 5;
        this.selectedRipe = 0;
        this.remainingTime = 60;
        this.levelState = "tutorial";
        this.pods = [];
        this.indicators = [];
        this.firstWrongVoicePlayed = false;
        this.lastInteractionAt = 0;

        this.createBackground();
        this.createTree();
        this.createHud();
        this.createPauseButton();
        this.ensureMusic();
        this.showTutorial();
        this.setupLifecycleEvents();

    }

    createBackground() {

        const background = this.add.image(
            this.width / 2,
            this.height / 2,
            "FondoFincaCacao"
        );

        const scale = Math.max(
            this.width / background.width,
            this.height / background.height
        );

        background.setScale(scale).setDepth(0);

        this.add.rectangle(
            this.width / 2,
            this.height / 2,
            this.width,
            this.height,
            0x163A18,
            0.08
        ).setDepth(1);

    }

    createTree() {

        this.tree = this.add.image(
            this.width * 0.53,
            this.height * 0.56,
            "ArbolCacaoSeleccion"
        );

        this.tree
            .setScale((this.height * 0.88) / this.tree.height)
            .setDepth(3);

    }

    createHud() {

        this.progressPanel = this.add.rectangle(
            this.width * 0.16,
            this.height * 0.085,
            this.width * 0.22,
            this.height * 0.095,
            0xFFF1C6,
            0.96
        ).setDepth(50);

        this.progressPanel.setStrokeStyle(6, 0x7C431B, 1);

        const podIcon = this.add.image(
            this.width * 0.085,
            this.height * 0.085,
            "MazorcaMaduraAmarilla"
        );

        podIcon
            .setScale((this.height * 0.068) / podIcon.height)
            .setDepth(51);

        this.progressText = this.add.text(
            this.width * 0.175,
            this.height * 0.085,
            `0 / ${this.totalRipe}`,
            {
                fontFamily: "Trebuchet MS",
                fontSize: `${this.height * 0.044}px`,
                color: "#5F3215",
                fontStyle: "bold"
            }
        );

        this.progressText.setOrigin(0.5).setDepth(51);

        this.timerPanel = this.add.rectangle(
            this.width * 0.5,
            this.height * 0.085,
            this.width * 0.15,
            this.height * 0.09,
            0x3E8FD8,
            0.96
        ).setDepth(50);

        this.timerPanel.setStrokeStyle(6, 0xFFFFFF, 0.75);

        this.timerText = this.add.text(
            this.width * 0.5,
            this.height * 0.085,
            "01:00",
            {
                fontFamily: "Trebuchet MS",
                fontSize: `${this.height * 0.041}px`,
                color: "#FFFFFF",
                fontStyle: "bold"
            }
        );

        this.timerText.setOrigin(0.5).setDepth(51);

    }

    createPauseButton() {

        this.pauseButton = this.add.image(
            this.width * 0.925,
            this.height * 0.085,
            "btnPausa"
        );

        this.pauseButtonScale = (this.width * 0.078) / this.pauseButton.width;

        this.pauseButton
            .setScale(this.pauseButtonScale)
            .setDepth(51)
            .setAlpha(0.78);

        this.pauseHitTarget = this.add.rectangle(
            this.pauseButton.x,
            this.pauseButton.y,
            this.width * 0.085,
            this.height * 0.12,
            0xFFFFFF,
            0.001
        ).setDepth(52);

        this.pauseHitTarget.disableInteractive();

        this.pauseHitTarget.on("pointerdown", () => {
            this.sound.play("sfxBotonTocar", { volume: 1 });
            this.pauseButton.setScale(this.pauseButtonScale * 0.95);
        });

        this.pauseHitTarget.on("pointerout", () => {
            this.pauseButton.setScale(this.pauseButtonScale);
        });

        this.pauseHitTarget.on("pointerup", () => {
            this.pauseButton.setScale(this.pauseButtonScale);
            this.pauseGame();
        });

    }

    showTutorial() {

        this.duckMusic();

        new TutorialPanel(this, {
            character: "CacaitoIndicaciones",
            text: "Toca las 5 mazorcas amarillas y anaranjadas. Esas ya están maduras.",
            audio: "vozSeleccionMadurasInstruccion",
            confirmText: "Jugar",
            replayText: "Repetir audio",
            onVoiceStart: () => this.duckMusic(),
            onVoiceComplete: () => {},
            onComplete: () => {
                this.restoreMusic();
                this.startLevel();
            }
        });

    }

    startLevel() {

        this.levelState = "playing";
        this.lastInteractionAt = this.time.now;

        this.createPods();
        this.createTimer();

        this.pauseButton.setAlpha(1);
        this.pauseHitTarget.setInteractive({ useHandCursor: true });

        this.hintEvent = this.time.addEvent({
            delay: 1000,
            callback: this.maybeShowHint,
            callbackScope: this,
            loop: true
        });

        this.time.delayedCall(900, () => this.showHint());

    }

    createPods() {

        // Cada grupo representa una mazorca de la propuesta de distribución.
        // Los grupos marcados con N incluyen su posición actual. El grupo
        // centerUpperNoCurrent omite intencionalmente la posición sin N.
        const positionGroups = [
            {
                id: "leftUpper",
                positions: [
                    { x: 0.23, y: 0.39 },
                    { x: 0.272, y: 0.30 },
                    { x: 0.30, y: 0.371 }
                ]
            },
            {
                id: "leftLower",
                positions: [
                    { x: 0.33, y: 0.58 },
                    { x: 0.291, y: 0.571 }
                ]
            },
            {
                id: "rightUpper",
                positions: [{ x: 0.65, y: 0.37 }]
            },
            {
                id: "rightOuter",
                positions: [{ x: 0.75, y: 0.47 }]
            },
            {
                id: "centerUpperNoCurrent",
                positions: [
                    { x: 0.404, y: 0.332 },
                    { x: 0.472, y: 0.405 }
                ]
            },
            {
                id: "centerMiddle",
                positions: [
                    { x: 0.55, y: 0.46 },
                    { x: 0.527, y: 0.455 },
                    { x: 0.559, y: 0.245 }
                ]
            },
            {
                id: "leftBottom",
                positions: [
                    { x: 0.45, y: 0.67 },
                    { x: 0.410, y: 0.677 }
                ]
            },
            {
                id: "rightBottom",
                positions: [{ x: 0.55, y: 0.67 }]
            }
        ];

        const treeLeft = this.tree.x - this.tree.displayWidth / 2;
        const treeTop = this.tree.y - this.tree.displayHeight / 2;
        const podDisplayWidth = this.width * 0.068;
        const podDisplayHeight = podDisplayWidth * 1.5;

        const validLayouts = this.buildValidPodLayouts(
            positionGroups,
            podDisplayWidth,
            podDisplayHeight
        );

        const attachmentPoints = this.chooseNewPodLayout(validLayouts);

        const podStates = Phaser.Utils.Array.Shuffle([
            { state: "ripe", texture: "MazorcaMaduraAmarilla" },
            { state: "ripe", texture: "MazorcaMaduraNaranja" },
            { state: "ripe", texture: "MazorcaMaduraAmarilla" },
            { state: "ripe", texture: "MazorcaMaduraNaranja" },
            { state: "ripe", texture: "MazorcaMaduraAmarilla" },
            { state: "unripe", texture: "MazorcaVerde" },
            { state: "unripe", texture: "MazorcaVerde" },
            { state: "unripe", texture: "MazorcaVerde" }
        ]);

        attachmentPoints.forEach((point, index) => {

            const podConfig = podStates[index];

            const x = treeLeft + this.tree.displayWidth * point.x;
            const y = treeTop + this.tree.displayHeight * point.y;

            const pod = new CacaoPod(this, {
                x,
                y,
                texture: podConfig.texture,
                state: podConfig.state,
                displayWidth: podDisplayWidth,
                depth: 12 + index,
                onSelect: selectedPod => this.handlePodSelection(selectedPod)
            });

            pod.attachmentZone = point.groupId;

            this.pods.push(pod);

        });

    }

    buildValidPodLayouts(positionGroups, podWidth, podHeight) {

        const validLayouts = [];

        const visitGroup = (groupIndex, currentLayout) => {

            if (groupIndex >= positionGroups.length) {

                validLayouts.push(currentLayout);
                return;

            }

            const group = positionGroups[groupIndex];

            group.positions.forEach(position => {

                const point = {
                    ...position,
                    groupId: group.id
                };

                const overlaps = currentLayout.some(selectedPoint =>
                    this.podPositionsOverlap(
                        point,
                        selectedPoint,
                        podWidth,
                        podHeight
                    )
                );

                if (!overlaps) {

                    visitGroup(groupIndex + 1, [...currentLayout, point]);

                }

            });

        };

        visitGroup(0, []);

        return validLayouts;

    }

    podPositionsOverlap(first, second, podWidth, podHeight) {

        const deltaX = Math.abs(first.x - second.x) * this.tree.displayWidth;
        const deltaY = Math.abs(first.y - second.y) * this.tree.displayHeight;

        const normalizedX = deltaX / podWidth;
        const normalizedY = deltaY / podHeight;

        // Aproximación elíptica de la silueta real de una mazorca.
        return normalizedX ** 2 + normalizedY ** 2 < 1;

    }

    chooseNewPodLayout(validLayouts) {

        if (validLayouts.length === 0) {

            throw new Error("No existen distribuciones válidas para las mazorcas.");

        }

        const lastSignature = this.registry.get("lastHarvestPodLayout");
        const availableLayouts = validLayouts.filter(layout =>
            this.getPodLayoutSignature(layout) !== lastSignature
        );

        const choices = availableLayouts.length > 0
            ? availableLayouts
            : validLayouts;

        const selectedLayout = Phaser.Utils.Array.GetRandom(choices);

        this.registry.set(
            "lastHarvestPodLayout",
            this.getPodLayoutSignature(selectedLayout)
        );

        return selectedLayout;

    }

    getPodLayoutSignature(layout) {

        return layout
            .map(point => `${point.groupId}:${point.x},${point.y}`)
            .join("|");

    }

    handlePodSelection(pod) {

        if (this.levelState !== "playing") {

            return;

        }

        this.lastInteractionAt = this.time.now;

        if (pod.podState === "ripe") {

            this.sound.play("sfxSeleccionCorrecta", { volume: 0.65 });
            this.indicators.push(pod.showCorrect("IndicadorCorrecto"));
            this.selectedRipe++;
            this.progressText.setText(`${this.selectedRipe} / ${this.totalRipe}`);

            this.tweens.add({
                targets: this.progressText,
                scale: 1.16,
                duration: 120,
                yoyo: true,
                ease: "Back.Out"
            });

            if (this.selectedRipe >= this.totalRipe) {

                this.completeLevel();

            }

            return;

        }

        this.sound.play("sfxSeleccionVerde", { volume: 0.45 });
        this.indicators.push(pod.showNotReady("IndicadorEspera"));

        if (!this.firstWrongVoicePlayed) {

            this.firstWrongVoicePlayed = true;
            this.playVoice("vozSeleccionMadurasVerde");

        }

    }

    createTimer() {

        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

    }

    updateTimer() {

        if (this.levelState !== "playing") {

            return;

        }

        this.remainingTime--;

        if (this.remainingTime === 10) {

            this.timerPanel.setFillStyle(0xE46635, 0.98);
            this.timerText.setScale(1.08);
            this.timeWarning = this.sound.add("sfxAvisoTiempo", { volume: 0.6 });
            this.timeWarning.play();

        }

        if (this.remainingTime <= 0) {

            this.remainingTime = 0;
            this.timerText.setText("00:00");
            this.failLevel();
            return;

        }

        const minutes = Math.floor(this.remainingTime / 60);
        const seconds = this.remainingTime % 60;

        this.timerText.setText(
            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
        );

    }

    maybeShowHint() {

        if (
            this.levelState === "playing" &&
            this.time.now - this.lastInteractionAt >= 6000
        ) {

            this.showHint();
            this.lastInteractionAt = this.time.now;

        }

    }

    showHint() {

        const availableRipePods = this.pods.filter(
            pod => pod.podState === "ripe" && !pod.selected
        );

        if (availableRipePods.length > 0) {

            Phaser.Utils.Array.GetRandom(availableRipePods).showHint();

        }

    }

    calculateStars() {

        if (this.remainingTime >= 40) return 3;
        if (this.remainingTime >= 20) return 2;
        return 1;

    }

    completeLevel() {

        if (this.levelState !== "playing") return;

        this.levelState = "complete";
        this.stopGameplayEvents();
        this.disablePods();

        const stars = this.calculateStars();
        ProgressManager.completeSeleccionarMaduras(stars);

        this.sound.play("sfxContadorCompleto", { volume: 0.65 });
        this.playVoice("vozSeleccionMadurasCompletado");

        new ResultPanel(this, {
            title: "¡Muy bien!",
            stars,
            retryText: "Reintentar",
            nextText: "Niveles",
            onRetry: () => this.scene.restart(),
            onNext: () => this.scene.start("CosecharScene")
        });

    }

    failLevel() {

        if (this.levelState !== "playing") return;

        this.levelState = "failed";
        this.stopGameplayEvents();
        this.disablePods();
        this.playVoice("vozSeleccionMadurasTiempoAgotado");

        new ResultPanel(this, {
            title: "¡Intentémoslo otra vez!",
            stars: 0,
            retryText: "Reintentar",
            nextText: "Niveles",
            onRetry: () => this.scene.restart(),
            onNext: () => this.scene.start("CosecharScene")
        });

    }

    pauseGame() {

        if (this.levelState !== "playing") return;

        this.levelState = "paused";

        if (this.timerEvent) this.timerEvent.paused = true;
        if (this.hintEvent) this.hintEvent.paused = true;
        if (this.timeWarning?.isPlaying) this.timeWarning.pause();

        this.tweens.pauseAll();
        this.disablePods();
        this.pauseHitTarget.disableInteractive();

        const music = this.sound.get("musicaFondo");
        if (music?.isPlaying) music.pause();

        this.createPauseOverlay();

    }

    createPauseOverlay() {

        this.pauseOverlay = this.add.container(0, 0).setDepth(3000);

        const blocker = this.add.rectangle(
            this.width / 2,
            this.height / 2,
            this.width,
            this.height,
            0x14220F,
            0.72
        ).setInteractive();

        const panel = this.add.rectangle(
            this.width / 2,
            this.height / 2,
            this.width * 0.38,
            this.height * 0.40,
            0xFFF2CB,
            1
        );

        panel.setStrokeStyle(9, 0x7B431D, 1);

        const title = this.add.text(
            this.width / 2,
            this.height * 0.40,
            "JUEGO EN PAUSA",
            {
                fontFamily: "Trebuchet MS",
                fontSize: `${this.height * 0.045}px`,
                color: "#603215",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        const resume = this.createOverlayButton(
            this.width * 0.42,
            this.height * 0.58,
            "Continuar",
            () => this.resumeGame()
        );

        const levels = this.createOverlayButton(
            this.width * 0.58,
            this.height * 0.58,
            "Niveles",
            () => {
                this.resumeMusicOnly();
                this.stopGameplayEvents();
                this.scene.start("CosecharScene");
            }
        );

        this.pauseOverlay.add([blocker, panel, title, ...resume, ...levels]);

    }

    createOverlayButton(x, y, label, callback) {

        const button = this.add.rectangle(
            x,
            y,
            this.width * 0.14,
            this.height * 0.085,
            0xE77E24,
            1
        ).setInteractive({ useHandCursor: true });

        button.setStrokeStyle(5, 0x7B431D, 1);

        const text = this.add.text(x, y, label, {
            fontFamily: "Trebuchet MS",
            fontSize: `${this.height * 0.025}px`,
            color: "#FFFFFF",
            fontStyle: "bold"
        }).setOrigin(0.5);

        button.on("pointerdown", () => {
            this.sound.play("sfxBotonTocar", { volume: 1 });
            button.setScale(0.96);
        });

        button.on("pointerup", () => {
            button.setScale(1);
            callback();
        });

        button.on("pointerout", () => button.setScale(1));

        return [button, text];

    }

    resumeGame() {

        if (this.levelState !== "paused") return;

        this.pauseOverlay.destroy(true);
        this.pauseOverlay = null;

        this.tweens.resumeAll();
        this.levelState = "playing";
        this.lastInteractionAt = this.time.now;

        if (this.timerEvent) this.timerEvent.paused = false;
        if (this.hintEvent) this.hintEvent.paused = false;
        if (this.timeWarning?.isPaused) this.timeWarning.resume();

        this.pods.forEach(pod => pod.restoreInteraction());
        this.pauseHitTarget.setInteractive({ useHandCursor: true });
        this.resumeMusicOnly();

    }

    disablePods() {

        this.pods.forEach(pod => pod.disableInteractive());
        this.pauseHitTarget.disableInteractive();

    }

    stopGameplayEvents() {

        if (this.timerEvent) this.timerEvent.remove();
        if (this.hintEvent) this.hintEvent.remove();

        if (this.timeWarning) {
            this.timeWarning.stop();
            this.timeWarning.destroy();
            this.timeWarning = null;
        }

    }

    ensureMusic() {

        let music = this.sound.get("musicaFondo");

        if (!music) {
            music = this.sound.add("musicaFondo", { loop: true, volume: 0.22 });
        }

        if (!music.isPlaying) music.play();
        music.setVolume(0.22);

    }

    duckMusic() {
        const music = this.sound.get("musicaFondo");
        if (music) music.setVolume(0.08);
    }

    restoreMusic() {
        const music = this.sound.get("musicaFondo");
        if (music) music.setVolume(0.22);
    }

    resumeMusicOnly() {
        const music = this.sound.get("musicaFondo");
        if (music?.isPaused) music.resume();
        if (music) music.setVolume(0.22);
    }

    playVoice(key) {

        if (this.activeVoice) {
            this.activeVoice.stop();
            this.activeVoice.destroy();
            this.activeVoice = null;
        }

        this.duckMusic();
        const voice = this.sound.add(key, { volume: 1 });
        this.activeVoice = voice;

        const restore = () => {
            this.restoreMusic();
            if (this.activeVoice === voice) {
                voice.destroy();
                this.activeVoice = null;
            }
        };

        if (voice.play()) {
            voice.once("complete", restore);
        }
        else {
            this.time.delayedCall(300, restore);
        }

    }

    setupLifecycleEvents() {

        this.handleVisibilityChange = () => {
            if (document.hidden && this.levelState === "playing") {
                this.pauseGame();
            }
        };

        document.addEventListener("visibilitychange", this.handleVisibilityChange);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            document.removeEventListener("visibilitychange", this.handleVisibilityChange);
            this.stopGameplayEvents();

            if (this.activeVoice) {
                this.activeVoice.stop();
                this.activeVoice.destroy();
                this.activeVoice = null;
            }
        });

    }

}
