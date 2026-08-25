# Plan y guía de recursos de Cocoa Adventure

Esta guía define cómo crear, reutilizar, nombrar y ubicar los recursos del juego. Su objetivo es que los próximos módulos conserven la misma identidad audiovisual y que ningún archivo termine en una carpeta que no corresponda.

## 1. Principios obligatorios

1. Reutilizar antes de crear. Antes de generar un sonido o imagen, revisar si ya existe un recurso que comunica la misma acción.
2. La categoría semántica manda. Un personaje pertenece a `characters/` aunque se use en un solo minijuego.
3. Un recurso debe tener una sola fuente de verdad. No se deben guardar copias de la misma imagen en varias carpetas públicas.
4. Los recursos de producción viven en `public/`. Los archivos fuente, candidatos y descartes locales de `design/` no se publican ni se incluyen en Git.
5. Todo recurso debe funcionar en pantallas táctiles y en el lienzo lógico de 1920 × 1080 configurado con `Phaser.Scale.FIT`.
6. El audio complementa la experiencia, pero nunca puede ser la única forma de comunicar una instrucción o resultado.

## 2. Arquitectura de audio

```text
public/audio/
├── music/   Música ambiental y pistas en bucle
├── sfx/     Efectos cortos de interacción y retroalimentación
└── voice/   Instrucciones y mensajes hablados
```

### Música (`audio/music`)

- Debe poder reproducirse en bucle sin un corte evidente.
- No debe contener instrucciones, diálogos ni efectos propios del minijuego.
- Debe acompañar sin competir con la voz.
- Se crea una sola instancia global y se reutiliza al cambiar de escena.
- Volumen de referencia actual en Phaser: `0.22`.
- Mientras habla una voz, reducir temporalmente el volumen a aproximadamente `0.08`.
- Al terminar o fallar la voz, restaurar siempre el volumen anterior.

Recurso disponible:

| Clave Phaser | Archivo | Uso |
| --- | --- | --- |
| `musicaFondo` | `music/MusicaFondo.mp3` | Música general de Cosecha y sus niveles. |

### Efectos (`audio/sfx`)

- Deben ser cortos y responder inmediatamente a la acción.
- Evitar silencios perceptibles al inicio.
- No reproducir varios efectos fuertes al mismo tiempo.
- Una respuesta incorrecta debe ser amable, nunca sonar como castigo.
- Un mismo significado debe conservar el mismo sonido en todos los módulos.

| Clave Phaser | Archivo | Reutilización indicada |
| --- | --- | --- |
| `sfxBotonTocar` | `sfx/BotonTocar.m4a` | Pulsación de botones interactivos. Es la única excepción actual al estándar MP3. |
| `sfxAvisoTiempo` | `sfx/AvisoTiempo.mp3` | Aviso cuando quedan pocos segundos. No repetir cada segundo. |
| `sfxDerrota` | `sfx/Derrota.mp3` | Derrota por tiempo agotado o por perder todas las vidas. Nunca debe reproducirse al completar un nivel. |
| `sfxEstrellaResultado` | `sfx/EstrellaResultado.mp3` | Aparición de cada estrella en resultados. Debe sonar una vez por cada estrella obtenida y acompañar su animación individual. |
| `sfxSeleccionCorrecta` | `sfx/SeleccionCorrecta.mp3` | Selección correcta de un objeto. |
| `sfxSeleccionIncorrecta` | `sfx/SeleccionIncorrecta.mp3` | Selección incorrecta amable y reutilizable, por ejemplo una mazorca verde o dañada. No debe asociarse exclusivamente con un color. |
| `sfxCorteTijera` | `sfx/CorteTijera.mp3` | Corte correcto del pedúnculo en “Corte cuidadoso”. Se reproduce una sola vez por mazorca cortada. |
| `sfxAperturaMazorca` | `sfx/AperturaMazorca.m4a` | Apertura gestual de una mazorca madura en “Abrir mazorcas”. No debe mezclarse con `sfxSeleccionCorrecta`. |

Para recursos nuevos, el formato estándar será MP3. `BotonTocar.m4a` y `AperturaMazorca.m4a` son excepciones ya aprobadas; no deben convertirse sin comparar antes que la conversión conserve el ataque corto del sonido.

### Cambio o reemplazo de un sonido compartido

