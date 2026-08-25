# Plan del minijuego: Abrir mazorcas

## Objetivo

El niño debe deslizar el dedo sobre 11 mazorcas maduras antes de que terminen 90 segundos. Las amarillas y anaranjadas son correctas; las verdes y dañadas no deben abrirse. El nivel utiliza el HUD compartido y está diseñado para celular horizontal y pruebas en PC.

```js
const CONFIGURACION_NIVEL = Object.freeze({
    objetivoMazorcas: 11,
    duracionSegundos: 90,
    vidasMaximas: 3,
    estrellasMaximas: 3,
    maximoSimultaneas: 3,
    intervaloAparicionMinMs: 1600,
    intervaloAparicionMaxMs: 2200,
    duracionVueloMinMs: 4200,
    duracionVueloMaxMs: 5200,
    proteccionPerdidaVidaMs: 800
});
```

Los valores se concentran en `AbrirMazorcasScene.js`; modificar una cifra no debe requerir cambios en la lógica interna. La cantidad de carriles se deriva de `maximoSimultaneas`.

## Reglas

- Un toque sin desplazamiento no cuenta como corte. La distancia mínima es `max(24 px, 1.8 % del ancho)`.
- Un deslizamiento puede abrir varias mazorcas y cada mazorca se procesa una sola vez.
- La colisión usa un segmento contra una elipse táctil ampliada.
- Los gestos iniciados sobre el HUD se ignoran.
- Pausa, repetición, cambio de pestaña y `pointercancel` cancelan el gesto sin penalizar.
- Existen como máximo tres mazorcas simultáneas por defecto y una por carril.
- La bolsa de aparición contiene tres maduras, una verde y una dañada; nunca salen más de dos incorrectas consecutivas.
- Las maduras incluyen destellos dorados para no depender únicamente del color.

### Respuestas

| Situación | Resultado |
| --- | --- |
| Abrir una madura | Se divide, aparecen partículas y `+1`, aumenta el contador y suena `AperturaMazorca.m4a`. |
| Cortar una verde o dañada | Aparece una X, tiembla, desaparece, pierde una vida y suena `SeleccionIncorrecta.mp3`. |
| Dejar caer una madura | Pierde una vida y aparece `−1` con un corazón cerca de la salida. No reproduce audio. |
| Dejar caer una incorrecta | Desaparece sin penalización, aviso ni audio. |

Tras perder una vida existe una protección global de 800 ms. Durante ella los objetos todavía reaccionan, pero no se descuentan más vidas ni se acumulan sonidos de error.

## Tutorial y audio

Cacaíto presenta la instrucción y desaparece. Después aparece una mazorca madura estática con una guía visual y el mensaje “¡Desliza sobre la mazorca para abrirla!”. El niño debe realizar personalmente el gesto correcto; no existen tiempo, puntos ni penalizaciones durante esta práctica. El reloj, los corazones, el contador y los controles permanecen ocultos para dejar claro que el nivel todavía no empezó. La partida y el HUD comienzan únicamente después de que la mazorca tutorial se abre, sin botón “Jugar”.

| Archivo | Texto o función |
| --- | --- |
| `AbrirMazorcasInstruccion.mp3` | “Desliza tu dedo sobre las mazorcas amarillas y anaranjadas para abrirlas. Evita las verdes y las dañadas. No dejes caer las maduras.” |
| `AbrirMazorcasCompletado.mp3` | “¡Excelente! Abriste todas las mazorcas maduras y cuidaste las demás.” |
| `AbrirMazorcasTiempoAgotado.mp3` | “Se terminó el tiempo. Inténtalo otra vez y abre las mazorcas maduras.” |
| `AperturaMazorca.m4a` | Único efecto de una apertura correcta. |

No existen voces para cortes incorrectos o caídas. Durante la acción solamente se usan efectos breves para no interrumpir el ritmo.

## Assets

Producción:

```text
public/images/buttons/btnIconoAbrirMazorcas.png
public/images/minigames/cosechar/abrir-mazorcas/
├── MazorcaAmarillaMitadIzquierda.webp
├── MazorcaAmarillaMitadDerecha.webp
├── MazorcaNaranjaMitadIzquierda.webp
└── MazorcaNaranjaMitadDerecha.webp
```

Los originales generados permanecen en `design/assets/cosecha-candidates/abrir-mazorcas/` para revisión local. El botón conserva el marco de los niveles anteriores. Las mitades tienen transparencia, pulpa blanca y semillas visibles. Estela, destellos, X, indicadores y partículas se dibujan con Phaser.

## Arquitectura

- `AbrirMazorcasScene.js`: estados, HUD, apariciones, reglas, resultados y progreso.
- `MazorcaVoladora.js`: trayectoria, hitbox y animaciones de cada fruto.
- `GestorCorteDeslizante.js`: eventos táctiles, estela y cortes múltiples.
- `intersectaSegmentoElipse.js`: geometría pura y comprobable.
- `bolsaMazorcas.js`: distribución y límite de incorrectas consecutivas.

Se reutilizan `HudMinijuego`, `GestorAudioMinijuego`, `TutorialPanel`, `ResultPanel` y `ProgressManager`.

## Resultado y progreso

- Tres, dos o una vida restante producen tres, dos o una estrella respectivamente.
- Cero vidas o tiempo agotado producen derrota y cero estrellas.
- El corte número 11 detiene inmediatamente cronómetro, apariciones y entrada.
- La voz de éxito termina antes de mostrar el panel y las estrellas aparecen una por una con su sonido.
- El progreso se guarda en `cosechar.abrirMazorcas` y desbloquea `revisionAcopio`.
- Los guardados con `cosechar.aLaCanasta` se migran conservando la mayor puntuación y eliminando la clave antigua en el siguiente guardado.

## Validación

- Probar toque, deslizamiento corto, corte múltiple y doble intento sobre la misma mazorca.
- Probar aciertos, errores, caídas y protección de 800 ms.
- Confirmar máximo simultáneo, carriles y secuencia de la bolsa.
- Probar pausa, repetición, pérdida de foco, salida, reintento y regreso a niveles.
- Verificar victoria, ambas derrotas, estrellas, guardado, migración y desbloqueo.
- Revisar visualmente en PC y celular horizontal que ninguna trayectoria invada el HUD.
