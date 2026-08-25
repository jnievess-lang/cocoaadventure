# Generar los assets del módulo Mantener

**Estado: las quince imágenes ya están generadas e integradas.** Este documento
conserva el método por si alguna hay que rehacerla, y explica las decisiones que
deben respetarse al hacerlo.

Se generaron con ChatGPT a 1254 x 1254 PNG, y antes de entrar a `public/` se
redujeron y se convirtieron a WebP: 640 para las plantas, 512 para herramientas y
objetos, 256 para el indicador. El lote pasó de 16,7 MB a 0,86 MB. Los PNG
originales no van al repositorio: son fuentes de diseño.

## Lo primero: no generes lo que ya existe

Antes de este documento el módulo necesitaba veinticinco imágenes. Reutilizando
las de Cosecha bajó a quince. Estas seis **ya están integradas** y no hay que
volver a dibujarlas:

| Se necesitaba | Se reutiliza |
| --- | --- |
| Cuatro fondos de nivel | `FondoFincaCacao` en los cuatro niveles |
| Un árbol para Buscar plagas | `ArbolCacaoSeleccion` |
| Mazorca enferma | `MazorcaDanada` |
| Mazorcas sanas de distracción | `MazorcaMaduraAmarilla` y `MazorcaMaduraNaranja` |
| Icono de tijeras | `TijeraPodaAbierta` |
| Marca de acierto | `IndicadorCorrecto` |

## El estilo que hay que igualar

Mira `objects/TijeraPodaAbierta.webp`, `objects/MazorcaMaduraAmarilla.webp` y
`ui/IndicadorCorrecto.webp`. Los tres comparten:

- Ilustración 2D pintada a mano, tipo juego casual de móvil.
- **Contorno grueso marrón oscuro y cálido**, alrededor de `#4A2718`. No negro,
  no azul marino. Este es el rasgo que más delata si un asset es del proyecto.
- Sombreado suave tipo aerógrafo, con volumen redondeado. Nada de color plano.
- **Brillo especular** blanco en la zona superior, como de plástico pulido.
- Paleta saturada y cálida, formas gorditas y amables.
- Transparencia alfa real, sin sombra en el piso ni marco.

## Herramienta recomendada

Usa un modelo de imagen que **acepte imágenes de referencia**, y adjunta
`TijeraPodaAbierta.webp` en cada generación pidiendo que copie el estilo. Eso
importa mucho más que cuál modelo elijas: sin referencia, cualquiera te va a
devolver un estilo distinto en cada intento y tendrás quince imágenes que no
combinan entre sí.

Un detalle que ahorra reintentos: **genera `PlantaSana` primero**. Las otras tres
plantas son la *misma* planta enferma, así que adjunta tu `PlantaSana` ya
aprobada como referencia adicional al generarlas. Si las generas por separado
saldrán tres plantas distintas y el nivel de diagnóstico dejará de leerse.
Lo mismo con `IndicadorError`: adjunta `IndicadorCorrecto.webp` para que sean
gemelos.

