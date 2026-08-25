import Phaser from "phaser";
import BootScene from "./scenes/BootScene";
import PreloadScene from "./scenes/PreloadScene";
import MainMenuScene from "./scenes/MainMenuScene";
import ModulesScene from "./scenes/ModulesScene";
import SembrarScene from "./scenes/SembrarScene";
import LimpiarTerrenoScene from "./scenes/LimpiarTerrenoScene";
import CosecharScene from "./scenes/CosecharScene";
import SeleccionarMadurasScene from "./scenes/SeleccionarMadurasScene";
import CorteCuidadosoScene from "./scenes/CorteCuidadosoScene";
import AbrirMazorcasScene from "./scenes/AbrirMazorcasScene";
import ClasificarSemillasScene from "./scenes/ClasificarSemillasScene";

const config = {
    type: Phaser.AUTO,

    parent: "game-container",

    width: 1920,
    height: 1080,

    backgroundColor: "#8FD3FF",

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

        scene: [
        BootScene,
        PreloadScene,
        MainMenuScene,
        ModulesScene,
        SembrarScene,
        LimpiarTerrenoScene,
        CosecharScene,
        SeleccionarMadurasScene,
        CorteCuidadosoScene,
        AbrirMazorcasScene,
        ClasificarSemillasScene
        ]
};

export default config;
