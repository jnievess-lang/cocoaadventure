import test from "node:test";
import assert from "node:assert/strict";
import AudioSettingsManager from "../src/managers/AudioSettingsManager.js";

const storage = new Map();

global.localStorage = {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value)
};

test.beforeEach(() => storage.clear());

test("la música está encendida de forma predeterminada y guarda su preferencia", () => {
    assert.equal(AudioSettingsManager.isMusicEnabled(), true);

    AudioSettingsManager.setMusicEnabled(false);

    assert.equal(AudioSettingsManager.isMusicEnabled(), false);
});

test("aplica el silencio de la preferencia al sonido de música", () => {
    let mute = null;
    const music = { setMute: value => { mute = value; } };

    AudioSettingsManager.setMusicEnabled(false);
    AudioSettingsManager.applyToMusic(music);

    assert.equal(mute, true);
});