Ningún integrante debe reemplazar, renombrar o borrar un sonido compartido por decisión individual. Un archivo puede estar siendo utilizado por varios módulos aunque se haya creado originalmente para uno solo.

Antes de proponer el cambio:

1. Buscar todas sus referencias en `PreloadScene` y en las escenas del proyecto.
2. Confirmar qué módulos, niveles y componentes lo reproducen.
3. Enviar al grupo el sonido actual y el sonido propuesto.
4. Explicar el motivo del cambio y en qué momentos se escuchará.
5. Comparar ambos archivos en PC y celular, junto con música y voz.
6. Esperar la aprobación explícita del grupo o responsable del proyecto.

Si el grupo aprueba un reemplazo que conserva exactamente el mismo significado:

- Eliminar el archivo anterior y colocar el sonido aprobado usando exactamente el mismo nombre, extensión y ruta.
- Mantener la misma clave de Phaser para no romper los módulos consumidores.
- No conservar en `public/` variantes como `Nuevo`, `Final`, `Final2` o copias duplicadas.
- Verificar nuevamente todos los módulos que utilizan esa clave, no solamente el nivel donde se solicitó el cambio.
- Registrar en el Pull Request qué sonido se reemplazó, quién aprobó el cambio y qué escenas se probaron.

Git conserva el historial del archivo anterior, por lo que no es necesario mantener una copia duplicada dentro de `public/`.

Si el sonido propuesto comunica una acción diferente, no es un reemplazo: debe recibir un nombre, archivo y clave nuevos. Reutilizar el nombre anterior en ese caso cambiaría silenciosamente el significado en otros módulos.

### Voces (`audio/voice`)

- Usar siempre una voz femenina de español de Ecuador.
- Mantener tono cálido, paciente y positivo.
- Una instrucción debe explicar una sola acción principal.
- Preferir una o dos oraciones cortas.
- Evitar tecnicismos, reglas encadenadas y expresiones que culpabilicen al niño.
- El texto visible y la voz deben comunicar la misma regla.
- Los mensajes correctivos deben explicar qué hacer: “Esa mazorca todavía está verde” es mejor que “Incorrecto”.
- Solo puede hablar una voz a la vez. Antes de iniciar otra, detener y destruir la anterior.

Cada minijuego debería considerar estas cuatro voces:

| Tipo | Momento | Ejemplo de intención |
| --- | --- | --- |
| Instrucción | Antes de iniciar | Explica qué debe tocar, arrastrar o seleccionar. |
| Ayuda | Primer error o inactividad | Da una pista corta sin penalizar. |
| Éxito | Al completar | Reconoce la acción realizada. |
| Tiempo agotado | Al terminar el tiempo | Invita a intentarlo nuevamente. |

En mecánicas rápidas con varios objetos simultáneos, una voz de ayuda puede omitirse si interrumpiría el ritmo o provocaría nuevos errores. “Abrir mazorcas” solo utiliza instrucción, éxito y tiempo agotado; sus errores durante la partida se comunican mediante SFX y animaciones breves sin pausar la acción.

## 3. Generación de voces con Edge TTS

La voz oficial del proyecto es `es-EC-AndreaNeural`, voz femenina de español de Ecuador.

Existen dos métodos aprobados. Ambos deben usar la misma voz, velocidad normal y texto definitivo.

### Método A: instalar Edge TTS en la computadora

#### Instalación

```bash
python -m pip install edge-tts
```

#### Verificar que la voz esté disponible

```bash
edge-tts --list-voices
```

Buscar `es-EC-AndreaNeural` en el resultado antes de generar un lote nuevo.

#### Perfil de generación local

Usar el mismo perfil para todas las voces nuevas:

```bash
edge-tts \
  --voice es-EC-AndreaNeural \
  --rate=+0% \
  --pitch=+0Hz \
  --volume=+0% \
  --text "Toca las mazorcas amarillas y anaranjadas." \
  --write-media SeleccionMadurasInstruccion.mp3
```

En PowerShell puede escribirse en una sola línea:

```powershell
edge-tts --voice es-EC-AndreaNeural --rate=+0% --pitch=+0Hz --volume=+0% --text "Toca las mazorcas amarillas y anaranjadas." --write-media SeleccionMadurasInstruccion.mp3
```

### Método B: usar el sitio web

