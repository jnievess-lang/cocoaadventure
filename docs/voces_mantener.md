# Voces del módulo Mantener

Guiones definitivos de las dieciséis voces del módulo Mantener. Se generan con
la voz oficial del proyecto, `es-EC-AndreaNeural`, siguiendo el perfil descrito
en [`plan_guia.md`](plan_guia.md) sección 3.

**Estado actual: los dieciséis MP3 ya están en `public/audio/voice/` y el
módulo los reproduce.** Se generaron con la voz Andrea (`es-EC-AndreaNeural`)
en [ttsfree.com](https://ttsfree.com/text-to-speech/spanish-ecuador), con
velocidad y tono por defecto y sin música de fondo.

Los textos de abajo son la fuente de verdad: si alguno se regenera, debe decir
exactamente lo mismo que el texto visible del nivel.

## Guiones

Cada archivo va en `public/audio/voice/` con exactamente el nombre indicado.

### Regar

| Archivo | Clave Phaser | Texto |
| --- | --- | --- |
| `RegarInstruccion.mp3` | `vozRegarInstruccion` | Algunas plantas están caídas porque tienen sed. Tócalas para regarlas. |
| `RegarAyuda.mp3` | `vozRegarAyuda` | Esa planta ya está verde y sana. Busca las que están caídas. |
| `RegarCompletado.mp3` | `vozRegarCompletado` | ¡Muy bien! Todas las plantas ya tomaron agua. |
| `RegarTiempoAgotado.mp3` | `vozRegarTiempoAgotado` | Se acabó el tiempo. Volvamos a regar las plantas. |

### Quitar malezas

| Archivo | Clave Phaser | Texto |
| --- | --- | --- |
| `MalezasInstruccion.mp3` | `vozMalezasInstruccion` | Toca las hierbas y el pasto seco que crecen junto al cacao. |
| `MalezasAyuda.mp3` | `vozMalezasAyuda` | Esa es una plantita de cacao. Ella se queda en el terreno. |
| `MalezasCompletado.mp3` | `vozMalezasCompletado` | ¡Excelente! El terreno quedó limpio para el cacao. |
| `MalezasTiempoAgotado.mp3` | `vozMalezasTiempoAgotado` | Se acabó el tiempo. Volvamos a limpiar el terreno. |

### Buscar plagas

| Archivo | Clave Phaser | Texto |
| --- | --- | --- |
| `PlagasInstruccion.mp3` | `vozPlagasInstruccion` | Revisa el árbol con la lupa y toca lo que esté enfermo o tenga insectos. |
| `PlagasAyuda.mp3` | `vozPlagasAyuda` | Esa mazorca está sana. Busca las que tienen manchas o bichitos. |
| `PlagasCompletado.mp3` | `vozPlagasCompletado` | ¡Muy bien! Dejaste el árbol sano y revisado. |
| `PlagasTiempoAgotado.mp3` | `vozPlagasTiempoAgotado` | Se acabó el tiempo. Revisemos el árbol otra vez. |

### Cuidado correcto

| Archivo | Clave Phaser | Texto |
| --- | --- | --- |
| `CuidadoCorrectoInstruccion.mp3` | `vozCuidadoCorrectoInstruccion` | Mira qué le pasa a cada planta y elige la herramienta que necesita. |
| `CuidadoCorrectoAyuda.mp3` | `vozCuidadoCorrectoAyuda` | Esa herramienta no es la que necesita. Mira otra vez sus hojas. |
| `CuidadoCorrectoCompletado.mp3` | `vozCuidadoCorrectoCompletado` | ¡Felicitaciones! Sabes cuidar muy bien el cacao. |
| `CuidadoCorrectoTiempoAgotado.mp3` | `vozCuidadoCorrectoTiempoAgotado` | Se acabó el tiempo. Cuidemos las plantas otra vez. |

## Regenerar una voz con edge-tts

Los archivos actuales vienen de ttsfree.com. Si alguna voz hay que rehacerla y
prefieres el método local de la guía, requiere Python; en este equipo no estaba
instalado. La alternativa sin instalar nada es repetir el proceso en
[ttsfree.com](https://ttsfree.com/text-to-speech/spanish-ecuador) eligiendo la
voz **Andrea**, dejando velocidad y tono en `Default` y sin marcar música de
fondo.

Instalación:

```bash
python -m pip install edge-tts
```

Comprueba que la voz esté disponible antes de generar el lote:

```bash
edge-tts --list-voices
```

Genera los dieciséis archivos desde `public/audio/voice/` con este script. Usa
el mismo perfil que el resto del proyecto: velocidad, tono y volumen sin
alterar.

```bash
edge-tts --voice es-EC-AndreaNeural --rate=+0% --pitch=+0Hz --volume=+0% --text "Algunas plantas están caídas porque tienen sed. Tócalas para regarlas." --write-media RegarInstruccion.mp3
edge-tts --voice es-EC-AndreaNeural --rate=+0% --pitch=+0Hz --volume=+0% --text "Esa planta ya está verde y sana. Busca las que están caídas." --write-media RegarAyuda.mp3
edge-tts --voice es-EC-AndreaNeural --rate=+0% --pitch=+0Hz --volume=+0% --text "¡Muy bien! Todas las plantas ya tomaron agua." --write-media RegarCompletado.mp3
edge-tts --voice es-EC-AndreaNeural --rate=+0% --pitch=+0Hz --volume=+0% --text "Se acabó el tiempo. Volvamos a regar las plantas." --write-media RegarTiempoAgotado.mp3
edge-tts --voice es-EC-AndreaNeural --rate=+0% --pitch=+0Hz --volume=+0% --text "Toca las hierbas y el pasto seco que crecen junto al cacao." --write-media MalezasInstruccion.mp3
edge-tts --voice es-EC-AndreaNeural --rate=+0% --pitch=+0Hz --volume=+0% --text "Esa es una plantita de cacao. Ella se queda en el terreno." --write-media MalezasAyuda.mp3
edge-tts --voice es-EC-AndreaNeural --rate=+0% --pitch=+0Hz --volume=+0% --text "¡Excelente! El terreno quedó limpio para el cacao." --write-media MalezasCompletado.mp3
edge-tts --voice es-EC-AndreaNeural --rate=+0% --pitch=+0Hz --volume=+0% --text "Se acabó el tiempo. Volvamos a limpiar el terreno." --write-media MalezasTiempoAgotado.mp3
edge-tts --voice es-EC-AndreaNeural --rate=+0% --pitch=+0Hz --volume=+0% --text "Revisa el árbol con la lupa y toca lo que esté enfermo o tenga insectos." --write-media PlagasInstruccion.mp3
edge-tts --voice es-EC-AndreaNeural --rate=+0% --pitch=+0Hz --volume=+0% --text "Esa mazorca está sana. Busca las que tienen manchas o bichitos." --write-media PlagasAyuda.mp3
edge-tts --voice es-EC-AndreaNeural --rate=+0% --pitch=+0Hz --volume=+0% --text "¡Muy bien! Dejaste el árbol sano y revisado." --write-media PlagasCompletado.mp3
edge-tts --voice es-EC-AndreaNeural --rate=+0% --pitch=+0Hz --volume=+0% --text "Se acabó el tiempo. Revisemos el árbol otra vez." --write-media PlagasTiempoAgotado.mp3
edge-tts --voice es-EC-AndreaNeural --rate=+0% --pitch=+0Hz --volume=+0% --text "Mira qué le pasa a cada planta y elige la herramienta que necesita." --write-media CuidadoCorrectoInstruccion.mp3
edge-tts --voice es-EC-AndreaNeural --rate=+0% --pitch=+0Hz --volume=+0% --text "Esa herramienta no es la que necesita. Mira otra vez sus hojas." --write-media CuidadoCorrectoAyuda.mp3
edge-tts --voice es-EC-AndreaNeural --rate=+0% --pitch=+0Hz --volume=+0% --text "¡Felicitaciones! Sabes cuidar muy bien el cacao." --write-media CuidadoCorrectoCompletado.mp3
edge-tts --voice es-EC-AndreaNeural --rate=+0% --pitch=+0Hz --volume=+0% --text "Se acabó el tiempo. Cuidemos las plantas otra vez." --write-media CuidadoCorrectoTiempoAgotado.mp3
```

## Revisión antes de subir

Aplica la revisión obligatoria de la guía a cada archivo generado:

- [ ] Se escucha completo, con audífonos y con altavoz de celular.
- [ ] No hay silencio largo al inicio ni al final.
- [ ] Se entiende por encima de la música con los volúmenes reales del juego.
- [ ] El texto visible del nivel comunica la misma regla que la voz.
- [ ] El nivel sigue siendo jugable con el audio desactivado.
- [ ] La consola ya no muestra errores de decodificación.
