import Phaser from "phaser";

export default class BootScene extends Phaser.Scene {

    constructor() {
        super("BootScene");
    }

    create() {
        console.log("BootScene iniciada");

        this.scene.start("PreloadScene");
    }

}