Abrir [edge-tts.com](https://edge-tts.com/) y seguir estos pasos:

1. Seleccionar español de Ecuador (`es-EC`) como idioma o región.
2. Seleccionar género femenino.
3. Elegir la voz Andrea, correspondiente a `es-EC-AndreaNeural`.
4. Mantener la velocidad en `1x` y el tono en su valor predeterminado.
5. Pegar exactamente el guion aprobado, incluyendo su puntuación.
6. Seleccionar **Generate Audio**.
7. Escuchar el resultado completo antes de descargarlo.
8. Descargar el MP3 y renombrarlo según las convenciones del proyecto.

Si el sitio no muestra `es-EC-AndreaNeural` o no permite confirmar la voz seleccionada, usar el método local. No sustituirla por una voz de otro país solo para completar la generación.

No cambiar velocidad, tono o voz para un archivo aislado. Si el equipo decide modificar el perfil, debe comunicarlo, aprobarlo y evaluar si las voces anteriores también necesitan regenerarse.

### Escritura del guion

- Escribir primero el texto definitivo; no generar mientras el guion todavía cambia.
- Usar puntuación natural para controlar las pausas.
- Escribir números como palabras cuando deban pronunciarse de una forma concreta.
- Evitar abreviaturas.
- Probar el nombre de objetos agrícolas y corregir el texto si la pronunciación resulta ambigua.
- El nombre del archivo describe la escena y la intención: `SeleccionMadurasTiempoAgotado.mp3`.

### Revisión obligatoria de una voz

1. Escuchar el archivo completo con audífonos y altavoz de celular.
2. Confirmar pronunciación, volumen y ausencia de cortes.
3. Revisar que no exista silencio largo al inicio o al final.
4. Reproducirla encima de la música con los volúmenes reales del juego.
5. Confirmar que el texto visible sigue siendo comprensible con el audio desactivado.
6. Probar que el minijuego continúa si el navegador bloquea o no carga el audio.

## 4. Uso de audio en Phaser

Todos los audios se registran una sola vez en `PreloadScene`:

```js
this.load.audio(
    "vozNombreMinijuegoInstruccion",
    "audio/voice/NombreMinijuegoInstruccion.mp3"
);
```

No cargar un mismo archivo otra vez desde cada escena.

### Reutilizar música

```js
let music = this.sound.get("musicaFondo");

if (!music) {
    music = this.sound.add("musicaFondo", {
        loop: true,
        volume: 0.22
    });
}

if (!music.isPlaying) music.play();
```

### Reproducir efectos

```js
this.sound.play("sfxSeleccionCorrecta", { volume: 0.65 });
```

### Ciclo de vida de una voz

```js
if (this.activeVoice) {
    this.activeVoice.stop();
    this.activeVoice.destroy();
}

const voice = this.sound.add("vozNombreMinijuegoInstruccion");
this.activeVoice = voice;

voice.once("complete", () => {
    if (this.activeVoice === voice) {
        voice.destroy();
        this.activeVoice = null;
    }
});

voice.play();
```

Además, detener y destruir la voz durante `Phaser.Scenes.Events.SHUTDOWN`. Al ocultar la aplicación o cambiar de pestaña, pausar el minijuego para evitar que el tiempo continúe sin el jugador.

### Reglas móviles

- El primer audio puede requerir una interacción del usuario por las restricciones de reproducción automática del navegador.
- Un tutorial debe ofrecer texto visible y una forma clara de continuar: un botón grande o una práctica interactiva sin tiempo ni penalizaciones.
- Si una voz falla, nunca dejar al jugador atrapado esperando el evento `complete`.
- Al pausar el juego, pausar también música, avisos y cronómetro.

## 5. Arquitectura de imágenes

```text
public/images/
├── achievements/  Insignias y recursos de logros
├── background/    Fondos completos, mosaicos y escenarios
├── buttons/       Imágenes completas de botones (prefijo btn)
├── characters/    Personajes y sus poses
├── decorations/   Árboles, plantas y elementos ambientales no interactivos
├── icons/         Iconos reutilizables que no son botones completos
├── minigames/     Composiciones exclusivas y no separables de un minijuego
├── modules/       Botones o portadas de los módulos principales
├── objects/       Objetos interactivos o reutilizables
└── ui/            HUD, indicadores, estrellas, paneles, pausas y candados
```

### Regla para decidir la carpeta

1. Si el recurso representa una categoría clara, usar su carpeta semántica.
2. Si puede reutilizarse en otro nivel, nunca colocarlo dentro de `minigames/`.
3. Solo usar `minigames/` cuando el archivo combine una secuencia o composición exclusiva que no pueda separarse razonablemente.
4. No crear una carpeta nueva solo para evitar decidir la categoría correcta.

Ejemplos:

| Recurso | Ubicación correcta |
| --- | --- |
| Pose de Cacaíto cosechando | `images/characters/` |
| Mazorca verde interactiva | `images/objects/` |
| Árbol de cacao no interactivo | `images/decorations/` |
| Fondo de finca | `images/background/` |
| Botón completo “Mazorcas listas” | `images/buttons/` |
| Indicador de selección correcta | `images/ui/` |
| Spritesheet inseparable de una secuencia de corte | `images/minigames/cosechar/corte-cuidadoso/` |

### HUD común obligatorio para todos los minijuegos

Todos los minijuegos deben reutilizar los mismos assets aprobados para vidas, tiempo y pausa. No se deben crear corazones, relojes o botones de pausa diferentes para cada módulo.

| Clave Phaser | Archivo | Uso obligatorio |
| --- | --- | --- |
| `CorazonLleno` | `images/ui/CorazonLleno.png` | Vida disponible. Mostrar una instancia por cada vida configurada. |
| `CorazonVacio` | `images/ui/CorazonVacio.png` | Vida perdida. Debe sustituir al corazón lleno en la misma posición. |
| `PanelTemporizador` | `images/ui/PanelTemporizador.png` | Marco común del cronómetro de todos los minijuegos. |
| `btnPausa` | `images/ui/btnPausa.png` | Botón común para abrir la pausa. |
| `btnRepetirAudio` | `images/ui/btnRepetirAudio.png` | Repetir la instrucción hablada después de cerrar el tutorial. |

Reglas de implementación:

1. Registrar estos assets una sola vez en `PreloadScene` y reutilizar sus claves en todas las escenas.
2. Mantener configurable la cantidad máxima de vidas. Cambiar ese único valor debe crear automáticamente la cantidad correspondiente de corazones y conservar la lógica de pérdida y derrota.
3. Construir el contador de vidas con código. No crear una imagen diferente con tres, cuatro o más corazones ya dibujados.
4. Mostrar `CorazonLleno` mientras la vida esté disponible y cambiarlo por `CorazonVacio` al perderla. Ambos estados deben conservar posición y tamaño para evitar saltos visuales.
5. Dibujar el tiempo dinámicamente con texto de Phaser en formato `MM:SS` sobre `PanelTemporizador`. Nunca incluir números fijos dentro del PNG.
6. Escalar y posicionar el HUD usando las dimensiones del lienzo; no usar coordenadas pensadas únicamente para PC.
7. Mantener una zona táctil cómoda alrededor de `btnPausa`, aunque el círculo visible sea más pequeño.
8. Al pausar, detener cronómetro, eventos, animaciones e interacción, y pausar también música, voces o avisos que estén reproduciéndose. Al continuar, restaurar el estado sin reiniciar el nivel.
9. No recolorear, duplicar, renombrar ni sustituir estos assets desde un minijuego individual. Cualquier cambio visual debe revisarse como una modificación global porque afecta a todos los módulos.
10. Después de cerrar el tutorial, mostrar `btnRepetirAudio` en una esquina segura. Al tocarlo, reproducir nuevamente la voz de instrucción y pausar temporalmente el cronómetro y la interacción para no penalizar al niño.

### Implementación reutilizable del HUD

No copiar los métodos de vidas, cronómetro, pausa o repetición dentro de una escena. El componente `src/ui/HudMinijuego.js` compone y coordina los elementos comunes. La escena solamente entrega configuración y callbacks para sus objetos particulares.

```js
import HudMinijuego from "../ui/HudMinijuego";
import GestorAudioMinijuego from "../managers/GestorAudioMinijuego";

this.audio = new GestorAudioMinijuego(this);

this.hud = new HudMinijuego(this, {
    lives: {
        maxLives: 3
    },
    timer: {
        durationSeconds: 60
    },
    controls: {},
    instructionAudio: "vozNombreMinijuegoInstruccion",
    audioManager: this.audio,
    onTimeUp: () => this.failLevel("time"),
    onLivesEmpty: () => this.failLevel("lives"),
    onGameplaySuspended: reason => this.disableGameplay(reason),
    onGameplayResumed: reason => this.enableGameplay(reason),
    onExit: () => this.scene.start("NombreEscenaNiveles")
});
```

Después del tutorial, iniciar todos los sistemas comunes con una sola llamada:

```js
this.hud.start();
```

Cuando una acción quite una vida:

```js
this.hud.loseLife();
```

Para calcular estrellas a partir de las vidas restantes:

```js
const stars = this.hud.calculateStars(3);
```

Al completar o fallar el nivel:

```js
this.hud.stop();
```

Para consultar estado sin acceder a componentes internos:

```js
const remainingLives = this.hud.getRemainingLives();
const remainingTime = this.hud.getRemainingTime();
```

Si un minijuego no tiene errores que consuman vidas, ocultarlas explícitamente sin crear otra versión del HUD:

```js
lives: {
    enabled: false
}
```

Responsabilidades separadas:

| Archivo | Responsabilidad |
| --- | --- |
| `ui/HudMinijuego.js` | Coordina inicio, detención, pausa, reanudación, vidas, tiempo y repetición. |
| `ui/IndicadorVidas.js` | Construye corazones dinámicos, pierde vidas y calcula estrellas. |
| `ui/TemporizadorRegresivo.js` | Cuenta el tiempo, dibuja `MM:SS` y reproduce el aviso final. |
| `ui/BotonIconoHud.js` | Proporciona botones táctiles responsive sin duplicar eventos de puntero. |
| `ui/PanelPausa.js` | Construye la ventana común de pausa. |
| `managers/GestorAudioMinijuego.js` | Controla música, atenuación, voces, pausa y restauración de audio. |

La escena mantiene únicamente la mecánica propia: creación de objetos, validación de acciones, progreso y navegación específica. Durante `Phaser.Scenes.Events.SHUTDOWN`, debe destruir `hud` y `audio` para eliminar eventos y voces activas.

## 6. Uso de `images/minigames/cosechar`

Esta carpeta no debe duplicar `objects`, `characters`, `buttons` o `ui`. Su propósito será almacenar recursos compuestos y exclusivos de una mecánica concreta.

Estructura recomendada cuando existan esos recursos:

```text
public/images/minigames/cosechar/
├── seleccionar-maduras/
├── corte-cuidadoso/
├── abrir-mazorcas/
└── revision-acopio/
```

Recursos que sí podrían pertenecer allí:

- `SpritesheetCorteMazorca.webp`: secuencia completa que combina herramienta, corte y reacción de la mazorca.
- Mitades alineadas de una mazorca que solo se combinan durante la animación de apertura.
- `AtlasClasificacionAcopio.webp`: composición animada exclusiva de la mesa o banda de clasificación.
- Una máscara visual propia del nivel que no sea un elemento general de interfaz.
- Una secuencia ilustrada completa utilizada únicamente por ese minijuego.

Recursos que no deben colocarse allí:

- Cacaíto o cualquiera de sus poses.
- Mazorcas individuales.
- Fondos completos.
- Botones, estrellas, candados o indicadores reutilizables.
- Música, voces o efectos de sonido.

Actualmente “Seleccionar maduras” no necesita guardar imágenes en esa carpeta: sus piezas están correctamente separadas entre `background`, `decorations`, `objects` y `ui`. Una carpeta vacía no necesita subirse a Git.

“Corte cuidadoso” sí utiliza `minigames/cosechar/corte-cuidadoso/` para tres capas inseparables y perfectamente alineadas: `RamaMazorcaCorte`, `RamaCortadaCorte` y `MazorcaDesprendidaCorte`. La unión botánica entre rama, pedúnculo y fruto no debe reconstruirse combinando sprites independientes, porque cualquier diferencia de escala o pivote deja huecos visibles. Las tres capas deben conservar el mismo estilo y punto de corte. Las tijeras permanecen en `objects/` y `btnMantenerCorte` en `buttons/` porque sí son piezas independientes.

“Abrir mazorcas” utiliza `minigames/cosechar/abrir-mazorcas/` para las mitades amarillas y anaranjadas que forman su animación exclusiva. Las mazorcas completas permanecen en `objects/` porque se reutilizan en distintos niveles. La estela, destellos, indicadores `+1` y `−1` y partículas se dibujan con Phaser; no deben convertirse en imágenes duplicadas.

Durante “Abrir mazorcas” no se reproducen voces en medio de la acción. Una apertura madura usa `AperturaMazorca.m4a`, cortar una verde o dañada usa `SeleccionIncorrecta.mp3` y dejar caer una madura solo muestra la pérdida visual de vida, sin SFX. Esto evita detener o saturar un juego con varios objetos simultáneos.

## 7. Estética visual obligatoria

- Mantener ilustración 2D infantil, colorida y de formas fáciles de reconocer.
- Usar contornos oscuros claros y volúmenes suaves, como los assets existentes.
- Evitar mezclar fotografías, pixel art, estilos planos sin contorno o renders realistas.
- Usar los botones existentes como referencia de marco, tipografía, proporción y sombreado.
- Conservar transparencia alfa real en sprites; nunca dibujar un patrón cuadriculado como fondo.
- Evitar texto generado dentro de una imagen salvo que el asset sea un botón completo aprobado.
- No depender únicamente del color: separar los objetos del follaje, mantener siluetas reconocibles y añadir indicadores visuales cuando sea necesario.
- Las zonas táctiles deben ser cómodas en celular aunque el sprite visible sea pequeño.
- Revisar cada composición en horizontal y con el escalado de Phaser, no únicamente viendo el PNG aislado.

### Convenciones de nombres

- Usar nombres descriptivos en `PascalCase`: `MazorcaMaduraAmarilla.webp`.
- Los botones completos comienzan con `btn`: `btnIconoMazorcasListas.png`.
- Evitar espacios, tildes y nombres genéricos como `imagen1.png` o `nuevoFinal.png`.
- La clave de Phaser debe coincidir conceptualmente con el archivo y conservarse estable.
- Los candidatos `v2`, `final` o `aprobado` pertenecen al flujo local de diseño, no a `public/`.

## 8. Flujo para agregar un recurso

1. Definir para qué escena, acción y estado se necesita.
2. Buscar primero un recurso reutilizable en `public/audio` o `public/images`.
3. Elegir la categoría semántica correcta.
4. Crear el recurso siguiendo los assets aprobados como referencias visuales o sonoras.
5. Validar dimensiones, transparencia, volumen, duración y nombre.
6. Copiar únicamente la versión aprobada a `public/`.
7. Registrarla en `PreloadScene` con una clave descriptiva.
8. Usar esa clave desde la escena; no escribir rutas públicas directamente en la lógica del minijuego.
9. Probar en PC y en un celular horizontal.
10. Confirmar que no existen errores en consola, rutas faltantes ni recursos duplicados.

## 9. Lista de control para revisión de PR

- [ ] El recurso tiene una necesidad concreta y no duplica otro existente.
- [ ] Está dentro de la carpeta semántica correcta.
- [ ] El nombre cumple las convenciones.
- [ ] Solo la versión aprobada está dentro de `public/`.
- [ ] Las imágenes coinciden con la estética existente y tienen transparencia real cuando corresponde.
- [ ] Las instrucciones también aparecen visualmente y no dependen solo del audio.
- [ ] Las voces usan `es-EC-AndreaNeural` y el perfil acordado.
- [ ] Todo sonido reemplazado fue compartido, revisado y aprobado antes de modificar `public/`.
- [ ] El reemplazo conserva el mismo nombre, ruta, clave y significado; no dejó duplicados.
- [ ] Se probaron todos los módulos que consumen el sonido reemplazado.
- [ ] Música, voz y efectos mantienen un balance comprensible.
- [ ] El recurso está registrado una sola vez en `PreloadScene`.
- [ ] El minijuego reutiliza `CorazonLleno`, `CorazonVacio`, `PanelTemporizador` y `btnPausa` para su HUD.
- [ ] La cantidad de vidas se controla mediante un único valor configurable y los corazones se generan dinámicamente.
- [ ] El tiempo se dibuja dinámicamente sobre el panel; el PNG no contiene números fijos.
- [ ] La pausa detiene y restaura correctamente todos los sistemas activos del minijuego.
- [ ] El botón `btnRepetirAudio` permite volver a escuchar la instrucción sin consumir tiempo de juego.
- [ ] La escena limpia voces y eventos al cerrarse.
- [ ] La interacción fue probada en celular horizontal.
- [ ] No existen errores en consola ni archivos faltantes.

## 10. Referencias técnicas

- [Voces e idiomas compatibles de Microsoft Speech](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support)
- [Proyecto y uso de la línea de comandos de edge-tts](https://github.com/rany2/edge-tts)
