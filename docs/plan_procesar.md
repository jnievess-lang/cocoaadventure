# Módulo Procesar

**Estado: los cuatro niveles están construidos, con assets y voces propios.**

## 1. Los cuatro niveles

Siguen el orden real del beneficio del cacao, después de la cosecha. Cada uno
estrena una mecánica que no existía en el juego: el módulo no repite el "toca lo
correcto" de Sembrar, Mantener y Cosecha.

| # | Clave | Pantalla | Mecánica | Por qué es distinta |
| --- | --- | --- | --- | --- |
| 1 | `secado` | SECAR GRANOS | Arrastrar cada grano hasta una de dos canastas. | Es la primera vez que hay que llevar algo a un **destino**. Saber que un grano está dañado no basta: hay que separarlo. |
| 2 | `tostado` | TOSTAR | Mantener pulsado para subir la temperatura y sostener la aguja dentro de la franja verde. | Equilibrio **sostenido**, no un disparo único como la barra de Corte cuidadoso. Hay que corregir todo el rato. |
| 3 | `descascarillado` | DESCASCARILLAR | Tocar el grano para quebrarlo y luego deslizar para soplar la cascarilla. | Dos gestos **en orden** sobre el mismo objeto. Adelantarse cuesta una vida. |
| 4 | `molienda` | MOLER | Girar la manivela en círculos con el dedo y después completar la receta. | Gesto **rotacional** acumulando ángulo real, más una segunda fase de receta. |

Falta la fermentación, que va antes del secado. No hay assets para ella y queda
fuera del alcance de este módulo.

## 2. Assets

Los diecinueve archivos de origen estaban en formato de lámina: sin canal alfa,
con el fondo pintado encima y hasta 3,8 MB por archivo. El pipeline vive en
`tools/procesar/` y se ejecuta con
`node tools/procesar/procesarAssets.mjs`.

### Cómo se les quitó el fondo

`lib.mjs` implementa un relleno por difusión desde el borde con **tolerancia
local**: cada píxel se compara con el vecino desde el que se llegó, no con el
color inicial. Eso permite recorrer una pared con degradado o una mesa de madera
entera sin salirse, y frenar en seco contra el contorno marrón grueso que llevan
todas las ilustraciones del proyecto.

La tolerancia es por asset y **no** es intercambiable. Un barrido de valores
mostró que el relleno se dispara de golpe: en `CanastaGranosBuenos` pasa de
cubrir el 49 % con tolerancia 5 al 95 % con tolerancia 8, porque trepa por el
antialias del contorno y se come la ilustración. Los valores buenos están en
`procesarAssets.mjs`; si se rehace un asset hay que volver a barrer.

Para las láminas con varios objetos sueltos (`granosbuenos`, `granosAgrietados`)
se etiquetan las manchas opacas y se extrae la mejor. Se filtran por **solidez**
(área ocupada dentro de su recuadro): un grano real llena su caja, y un grano al
que el relleno se le metió dentro queda como un contorno hueco que hay que
descartar.

### Resultado

De 10,3 MB a unos 670 KB, todo en WebP:

| Destino | Archivos |
| --- | --- |
| `background/` | `FondoTendalSecado`, `FondoTostadora`, `FondoDescascarillado`, `FondoMolienda` (1920 px de ancho) |
| `minigames/procesar/secado/` | `CanastaSecadoVacia`, `CanastaSecadoBuenos`, `CanastaSecadoDanados`, `GranoSecoBueno`, `GranoSecoAgrietado` |
| `minigames/procesar/tostado/` | `BarraTueste` |
| `minigames/procesar/molienda/` | `Molino`, `TazonChocolate`, `BarraChocolate`, `Azucar`, `Leche`, `MantecaCacao` |

### Lo que se descartó y por qué

- **`cacaotostado`**: es un montón de granos oscuros sobre fondo oscuro y el
  relleno se cuela entre ellos; quedaba moteado de blanco. El estado de tueste
  se resuelve mejor tiñendo los propios granos, que además comunica la
  progresión en vivo.
- **`molino.png` (el viejo, en minúscula)**: no es un sprite, es
  `BackgroundMolienda` a media resolución — 1024×454 es la mitad exacta de
  2048×908 — con el paisaje entero. Traía canal alfa, y eso fue lo que despistó
  al pipeline. El bueno es `Molino.jpeg`, con el molino solo sobre blanco.
- **`temporizador`, `IconoError`, `iconoListo`**: duplicaban `PanelTemporizador`,
  `IndicadorError` e `IndicadorCorrecto`, que ya existen.
- **`CorazonVida` / `CorazonSinVida`**: duplicaban `CorazonLleno` / `CorazonVacio`.

### La franja verde de `BarraTueste`

La zona verde del asset se midió por píxel: va de **0.340 a 0.658** del ancho.
Ese valor vive en `src/utils/clasificarTueste.js` y está cubierto por tests. Si
el asset se rehace hay que volver a medirlo con
`node tools/procesar/medirBarra.mjs` y actualizar la constante.

## 3. Voces

Las dieciséis voces (cuatro por nivel) se generaron con **es-EC-AndreaNeural**,
la voz oficial del proyecto, desde ttsfree.com. El script es
`tools/procesar/generarVoces.mjs`; acepta un filtro por nombre para rehacer una
suelta:

```bash
node tools/procesar/generarVoces.mjs MolerAyuda
```

Tres detalles del sitio que cuestan tiempo si no se saben:

1. El token `process` del formulario es **de un solo uso**. No se pueden
   encadenar conversiones en una misma carga: hay que pedir la página otra vez
   por cada voz.
2. El POST a `voicegen.php` responde `finish||`, sin el enlace. La URL del mp3
   llega por `processing.php`, que es un **stream SSE**, no una petición normal.
   Hay que estar escuchándolo antes de que el POST termine.
3. El checkbox `music` viene **marcado** por defecto y le mete música de fondo a
   la voz. El script lo omite a propósito.

Los guiones aprobados están en el propio script, que es su única fuente de
verdad.

## 4. Qué se tocó fuera del módulo

`EscenaMantenimientoBase` volvía siempre a `MantenerScene`, con el nombre
escrito a mano en dos sitios. Ahora expone un getter `escenaModulo` que sale de
`nivel.escenaModulo` y cae a `"MantenerScene"` cuando el nivel no lo declara, así
que los cuatro niveles de Mantener no cambian de comportamiento.
