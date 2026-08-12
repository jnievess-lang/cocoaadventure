const STORAGE_KEY = "cocoaAdventureProgress";

export default class ProgressManager {

    static getDefaultProgress() {

        return {

            sembrar: {

                limpiarTerreno: {

                    unlocked: true,
                    stars: 0

                },

                prepararTierra: {

                    unlocked: false,
                    stars: 0

                },

                plantarPlantula: {

                    unlocked: false,
                    stars: 0

                }

            }

        };

    }

    static load() {

        const data = localStorage.getItem(STORAGE_KEY);

        if (!data) {

            return this.getDefaultProgress();

        }

        return JSON.parse(data);

    }

    static save(progress) {

        localStorage.setItem(

            STORAGE_KEY,
            JSON.stringify(progress)

        );

    }
    
    static completeLimpiarTerreno(stars) {

        const progress = this.load();

        // Guardar la mejor puntuación
        progress.sembrar.limpiarTerreno.stars = Math.max(
            progress.sembrar.limpiarTerreno.stars,
            stars
        );

        // Desbloquear el siguiente nivel
        progress.sembrar.prepararTierra.unlocked = true;

        this.save(progress);

    }
}