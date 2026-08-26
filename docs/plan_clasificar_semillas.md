# Clasificar semillas

Cuarto minijuego de Cosecha. El niño conecta en una matriz configurable tres o más semillas iguales, enviando las buenas y dañadas a sus canastas. Mezclar tipos cancela el gesto; tocar una bomba cancela el gesto y resta una vida.

## Configuración

La escena centraliza filas, columnas, mínimo de cadena, objetivos, tiempo, vidas, bombas, diagonales y duración de resolución en `CONFIGURACION_NIVEL`. Los valores actuales son matriz 7×7, mínimo tres, objetivos 30 buenas y 24 dañadas, 60 segundos, tres vidas y tres bombas.

## Flujo

1. Cacaíto reproduce la instrucción completa.
2. Se presenta una práctica interactiva, sin HUD ni penalización, con tres semillas buenas.
3. El nivel inicia cuando el niño conecta las tres personalmente.
4. Una cadena válida viaja a su canasta, aplica gravedad y rellena el tablero.
5. La matriz se valida tras cada cambio; si el relleno no es soluble se regenera mostrando “Mezclando semillas…”.
6. Se gana al completar ambas canastas. Las estrellas corresponden a las vidas restantes.

Las conexiones admiten ocho vecinos, retroceso inmediato y muestreo intermedio para gestos rápidos. `pointerupoutside` resuelve; `pointercancel`, pausa, repetición o pérdida de foco cancelan sin penalización.

## Audio

- `ClasificarSemillasInstruccion.mp3`
- `ClasificarSemillasCompletado.mp3`
- `ClasificarSemillasTiempoAgotado.mp3`
- `ConectarSemilla.mp3`
- `RecolectarSemillas.m4a`
- `BombaSemillas.m4a`

También se reutilizan botones, error, aviso de tiempo, derrota, estrellas y música. Los efectos largos de recolección y bomba se reproducen con una sola instancia controlada para evitar superposición.

## Assets

- `public/images/buttons/btnIconoClasificarSemillas.png`
- `public/images/objects/SemillaCacaoBuena.webp`
- `public/images/objects/SemillaCacaoDanada.webp`
- `public/images/objects/BombaSemillas.webp`
- `public/images/objects/CanastaSemillas.webp`
- `public/images/objects/CanastaSemillasBuenasNivel1.webp`
- `public/images/objects/CanastaSemillasBuenasNivel2.webp`
- `public/images/objects/CanastaSemillasBuenasNivel3.webp`
- `public/images/objects/CanastaSemillasDanadasNivel1.webp`
- `public/images/objects/CanastaSemillasDanadasNivel2.webp`
- `public/images/objects/CanastaSemillasDanadasNivel3.webp`
- `public/images/minigames/cosechar/clasificar-semillas/MarcoTableroSemillas.webp`

Los candidatos originales se conservan en `design/assets/cosecha-candidates/clasificar-semillas/` para revisión local.

La canasta vacía corresponde a la etapa cero. Los tres assets de cada tipo representan un tercio, dos tercios y llenado completo. La etapa no utiliza cantidades fijas: `CanastaSemillas` calcula `floor(valor * 3 / objetivo)`, limitado entre cero y tres. Por ejemplo, un objetivo de 30 cambia en 10, 20 y 30; uno de 24 cambia en 8, 16 y 24; y uno de 25 cambia en 9, 17 y 25.

Las dos semillas representan cacao fresco cubierto de pulpa blanca. La buena muestra mucílago limpio, húmedo y carnoso. La dañada conserva esa misma base, pero presenta manchas oscuras localizadas, pulpa grisácea y una grieta anormal. No se utiliza una semilla uniformemente marrón o arrugada como señal de daño, porque podría confundirse con cacao correctamente fermentado y seco.

## Arquitectura

- `ClasificarSemillasScene.js`: estados, reglas, HUD, resultados y progreso.
- `TableroClasificacionSemillas.js`: matriz, gravedad, relleno y validación.
- `FichaSemilla.js`: representación y animación de cada ficha.
- `GestorTrayectoriaSemillas.js`: entrada táctil, adyacencia, retroceso e interpolación.
- `CanastaSemillas.js`: etiqueta, icono, contador y recepción.
- `generadorMatrizSemillas.js`: generación y validación puras.

El progreso conserva la clave `cosechar.revisionAcopio` por compatibilidad.