Si el resultado viene con fondo en vez de transparencia, quítalo con
[remove.bg](https://www.remove.bg/) o con `rembg` (`pip install rembg`).

Claude Design no sirve para esto: dibuja artboards en HTML y exporta la página
completa a PNG o PDF, no sprites sueltos con canal alfa.

## Guion para Gemini o ChatGPT

Secuencia lista para pegar en un chat que acepte imágenes adjuntas. El orden
importa: cada paso se apoya en el anterior.

### 1. Mensaje de arranque

Adjunta `objects/TijeraPodaAbierta.webp` y `objects/MazorcaMaduraAmarilla.webp`:

```text
Estoy haciendo assets para un videojuego educativo infantil sobre el cultivo
de cacao. Te adjunto dos imágenes del juego: ese es el estilo que debes copiar
en todo lo que te pida a partir de ahora.

Fíjate en estos rasgos y respétalos siempre:
- Ilustración 2D pintada a mano, estilo juego casual de móvil.
- Contorno grueso de color marrón oscuro cálido, casi #4A2718. NUNCA negro,
  NUNCA azul.
- Sombreado suave tipo aerógrafo, con volumen redondeado. Nada de color plano.
- Un brillo blanco especular arriba, como de plástico pulido.
- Colores saturados y cálidos, formas gorditas y amables.

Cada imagen que generes debe ser:
- Un solo objeto centrado, sin escena de fondo.
- Fondo 100% transparente, formato PNG.
- Cuadrada (1:1).
- Sin texto, sin sombra en el piso, sin marco ni borde.

Confírmame que entendiste el estilo y espera mi primera pieza.
```

### 2. La planta madre

No avances hasta que esta quede bien: las otras tres nacen de ella.

```text
Genera: una plántula joven de cacao SANA, con tres hojas verdes brillantes,
naciendo de un montoncito de tierra café. Tamaño 640x640.
```

### 3. Las tres plantas enfermas

Adjunta la `PlantaSana` ya aprobada en cada mensaje y cambia solo la última
frase por marchita, con hongos o con plaga:

```text
Usa esta planta exacta que te adjunto. No la rediseñes: es la misma planta,
solo cambia su estado. Mismo estilo, mismo tamaño, fondo transparente.

Ahora muéstrala MARCHITA: caída, con las hojas amarillentas y secas, y la
tierra agrietada por falta de agua.
```

- Hongos: «manchas blancas y grises, algodonosas, extendiéndose sobre sus hojas».
- Plaga: «pequeños pulgones verdes encima y agujeros mordisqueados en sus hojas».

### 4. Piezas sueltas

Una por mensaje, con el estilo ya establecido en el paso 1. La descripción de
cada objeto está en las tablas del final. Ahí están en inglés, que es lo que
mejor funciona en Midjourney; en un chat en español puedes traducirlas sin
problema, el resultado es el mismo.

### 5. La marca de error

Adjunta `ui/IndicadorCorrecto.webp`:

```text
Te adjunto la marca de acierto de mi juego. Necesito su gemela para el error:
un círculo rojo brillante, con una X blanca gruesa al centro. Debe verse
exactamente del mismo estilo, mismo grosor de contorno, mismo brillo y mismo
tamaño (256x256), para que se vean como pareja.
```

### Correcciones frecuentes

| Problema | Qué pedirle |
| --- | --- |
| Fondo blanco o cuadriculado | «Necesito el PNG con fondo transparente de verdad, canal alfa.» |
| Contorno negro o azul | «El contorno debe ser marrón oscuro cálido como el de la referencia.» |
| Se ve plano | «Falta volumen: sombreado suave y un brillo blanco arriba.» |
| Se salió del estilo | Volver a adjuntar `TijeraPodaAbierta.webp` y decir «recuerda este estilo». |
| Las plantas no se parecen | No generarlas de cero: adjuntar `PlantaSana` y pedir solo el cambio de estado. |

## Prefijo de estilo

Pega esto **al final de cada prompt**, sin cambiarlo:

```text
2D hand-painted casual mobile game art for a children's educational farming game.
Thick warm dark-brown outline (#4A2718), soft airbrush shading with rounded volume,
glossy white specular highlight, saturated friendly colors, chunky readable silhouette.
Single centered object, fully transparent background, no scene, no text, no drop shadow,
no frame. Match the art style of the attached reference exactly.
```

## Los quince prompts

Todos van en `public/images/` con el nombre exacto de la tabla. El código ya
apunta a esas rutas: **si respetas el nombre, no hay que tocar nada**.

### Herramientas → `images/icons/`, 512 × 512 PNG

| Archivo | Prompt del objeto |
| --- | --- |
| `IconoRegadera.png` | A green metal watering can tilted forward, pouring a few blue water droplets from its spout. |
| `IconoGuantes.png` | A pair of yellow gardening gloves, one slightly overlapping the other. |
| `IconoLupa.png` | A magnifying glass with a wooden brown handle and a shiny glass lens. |
| `IconoFungicida.png` | A spray bottle filled with green liquid, releasing a small fine mist from the nozzle. |

### Estados de la planta → `images/objects/`, 640 × 640 PNG

Las cuatro son **la misma plántula** en distinto estado. Genera la sana primero
y úsala como referencia para las otras tres.

| Archivo | Prompt del objeto |
| --- | --- |
| `PlantaSana.png` | A healthy young cacao seedling with three bright green leaves, growing from a small mound of brown soil. |
| `PlantaMarchita.png` | The same young cacao seedling, now wilted and drooping, with dry yellowish leaves and cracked dry soil. |
| `PlantaHongos.png` | The same young cacao seedling, with white and grey fuzzy fungus patches spreading on its leaves. |
| `PlantaPlagas.png` | The same young cacao seedling, with small green aphids on it and chewed holes in its leaves. |

### Malezas → `images/objects/`, 512 × 512 PNG

| Archivo | Prompt del objeto |
| --- | --- |
| `MalezaFlor.png` | A messy clump of weeds with untidy green leaves and small white flowers. |
| `PastoSeco.png` | A tuft of dry golden-brown grass, straw-like and slightly bent. |

### Plagas y enfermedades → `images/objects/`, 512 × 512 PNG

| Archivo | Prompt del objeto |
| --- | --- |
| `Pulgon.png` | A small round green aphid insect with tiny antennae and a friendly cartoon face. |
| `Gusano.png` | A small green caterpillar with a friendly cartoon face, curled slightly. |
| `HojaManchada.png` | A single cacao leaf covered with brown and dark disease spots. |
| `EscobaBruja.png` | A cacao branch deformed by witches' broom disease, ending in a bushy tangle of dry twigs. |

### Retroalimentación → `images/ui/`, 256 × 256 PNG

| Archivo | Prompt del objeto |
| --- | --- |
| `IndicadorError.png` | A round glossy red circle badge with a thick white X mark in the center, twin of the attached green check badge. |

## Opcional: los botones de nivel

Las tarjetas de Mantener dibujan hoy el nombre del nivel con texto de Phaser.
Cosecha, en cambio, usa botones completos con el nombre ya dibujado dentro
(`btnIconoMazorcasListas.png`, 240 × 189). Si quieres que Mantener se vea igual,
genera estos cuatro en `images/buttons/`, imitando ese botón azul:

- `btnIconoRegar.png` con el texto **REGAR**
- `btnIconoMalezas.png` con el texto **QUITAR MALEZAS**
- `btnIconoPlagas.png` con el texto **BUSCAR PLAGAS**
- `btnIconoCuidado.png` con el texto **CUIDADO CORRECTO**

Cuando existan, en [`MantenerScene.js`](../src/scenes/MantenerScene.js) cambia
cada `iconTexture` por la clave nueva y pon `showLabel: false`. Es lo único que
hay que tocar.

## Antes de dar por buena una imagen

- [ ] El contorno es marrón cálido, no negro ni azul.
- [ ] Tiene brillo especular y volumen, no color plano.
- [ ] La transparencia es real: ábrela sobre un fondo oscuro y comprueba que no
      aparece un halo blanco ni un cuadriculado dibujado.
- [ ] Puesta al lado de `TijeraPodaAbierta.webp`, parecen del mismo juego.
- [ ] Las cuatro plantas se reconocen como la misma planta.
- [ ] Se distingue en el juego a tamaño real, no solo ampliada.
- [ ] El nombre y la carpeta son exactamente los de la tabla.
