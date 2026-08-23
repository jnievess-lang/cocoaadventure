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

            },

            cosechar: {

                seleccionarMaduras: { unlocked: true, stars: 0 },
                corteCuidadoso: { unlocked: false, stars: 0 },
                aLaCanasta: { unlocked: false, stars: 0 },
                revisionAcopio: { unlocked: false, stars: 0 }

            }

        };

    }

    static load() {

        const defaults = this.getDefaultProgress();

        try {

            const data = localStorage.getItem(STORAGE_KEY);

            if (!data) return defaults;

            const saved = JSON.parse(data);

            return {
                ...defaults,
                ...saved,
                sembrar: {
                    ...defaults.sembrar,
                    ...(saved.sembrar ?? {})
                },
                cosechar: {
                    ...defaults.cosechar,
                    ...(saved.cosechar ?? {})
                }
            };

        }
        catch (error) {

            console.warn("No se pudo leer el progreso guardado.", error);
            return defaults;

        }

    }

    static save(progress) {

        try {

            localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));

        }
        catch (error) {

            console.warn("No se pudo guardar el progreso.", error);

        }

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

    static completeSeleccionarMaduras(stars) {

        const progress = this.load();

        progress.cosechar.seleccionarMaduras.stars = Math.max(
            progress.cosechar.seleccionarMaduras.stars,
            stars
        );

        this.save(progress);

    }
}
