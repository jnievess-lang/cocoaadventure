const MUSIC_ENABLED_KEY = "cocoaAdventureMusicEnabled";

export default class AudioSettingsManager {

    static isMusicEnabled() {

        try {
            return localStorage.getItem(MUSIC_ENABLED_KEY) !== "false";
        }
        catch (error) {
            console.warn("No se pudo leer la configuración de música.", error);
            return true;
        }

    }

    static setMusicEnabled(enabled) {

        const isEnabled = Boolean(enabled);

        try {
            localStorage.setItem(MUSIC_ENABLED_KEY, String(isEnabled));
        }
        catch (error) {
            console.warn("No se pudo guardar la configuración de música.", error);
        }

        return isEnabled;

    }

    static applyToMusic(music) {
        music?.setMute(!this.isMusicEnabled());
    }

}
