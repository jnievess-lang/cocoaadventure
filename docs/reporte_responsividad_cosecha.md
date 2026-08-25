# Reporte de responsividad de los minijuegos de Cosecha

## 1. Objetivo de la revisión

Este reporte evalúa si los cuatro minijuegos del módulo de Cosecha están preparados para utilizarse en celulares horizontales y si cumplen las reglas definidas en [`plan_guia.md`](./plan_guia.md).

Minijuegos revisados:

1. Mazorcas listas.
2. Corte cuidadoso.
3. Abrir mazorcas.
4. Clasificar semillas.

La revisión fue estática: se analizaron la configuración de Phaser, las escenas, los componentes compartidos, las áreas táctiles, la orientación y las pruebas automatizadas disponibles. No sustituye una prueba de usabilidad en celulares físicos.

## 2. Conclusión general

Los cuatro minijuegos están construidos sobre una base compatible con celulares horizontales y no dependen exclusivamente de una pantalla de PC.

El juego utiliza un lienzo lógico de 1920 × 1080 con `Phaser.Scale.FIT`. Esto permite que toda la composición se reduzca proporcionalmente y evita que las imágenes se deformen. En pantallas con una proporción diferente de 16:9 pueden aparecer espacios laterales, pero el contenido conserva su proporción.

No obstante, todavía no se puede considerar completamente validada la experiencia móvil. Se identificaron tres riesgos principales:

1. Algunos botones compartidos quedan físicamente pequeños en celulares.
2. El tablero 7×7 de “Clasificar semillas” queda compacto en pantallas de poca altura.
3. No existe una zona segura explícita para notch, barras del navegador o áreas reservadas del sistema.

## 3. Cumplimiento global

### Aspectos correctamente implementados

- El juego usa un lienzo lógico de 1920 × 1080.
- Se utiliza `Phaser.Scale.FIT` y centrado automático.
- El contenedor ocupa el ancho y alto disponibles de la ventana.
- Se bloquean el desplazamiento, la selección accidental y los gestos del navegador mediante `touch-action: none`.
- El documento incluye una configuración `viewport` para dispositivos móviles.
- Al detectar orientación vertical aparece un aviso para girar el dispositivo.
- El bucle del juego se detiene mientras el celular permanece vertical.
- Los cuatro minijuegos reutilizan `HudMinijuego`.
- Los corazones se generan dinámicamente según la cantidad de vidas configurada.
- El reloj, los corazones, la pausa y la repetición de instrucciones se posicionan utilizando las dimensiones del lienzo.
- Los botones de pausa y repetición tienen áreas táctiles invisibles mayores que sus iconos.
- Las instrucciones se presentan mediante texto y audio, por lo que no dependen únicamente del sonido.

### Tipo de responsividad implementada

La aplicación utiliza una responsividad por escalado, no una distribución adaptativa completa.

Esto significa que:

- La composición completa se reduce o amplía manteniendo su proporción.
- Los elementos no se deforman.
- Las escenas no necesitan redistribuirse cada vez que cambia el tamaño de la ventana, porque el lienzo lógico continúa siendo 1920 × 1080.
- En una pantalla física pequeña también se reducen los botones, textos y objetivos táctiles.

Por este último motivo, una interfaz que se ve correctamente puede seguir teniendo elementos demasiado pequeños para un niño.

## 4. Evaluación por minijuego

| Minijuego | Evaluación | Resultado |
| --- | --- | --- |
| Mazorcas listas | Apto con observación | La composición es proporcional, pero las mazorcas pueden quedar estrechas en celulares pequeños. |
| Corte cuidadoso | Apto | Posee áreas táctiles grandes y controles adecuados para mantener presionado. |
| Abrir mazorcas | Apto | Los objetivos son grandes y la detección de deslizamiento está preparada para eventos táctiles. |
| Clasificar semillas | Apto condicionado | La matriz funciona, pero las celdas 7×7 pueden resultar pequeñas para niños. |

### 4.1. Mazorcas listas

La escena calcula el árbol, el contador y las mazorcas utilizando proporciones del ancho y alto lógico.

Aspectos positivos:

- El fondo conserva su proporción y cubre el lienzo.
- El árbol se escala según la altura disponible.
- Las posiciones de las mazorcas son relativas al árbol.
- El contador está debajo de los corazones y no utiliza coordenadas físicas de PC.
- Cada mazorca usa una elipse interactiva que cubre el sprite completo.

Riesgo detectado:

