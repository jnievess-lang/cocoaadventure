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
                abrirMazorcas: { unlocked: false, stars: 0 },
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

            const cosecharGuardado = saved.cosechar ?? {};
            const {
                aLaCanasta: progresoAnterior,
                ...cosecharSinClaveAnterior
            } = cosecharGuardado;

            const progress = {
                ...defaults,
                ...saved,
                sembrar: {
                    ...defaults.sembrar,
                    ...(saved.sembrar ?? {})
                },
                cosechar: {
                    ...defaults.cosechar,
                    ...cosecharSinClaveAnterior
                }
            };

            if (progresoAnterior) {
                progress.cosechar.abrirMazorcas.stars = Math.max(
                    progress.cosechar.abrirMazorcas.stars,
                    progresoAnterior.stars ?? 0
                );
                progress.cosechar.abrirMazorcas.unlocked =
                    progress.cosechar.abrirMazorcas.unlocked ||
                    Boolean(progresoAnterior.unlocked);
            }

            if (progress.cosechar.seleccionarMaduras.stars > 0) {
                progress.cosechar.corteCuidadoso.unlocked = true;
            }

            if (progress.cosechar.corteCuidadoso.stars > 0) {
                progress.cosechar.abrirMazorcas.unlocked = true;
            }

            if (progress.cosechar.abrirMazorcas.stars > 0) {
                progress.cosechar.revisionAcopio.unlocked = true;
            }

            return progress;

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

    static completePrepararTierra(stars) {

        const progress = this.load();

        progress.sembrar.prepararTierra.stars = Math.max(
            progress.sembrar.prepararTierra.stars,
            stars
        );

        progress.sembrar.plantarPlantula.unlocked = true;

        this.save(progress);

    }

    static completePlantarPlantula(stars) {

        const progress = this.load();

        progress.sembrar.plantarPlantula.stars = Math.max(
            progress.sembrar.plantarPlantula.stars,
            stars
        );

        this.save(progress);

    }

    static completeSeleccionarMaduras(stars) {

        const progress = this.load();

        progress.cosechar.seleccionarMaduras.stars = Math.max(
            progress.cosechar.seleccionarMaduras.stars,
            stars
        );

        progress.cosechar.corteCuidadoso.unlocked = true;

        this.save(progress);

    }

    static completeCorteCuidadoso(stars) {

        const progress = this.load();

        progress.cosechar.corteCuidadoso.stars = Math.max(
            progress.cosechar.corteCuidadoso.stars,
            stars
        );

        progress.cosechar.abrirMazorcas.unlocked = true;

        this.save(progress);

    }

    static completeAbrirMazorcas(stars) {

        const progress = this.load();

        progress.cosechar.abrirMazorcas.stars = Math.max(
            progress.cosechar.abrirMazorcas.stars,
            stars
        );

        progress.cosechar.revisionAcopio.unlocked = true;

        this.save(progress);

    }

    static completeRevisionAcopio(stars) {

        const progress = this.load();

        progress.cosechar.revisionAcopio.stars = Math.max(
            progress.cosechar.revisionAcopio.stars,
            stars
        );
        progress.cosechar.revisionAcopio.unlocked = true;

        this.save(progress);

    }
}
