const STORAGE_KEY = "cocoaAdventureProgress";

// La lista es la única fuente de verdad para los requisitos de cada trofeo.
// Cuando se agregue un nivel a un módulo, debe añadirse aquí para que el logro
// exija también sus tres estrellas.
const ACHIEVEMENT_LEVELS = {
    sembrar: ["limpiarTerreno", "prepararTierra", "plantarPlantula"],
    mantener: ["regar", "malezas", "plagas", "cuidadoCorrecto"],
    cosechar: [
        "seleccionarMaduras",
        "corteCuidadoso",
        "abrirMazorcas",
        "revisionAcopio"
    ],
    // Procesar aún no tiene niveles implementados; por eso su trofeo permanece
    // oculto hasta que se registren sus niveles reales en esta lista.
    procesar: []
};

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

            },

            mantener: {

                regar: { unlocked: true, stars: 0 },
                malezas: { unlocked: false, stars: 0 },
                plagas: { unlocked: false, stars: 0 },
                cuidadoCorrecto: { unlocked: false, stars: 0 }

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
                },
                mantener: {
                    ...defaults.mantener,
                    ...(saved.mantener ?? {})
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

            if (progress.mantener.regar.stars > 0) {
                progress.mantener.malezas.unlocked = true;
            }

            if (progress.mantener.malezas.stars > 0) {
                progress.mantener.plagas.unlocked = true;
            }

            if (progress.mantener.plagas.stars > 0) {
                progress.mantener.cuidadoCorrecto.unlocked = true;
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

    static isModulePerfect(moduleKey, progress = this.load()) {

        const levelKeys = ACHIEVEMENT_LEVELS[moduleKey];

        if (!levelKeys || levelKeys.length === 0) return false;

        const moduleProgress = progress[moduleKey];

        return levelKeys.every(levelKey =>
            Number(moduleProgress?.[levelKey]?.stars) === 3
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

    static completeRegar(stars) {

        const progress = this.load();

        progress.mantener.regar.stars = Math.max(
            progress.mantener.regar.stars,
            stars
        );

        progress.mantener.malezas.unlocked = true;

        this.save(progress);

    }

    static completeMalezas(stars) {

        const progress = this.load();

        progress.mantener.malezas.stars = Math.max(
            progress.mantener.malezas.stars,
            stars
        );

        progress.mantener.plagas.unlocked = true;

        this.save(progress);

    }

    static completePlagas(stars) {

        const progress = this.load();

        progress.mantener.plagas.stars = Math.max(
            progress.mantener.plagas.stars,
            stars
        );

        progress.mantener.cuidadoCorrecto.unlocked = true;

        this.save(progress);

    }

    static completeCuidadoCorrecto(stars) {

        const progress = this.load();

        progress.mantener.cuidadoCorrecto.stars = Math.max(
            progress.mantener.cuidadoCorrecto.stars,
            stars
        );

        this.save(progress);

    }
}
