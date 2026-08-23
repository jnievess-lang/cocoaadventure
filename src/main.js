import Phaser from "phaser";
import "./style.css";

import config from "./config";

const game = new Phaser.Game(config);

const updateOrientation = () => {
    const portrait = window.innerHeight > window.innerWidth;
    document.body.classList.toggle("portrait-device", portrait);

    if (!game.loop) return;

    if (portrait && game.loop.running) game.loop.sleep();
    if (!portrait && !game.loop.running) game.loop.wake();
};

window.addEventListener("resize", updateOrientation);
window.addEventListener("orientationchange", updateOrientation);
window.addEventListener("load", updateOrientation);
requestAnimationFrame(updateOrientation);
