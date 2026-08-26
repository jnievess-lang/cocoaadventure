import Phaser from "phaser";
import BootScene from "./scenes/BootScene";
import PreloadScene from "./scenes/PreloadScene";
import MainMenuScene from "./scenes/MainMenuScene";
import ModulesScene from "./scenes/ModulesScene";
import SembrarScene from "./scenes/SembrarScene";
import LimpiarTerrenoScene from "./scenes/LimpiarTerrenoScene";
import PrepararTierraScene from "./scenes/PrepararTierraScene";
import PlantarPlantula from "./scenes/PlantarPlantula";
import CosecharScene from "./scenes/CosecharScene";
import SeleccionarMadurasScene from "./scenes/SeleccionarMadurasScene";
import CorteCuidadosoScene from "./scenes/CorteCuidadosoScene";
import AbrirMazorcasScene from "./scenes/AbrirMazorcasScene";
import ClasificarSemillasScene from "./scenes/ClasificarSemillasScene";
import MantenerScene from "./scenes/MantenerScene";
import RegarScene from "./scenes/RegarScene";
import MalezasScene from "./scenes/MalezasScene";
import PlagasScene from "./scenes/PlagasScene";
import CuidadoCorrectoScene from "./scenes/CuidadoCorrectoScene";
import ProcesarScene from "./scenes/ProcesarScene";
import SecarGranosScene from "./scenes/SecarGranosScene";
import TostarScene from "./scenes/TostarScene";
import DescascarillarScene from "./scenes/DescascarillarScene";
import MolerScene from "./scenes/MolerScene";
import LogrosScene from "./scenes/LogrosScene";
import ConfiguracionScene from "./scenes/ConfiguracionScene";

const config = {
    type: Phaser.AUTO,

    parent: "game-container",

    width: 1920,
    height: 1080,

    backgroundColor: "#8FD3FF",

    // El tamaño real del lienzo (con ajuste por densidad de píxeles) se
    // controla a mano en main.js mediante scale.resize(); ver el comentario
    // allí para el motivo.
    scale: {
        mode: Phaser.Scale.NONE
    },

        scene: [
        BootScene,
        PreloadScene,
        MainMenuScene,
        LogrosScene,
        ConfiguracionScene,
        ModulesScene,
        SembrarScene,
        LimpiarTerrenoScene,
        PrepararTierraScene,
        PlantarPlantula,
        CosecharScene,
        SeleccionarMadurasScene,
        CorteCuidadosoScene,
        AbrirMazorcasScene,
        ClasificarSemillasScene,
        MantenerScene,
        RegarScene,
        MalezasScene,
        PlagasScene,
        CuidadoCorrectoScene,
        ProcesarScene,
        SecarGranosScene,
        TostarScene,
        DescascarillarScene,
        MolerScene
        ]
};

export default config;
