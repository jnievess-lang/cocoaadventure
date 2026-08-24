import Phaser from "phaser";
import CacaoPod from "../objects/CacaoPod";
import TutorialPanel from "../ui/TutorialPanel";
import ResultPanel from "../ui/ResultPanel";
import HudMinijuego from "../ui/HudMinijuego";
import GestorAudioMinijuego from "../managers/GestorAudioMinijuego";
import ProgressManager from "../managers/ProgressManager";

const LEVEL_CONFIG = Object.freeze({
    totalRipe: 5,
    durationSeconds: 60,
    // Cambia únicamente este número para aumentar o reducir las vidas.
    maxLives: 3,
    maximumStars: 3
});

export default class SeleccionarMadurasScene extends Phaser.Scene {

    constructor() {
        super("SeleccionarMadurasScene");
    }

    create() {

        const { width, height } = this.scale;

        this.width = width;
        this.height = height;
        this.totalRipe = LEVEL_CONFIG.totalRipe;
        this.selectedRipe = 0;
        this.levelState = "tutorial";
        this.pods = [];
        this.indicators = [];
        this.firstWrongVoicePlayed = false;
        this.firstDamagedVoicePlayed = false;
        this.lastInteractionAt = 0;

        this.audio = new GestorAudioMinijuego(this);

        this.createBackground();
        this.createTree();
        this.createHud();
        this.crearHudMinijuego();
        this.audio.ensureMusic();
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
            this.height * 0.155,
            this.width * 0.15,
            this.height * 0.06,
            0xFFF1C6,
            0.96
        ).setDepth(50);

        this.progressPanel.setStrokeStyle(
            Math.max(3, this.height * 0.004),
            0x7C431B,
            1
        );

        const podIcon = this.add.image(
            this.width * 0.125,
            this.height * 0.155,
            "MazorcaMaduraAmarilla"
        );

        podIcon
            .setScale((this.height * 0.044) / podIcon.height)
            .setDepth(51);

        this.progressText = this.add.text(
            this.width * 0.175,
            this.height * 0.155,
            `0 / ${this.totalRipe}`,
            {
                fontFamily: "Trebuchet MS",
                fontSize: `${this.height * 0.03}px`,
                color: "#5F3215",
                fontStyle: "bold"
            }
        );

        this.progressText.setOrigin(0.5).setDepth(51);

    }

    crearHudMinijuego() {

        this.hud = new HudMinijuego(this, {
            lives: {
                maxLives: LEVEL_CONFIG.maxLives
            },
            timer: {
                durationSeconds: LEVEL_CONFIG.durationSeconds
            },
            controls: {},
            instructionAudio: "vozSeleccionMadurasInstruccion",
            audioManager: this.audio,
            onTimeUp: () => this.failLevel("time"),
            onLivesEmpty: () => this.failLevel("lives"),
            onGameplaySuspended: () => this.suspendGameplay(),
            onGameplayResumed: () => this.resumeGameplay(),
            onExit: () => this.scene.start("CosecharScene")
        });

    }

    showTutorial() {

        this.audio.duckMusic();

        new TutorialPanel(this, {
            character: "CacaitoIndicaciones",
            text: "Toca las cinco mazorcas amarillas y anaranjadas. Esas ya están maduras.",
            audio: "vozSeleccionMadurasInstruccion",
            onVoiceStart: () => this.audio.duckMusic(),
            onVoiceComplete: () => {},
            onComplete: () => {
                this.audio.restoreMusic();
                this.startLevel();
            }
        });

    }

    startLevel() {

        this.levelState = "playing";
        this.lastInteractionAt = this.time.now;

        this.createPods();
        this.hud.start();

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
            { state: "damaged", texture: "MazorcaDanada" },
            { state: "damaged", texture: "MazorcaDanada" }
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

        this.sound.play("sfxSeleccionIncorrecta", { volume: 0.45 });

        if (pod.podState === "damaged") {
            pod.showDamaged();

            if (!this.firstDamagedVoicePlayed) {
                this.firstDamagedVoicePlayed = true;
                this.audio.playVoice("vozSeleccionMazorcaDaniada");
            }
        }
        else {
            this.indicators.push(pod.showNotReady("IndicadorEspera"));
        }

        if (
            pod.podState === "unripe" &&
            !this.firstWrongVoicePlayed &&
            this.hud.getRemainingLives() > 1
        ) {

            this.firstWrongVoicePlayed = true;
            this.audio.playVoice("vozSeleccionMadurasVerde");

        }

        this.hud.loseLife();

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

    completeLevel() {

        if (this.levelState !== "playing") return;

        this.levelState = "complete";
        this.hud.stop();
        this.stopGameplayEvents();
        this.disablePods();

        const stars = this.hud.calculateStars(LEVEL_CONFIG.maximumStars);
        ProgressManager.completeSeleccionarMaduras(stars);

        this.audio.playVoice("vozSeleccionMadurasCompletado");

        new ResultPanel(this, {
            title: "¡Muy bien!",
            stars,
            retryText: "Reintentar",
            nextText: "Niveles",
            onRetry: () => this.scene.restart(),
            onNext: () => this.scene.start("CosecharScene")
        });

    }

    failLevel(reason = "time") {

        if (this.levelState !== "playing") return;

        this.levelState = "failed";
        this.hud.stop();
        this.stopGameplayEvents();
        this.disablePods();
        this.sound.play("sfxDerrota", { volume: 0.65 });

        if (reason === "time") {
            this.audio.playVoice("vozSeleccionMadurasTiempoAgotado");
        }

        new ResultPanel(this, {
            title: reason === "lives"
                ? "¡Cuida tu cosecha!"
                : "¡Intentémoslo otra vez!",
            stars: 0,
            retryText: "Reintentar",
            nextText: "Niveles",
            onRetry: () => this.scene.restart(),
            onNext: () => this.scene.start("CosecharScene")
        });

    }

    suspendGameplay(reason) {

        this.levelState = reason;
        if (this.hintEvent) this.hintEvent.paused = true;
        this.disablePods();

    }

    resumeGameplay() {

        this.levelState = "playing";
        this.lastInteractionAt = this.time.now;
        if (this.hintEvent) this.hintEvent.paused = false;
        this.pods.forEach(pod => pod.restoreInteraction());

    }

    disablePods() {

        this.pods.forEach(pod => pod.disableInteractive());

    }

    stopGameplayEvents() {

        if (this.hintEvent) this.hintEvent.remove();

    }

    setupLifecycleEvents() {

        this.handleVisibilityChange = () => {
            if (document.hidden && this.levelState === "playing") {
                this.hud.pause();
            }
        };

        document.addEventListener("visibilitychange", this.handleVisibilityChange);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            document.removeEventListener("visibilitychange", this.handleVisibilityChange);
            this.stopGameplayEvents();
            this.hud.destroy();
            this.audio.destroy();
        });

    }

}
