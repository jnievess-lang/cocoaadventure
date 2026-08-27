const pantalla = document.getElementById("pantalla-carga-inicial");
const barra = document.getElementById("barra-carga");
const progreso = document.getElementById("progreso-carga");
const porcentaje = document.getElementById("porcentaje-carga");
const mensaje = document.getElementById("mensaje-carga");

window.actualizarPantallaCarga = (valor, texto) => {
    const normalizado = Math.max(0, Math.min(1, Number(valor) || 0));
    const entero = Math.round(normalizado * 100);

    progreso.style.width = `${entero}%`;
    porcentaje.textContent = `${entero} %`;
    barra.setAttribute("aria-valuenow", String(entero));
    if (texto) mensaje.textContent = texto;
};

window.ocultarPantallaCarga = () => {
    window.actualizarPantallaCarga(1, "¡Todo listo!");
    pantalla.classList.add("oculta");
    pantalla.addEventListener("transitionend", () => pantalla.remove(), { once: true });
};
