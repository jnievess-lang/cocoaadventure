export const FUERZA_BAJA = "baja";
export const FUERZA_IDEAL = "ideal";
export const FUERZA_ALTA = "alta";

export default function clasificarFuerzaCorte(valor, zonaSegura) {
    const fuerza = Math.min(1, Math.max(0, valor));

    if (fuerza < zonaSegura.minimo) return FUERZA_BAJA;
    if (fuerza > zonaSegura.maximo) return FUERZA_ALTA;
    return FUERZA_IDEAL;
}
