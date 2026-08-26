# Guía para probar Cocoa Adventure en Android

Cómo instalar y ejecutar el juego en un celular Android real durante el desarrollo, y cómo generar un APK para compartir.

Si prefieres un emulador en lugar de un celular físico, usa la [guía del emulador](guia_emulador_android.md) en su lugar.

## 1. Requisitos previos

- Haber completado la instalación del proyecto (`pnpm install`) descrita en el [README](../README.md).
- Tener instalado el [Android SDK](https://developer.android.com/studio) (basta con instalar Android Studio una vez; ya incluye el SDK y ADB).
- Crear `android/local.properties` apuntando a tu SDK. Este archivo es local de cada máquina (no se sube a Git), así que cada persona debe crear el suyo:

  ```properties
  sdk.dir=C:\\Users\\TU_USUARIO\\AppData\\Local\\Android\\Sdk
  ```

  Esa es la ruta típica en Windows si instalaste Android Studio con la configuración por defecto.

## 2. Instalar y verificar ADB

ADB viene incluido en el SDK, dentro de `platform-tools`. Agrega esa carpeta a tu variable de entorno `PATH`:

```
%LOCALAPPDATA%\Android\Sdk\platform-tools
```

Verifica que quedó disponible:

```bash
adb version
```

## 3. Conectar el celular

Activa primero las opciones de desarrollador: **Ajustes → Acerca del teléfono** → toca 7 veces sobre "Número de compilación". Luego elige **una** de las dos rutas.

### Opción A — Por cable USB

1. **Ajustes → Opciones de desarrollador** → activa **Depuración USB**.
2. Conecta el celular a la computadora con un cable USB.
3. En el celular aparecerá un aviso "¿Permitir depuración USB?" → acepta y marca "Confiar siempre en esta computadora".

### Opción B — Por WiFi (sin cable)

Requiere Android 11 o superior, y que el celular y la computadora estén en la **misma red WiFi**.

1. **Ajustes → Opciones de desarrollador** → activa **Depuración inalámbrica**.
2. Toca **Depuración inalámbrica → Vincular dispositivo con código de emparejamiento**.
3. El celular mostrará una IP:puerto y un código de 6 dígitos. En la computadora:

   ```bash
   adb pair IP:PUERTO_DE_EMPAREJAMIENTO
   ```

   Ingresa el código cuando lo pida.

4. Vuelve a la pantalla principal de "Depuración inalámbrica": ahí se muestra **otra** IP:puerto (distinta a la de emparejamiento), la de conexión. En la computadora:

   ```bash
   adb connect IP:PUERTO_DE_CONEXION
   ```

## 4. Verificar la conexión

```bash
adb devices
```

Debe listar tu celular con el estado `device`. Si dice `unauthorized`, revisa el celular: hay un aviso pendiente de aceptar. Si no aparece nada, revisa que la depuración esté activada y, en el caso de WiFi, que ambos estén en la misma red.

## 5. Probar la app en tu celular

```bash
pnpm dev:android
```

Compila el proyecto, lo sincroniza con el proyecto Android, instala una versión de depuración en el celular conectado y la abre automáticamente. Ejecuta este comando cada vez que quieras ver tus cambios reflejados en el celular.

## 6. Generar un APK para compartir

```bash
pnpm g:android
```

Compila una versión release y deja el archivo listo en la raíz del proyecto (la misma carpeta donde está este `package.json`), junto a `README.md`:

```
cocoaadventure/CocoaAdventure.apk
```

Ahí es donde debes ir a buscarlo para enviarlo a quien quieras (WhatsApp, Drive, etc.). A diferencia de `dev:android`, este comando **no** lo instala en tu celular, solo genera el archivo. La persona que lo reciba deberá permitir "Instalar apps de origen desconocido" para ese archivo en su celular.

### Diferencia entre los tres comandos

| Comando | Qué hace |
| --- | --- |
| `pnpm dev:android` | Compila, instala y abre la app en tu celular conectado (versión de depuración, para probar cambios rápido). |
| `pnpm pro:android` | Igual que `dev:android`, pero con una compilación de producción, en tu celular conectado. |
| `pnpm g:android` | Compila una versión release y genera `CocoaAdventure.apk` en la raíz del proyecto, sin instalarla, para compartirla. |

## 7. Actualizar el ícono de la app

El ícono que ves en el celular (todas las resoluciones de `android/app/src/main/res/mipmap-*`) se genera a partir de `public/logo.svg` con la herramienta oficial `@capacitor/assets` (ya instalada como dependencia de desarrollo). No se edita a mano.

Si el logo cambia, regenera el ícono así:

```bash
mkdir assets
cp public/logo.svg assets/logo.svg
npx capacitor-assets generate --android --iconBackgroundColor "#FFF1C6" --iconBackgroundColorDark "#FFF1C6"
rm -r assets
```

- La carpeta `assets/` es solo temporal: la herramienta la usa como entrada y no debe quedar en el repositorio (ya existe una sola fuente de verdad para el logo, en `public/logo.svg`).
- `--iconBackgroundColor` es el color de fondo detrás del logo en el ícono adaptativo; usa el mismo tono crema del resto de la interfaz salvo que el equipo decida cambiarlo.
- Este comando también genera pantallas de splash por defecto. El proyecto no las usa todavía, así que después de generar, revisa `git status` y descarta los archivos `splash.png` que aparezcan si no vas a implementarlas.
- Prueba el resultado con `pnpm dev:android` y revisa el ícono en la pantalla de inicio del celular.

## Problemas comunes

- **`adb devices` no muestra nada:** revisa que la depuración (USB o inalámbrica) esté activada y, si es por WiFi, que ambos dispositivos estén en la misma red.
- **El dispositivo aparece como `unauthorized`:** revisa el celular, hay un aviso pendiente de aceptar.
- **Error de Gradle sobre "SDK location not found":** falta crear `android/local.properties` apuntando a tu SDK (ver sección 1).