- Las mazorcas tienen aproximadamente el 6,8 % del ancho lógico.
- En un celular de 568×320, su ancho físico aproximado es de 39 píxeles.
- La altura de la mazorca ayuda a tocarla, pero su anchura puede resultar limitada para niños con dificultades visuales o motoras.

Recomendación:

- Ampliar la elipse táctil horizontal sin modificar el tamaño visual de la mazorca.
- Confirmar que las áreas ampliadas no se superpongan cuando dos mazorcas estén cercanas.

### 4.2. Corte cuidadoso

Es el minijuego con la implementación táctil más sólida de los cuatro.

Aspectos positivos:

- La composición de rama, tronco y mazorca ocupa el lienzo de forma controlada.
- El pedúnculo posee una zona táctil mayor que su representación visual.
- El círculo y la flecha ayudan a localizar el punto correcto sin depender únicamente del color.
- El botón de fuerza utiliza una zona circular ampliada.
- La carga se puede cancelar mediante `pointercancel`, `touchcancel` y pérdida de contacto.
- El control procesa correctamente una liberación aunque el dedo salga del botón.

Riesgo menor:

- La composición aprobada se ajusta exactamente al lienzo 16:9. Funcionará correctamente mientras el proyecto conserve el lienzo lógico 1920 × 1080.

Resultado:

- Apto para continuar a pruebas en celulares físicos.

### 4.3. Abrir mazorcas

La mecánica de deslizamiento está diseñada expresamente para interacción táctil.

Aspectos positivos:

- Las mazorcas pueden ocupar hasta el 24 % de la altura del lienzo.
- Las trayectorias y carriles se calculan mediante proporciones.
- La zona de colisión es una elipse ampliada alrededor de la mazorca.
- Un toque inmóvil no se interpreta como corte.
- Se procesa el último segmento de un gesto rápido.
- Se contempla `pointerupoutside`.
- Se contempla `pointercancel`.
- El inicio de un gesto sobre el HUD se ignora.
- La práctica interactiva permite aprender el gesto sin tiempo ni penalizaciones.

Riesgos menores:

- La validación visual de varias mazorcas simultáneas debe realizarse en celulares de poca altura.
- Es necesario confirmar en hardware real que tres trayectorias y sus efectos no provoquen caídas de rendimiento.

Resultado:

- Apto para pruebas móviles.

### 4.4. Clasificar semillas

La distribución general del nivel es proporcional:

- El tablero utiliza como máximo el 72 % de la altura lógica.
- Las canastas se ubican mediante porcentajes.
- Cada celda completa funciona como área táctil.
- Los movimientos rápidos interpolan las celdas atravesadas.
- Se gestionan `pointerupoutside` y `pointercancel`.

El principal riesgo es la densidad de la matriz 7×7.

Tamaño físico estimado de cada celda:

| Pantalla horizontal | Celda aproximada |
| --- | ---: |
| 568×320 | 31 px |
| 640×360 | 35 px |
| 844×390 | 38 px |
| 915×412 | 40 px |

Aunque la selección se realiza arrastrando y la interpolación facilita el gesto, una celda de 31 a 40 píxeles puede ser pequeña para:

- Niños con dificultades visuales.
- Niños con menor precisión motora.
- Selecciones cercanas a bombas.
- Trayectorias diagonales entre semillas de distinto tipo.

Recomendaciones para evaluar antes de modificar la lógica:

1. Probar la matriz actual en celulares de 320, 360, 390 y 412 píxeles de alto en horizontal.
2. Medir errores causados por tocar una celda vecina accidentalmente.
3. Considerar una configuración móvil con menos filas y columnas si las pruebas presentan errores frecuentes.
4. Si se mantiene 7×7, estudiar una ampliación del tablero o una tolerancia de selección que no provoque ambigüedad entre celdas vecinas.

Resultado:

- Funcional, pero condicionado a una prueba de usabilidad específica.

## 5. Problemas compartidos

### 5.1. Botones de resultados y pausa

Los botones de `ResultPanel` y `PanelPausa` se dibujan proporcionalmente, pero su altura física termina siendo pequeña después de aplicar `Phaser.Scale.FIT`.

Estimación:

| Pantalla | Botón de resultado | Botón del panel de pausa |
| --- | ---: | ---: |
| 568×320 | 25 px | 27 px |
| 640×360 | 28 px | 31 px |
| 844×390 | 30 px | 33 px |
| 915×412 | 32 px | 35 px |

Los botones son anchos, pero su altura es inferior a la deseable para un público infantil.

Este problema afecta a los cuatro minijuegos porque ambos paneles son compartidos.

Recomendación:

