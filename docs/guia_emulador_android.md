# Probar Cocoa Adventure en un emulador de Android

Alternativa a la [guía de pruebas en un celular físico](guia_pruebas_android.md) para quien prefiera no usar ADB con un dispositivo real: un emulador de Android Studio se conecta y se usa exactamente igual una vez que está corriendo.

## 1. Instalar Android Studio

Descárgalo desde [developer.android.com/studio](https://developer.android.com/studio) e instálalo. Incluye el Android SDK, ADB y el emulador, así que no necesitas instalar nada aparte.

## 2. Crear un dispositivo virtual (AVD)

1. Abre Android Studio → **More Actions** (o el ícono de engranaje en la pantalla de bienvenida) → **Virtual Device Manager**.
2. **Create Device** → elige un modelo de celular (por ejemplo, Pixel 7) → **Next**.
3. Elige una imagen del sistema (recomendado: la más reciente con Google Play) → descárgala si hace falta → **Next** → **Finish**.
4. Inicia el emulador desde el ícono ▶ en el Device Manager y espera a que arranque por completo.

## 3. Verificar que se detecta

Con el emulador abierto y arrancado:

```bash
adb devices
```

Debe aparecer como `emulator-5554` (o similar) con estado `device`.

## 4. Probar la app

Con el emulador corriendo y detectado por `adb devices`, usa el mismo comando de la guía principal:

```bash
pnpm dev:android
```

Esto instala y abre la app dentro del emulador, igual que en un celular físico.

## Nota sobre `local.properties`

Android Studio configura automáticamente la ruta del SDK en `android/local.properties`. Si ese archivo no existe todavía, revisa la sección de requisitos previos de la [guía principal](guia_pruebas_android.md).
