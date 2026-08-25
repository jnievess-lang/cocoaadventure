export function interpolarCeldas(inicio, fin, tamanoCelda) {
    const distancia = Math.hypot(fin.x - inicio.x, fin.y - inicio.y);
    const pasos = Math.max(1, Math.ceil(distancia / Math.max(4, tamanoCelda * 0.32)));
    return Array.from({ length: pasos }, (_, indice) => {
        const t = (indice + 1) / pasos;
        return {
            x: inicio.x + (fin.x - inicio.x) * t,
            y: inicio.y + (fin.y - inicio.y) * t
        };
    });
}

