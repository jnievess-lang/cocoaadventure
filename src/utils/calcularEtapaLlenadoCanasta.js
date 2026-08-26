export function calcularEtapaLlenadoCanasta(valor, objetivo, cantidadEtapas = 3) {
    const etapas = Math.max(1, Math.floor(Number(cantidadEtapas) || 3));
    const meta = Number(objetivo);

    if (!Number.isFinite(meta) || meta <= 0) return 0;

    const progresoNumerico = Number(valor);
    const progreso = Number.isFinite(progresoNumerico)
        ? Math.min(meta, Math.max(0, progresoNumerico))
        : 0;

    return Math.min(etapas, Math.floor((progreso * etapas) / meta));
}
