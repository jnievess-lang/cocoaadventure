import Phaser from "phaser";
import BootScene from "./scenes/BootScene";
import PreloadScene from "./scenes/PreloadScene";
import MainMenuScene from "./scenes/MainMenuScene";
import ModulesScene from "./scenes/ModulesScene";
import SembrarScene from "./scenes/SembrarScene";
import LimpiarTerrenoScene from "./scenes/LimpiarTerrenoScene";
import PrepararTierraScene from "./scenes/PrepararTierraScene";
import CosecharScene from "./scenes/CosecharScene";
import SeleccionarMadurasScene from "./scenes/SeleccionarMadurasScene";

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
        PrepararTierraScene,
        CosecharScene,
        SeleccionarMadurasScene
        ]
};

export default config;