- Mantener el diseño visual actual y agregar a cada botón un área táctil transparente más alta, siguiendo el patrón de `BotonIconoHud`.
- Evitar agrandar innecesariamente la ventana; solo debe ampliarse la superficie interactiva.

### 5.2. Pausa y repetición de instrucciones

Estos botones tienen una implementación más adecuada porque su zona táctil es mayor que el icono visible.

Tamaño físico estimado del área táctil:

| Pantalla | Área aproximada |
| --- | ---: |
| 568×320 | 48×38 px |
| 640×360 | 54×43 px |
| 844×390 | 59×47 px |
| 915×412 | 62×49 px |

En pantallas de 320 píxeles de alto, la altura sigue siendo ligeramente reducida, aunque es considerablemente mejor que la de los botones de los paneles.

### 5.3. Notch y barras del navegador

El contenedor utiliza `100vw` y `100vh`, pero no se encontraron tratamientos explícitos para:

- `100dvh`.
- `env(safe-area-inset-left)`.
- `env(safe-area-inset-right)`.
- `visualViewport`.

Posibles consecuencias:

- El botón de pausa puede quedar cerca de un notch.
- El botón de repetir audio puede acercarse a la barra de navegación del sistema.
- Las barras móviles del navegador pueden alterar temporalmente el alto visible.

Recomendación:

- Definir una zona segura global para el HUD.
- Permitir que `HudMinijuego` reciba márgenes seguros y desplace los controles sin que cada escena duplique la lógica.

### 5.4. Cambio de orientación

El proyecto detecta orientación vertical y detiene el bucle. Esta es una buena protección.

Debe comprobarse en un dispositivo real:

- Girar el teléfono durante el tutorial.
- Girarlo mientras se mantiene presionado el control de fuerza.
- Girarlo durante un corte de “Abrir mazorcas”.
- Girarlo durante una trayectoria de semillas.
- Regresar a horizontal y confirmar que no se pierde tiempo, vida o interacción.

## 6. Verificaciones ejecutadas

### Pruebas automatizadas

Se ejecutó:

```bash
npm test
```

Resultado:

- 8 suites aprobadas.
- 0 pruebas fallidas.

Las pruebas actuales cubren principalmente:

- Bolsa de tipos de mazorcas.
- Clasificación de fuerza.
- Intersección de segmentos y elipses.
- Generación de matrices.
- Trayectorias de semillas.
- Progreso del módulo.

No existen pruebas automatizadas de:

- Dimensiones de pantalla.
- Superposición visual.
- Tamaños físicos de áreas táctiles.
- Notch o barras del navegador.
- Rotación durante una partida.
- Rendimiento WebGL en celulares.

### Compilación

Se intentó ejecutar:

```bash
npm run build
```

La compilación no finalizó porque la instalación actual no contiene el binding nativo de Rolldown para Linux. El error pertenece al entorno de dependencias y no identifica un fallo concreto de responsividad en las escenas.

Hasta resolver esa dependencia no se puede considerar completada la validación técnica del paquete de producción desde este entorno.

## 7. Prioridades recomendadas

### Prioridad alta

1. Ampliar las áreas táctiles de los botones de resultados y pausa.
2. Probar la matriz 7×7 en celulares pequeños con niños o usuarios representativos.

### Prioridad media

3. Incorporar márgenes seguros para notch y barras del sistema.
4. Ampliar horizontalmente las áreas táctiles de las mazorcas del primer minijuego.

### Validación obligatoria antes de producción

5. Probar los cuatro minijuegos en celulares horizontales con estas dimensiones aproximadas:

   - 568×320.
   - 640×360.
   - 844×390.
   - 915×412.

6. Probar al menos un navegador Android y Safari en iPhone.
7. Verificar pausa, repetición de audio, cambio de pestaña y rotación en cada minijuego.
8. Realizar la prueba con música, voces y efectos activos.
9. Confirmar que no existen errores en consola ni pérdidas de interacción táctil.

## 8. Dictamen final

El módulo de Cosecha no está limitado a PC. Su estructura utiliza escalado proporcional, controles táctiles y componentes reutilizables adecuados para celulares horizontales.

Los minijuegos “Corte cuidadoso” y “Abrir mazorcas” presentan la mejor adaptación táctil. “Mazorcas listas” requiere revisar el ancho físico de sus objetivos. “Clasificar semillas” necesita una prueba de usabilidad específica por la densidad de su matriz 7×7.

El estado actual puede considerarse **apto para iniciar pruebas móviles**, pero no todavía **certificado para producción móvil** hasta corregir o validar los riesgos indicados en este reporte.
