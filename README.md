# Cocoa Adventure

Videojuego educativo construido con [Phaser 3](https://phaser.io/) y [Vite](https://vitejs.dev/).

## Requisitos previos

- [Node.js](https://nodejs.org/) 18 o superior, que incluye `npm`.
- [pnpm](https://pnpm.io/) como gestor de paquetes.

### Verificar e instalar Node.js, npm y pnpm

Primero verifica si ya tienes las herramientas instaladas:

```bash
node --version
npm --version
pnpm --version
```

**SI NO TIENES NPM, DEBES INSTALAR NODE.JS 18 O SUPERIOR** en tu computadora desde [Node.js](https://nodejs.org/). Luego cierra y vuelve a abrir la terminal y verifica nuevamente:

```bash
node --version
npm --version
```

**DEBES INSTALAR PNPM** para poder instalar las dependencias y ejecutar el proyecto. Si `pnpm --version` no funciona, instálalo usando `npm`:

```bash
npm install --global pnpm
```

Después de instalar pnpm, verifica nuevamente que esté disponible:

```bash
pnpm --version
```

## Instalación del proyecto

1. Clona el repositorio y entra a la carpeta del proyecto.
2. **Instala las dependencias antes de ejecutar el proyecto:**

   ```bash
   pnpm install
   ```

   Este paso es obligatorio y debe ejecutarse antes de `pnpm dev`.

## Ejecutar el proyecto

- **Modo desarrollo** (levanta el servidor local con recarga en caliente):

  ```bash
  pnpm dev
  ```

- **Compilar para producción:**

  ```bash
  pnpm build
  ```

- **Previsualizar el build de producción:**

  ```bash
  pnpm preview
  ```

## Flujo de trabajo del equipo

Para mantener el proyecto organizado y evitar romper la rama principal (`main`), sigue estos pasos:

1. **Crea tu propia rama** antes de empezar a trabajar. Si aún no tienes una, créala desde `main` actualizado:

   ```bash
   git checkout main
   git pull
   git checkout -b tipo/nombre-descriptivo
   ```

   Ejemplos de nombres de rama: `feature/minijuego-siembra`, `fix/bug-progreso`, `docs/actualizar-readme`.

   **Tipos de rama:**

   | Prefijo | Uso |
   | --- | --- |
   | `feature/` | Nueva funcionalidad o contenido (ej. un minijuego, una escena nueva). |
   | `fix/` | Corrección de un bug o comportamiento incorrecto. |
   | `docs/` | Cambios solo de documentación (README, comentarios, guías). |
   | `refactor/` | Reestructuración de código existente sin cambiar su comportamiento. |
   | `test/` | Creación o ajuste de tests, sin tocar lógica de producción. |
   | `chore/` | Tareas de mantenimiento (dependencias, configuración, scripts). |

2. **Trabaja en tu rama** y haz commits pequeños y descriptivos.

3. **Crea o actualiza los tests** correspondientes a tu cambio. Ningún cambio debe subirse sin haber sido probado.

4. **Ejecuta los tests localmente** y verifica que todos pasen antes de continuar.

5. **Revisa los cambios y prepáralos para el commit:**

   ```bash
   git status
   git add .
   ```

6. **Crea un commit con un mensaje descriptivo:**

   ```bash
   git commit -m "tipo: descripcion breve del cambio"
   ```

   Ejemplo:

   ```bash
   git commit -m "docs: actualizar instrucciones de instalacion"
   ```

   Repite `git add .` y `git commit` cada vez que tengas un grupo de cambios relacionados.

7. **Si los tests pasan, sube tu rama al repositorio remoto:**

   ```bash
   git push -u origin tipo/nombre-descriptivo
   ```

8. **Abre un Pull Request (PR)** desde tu rama hacia `main`. Al crear el PR se cargará automáticamente la [plantilla de Pull Request](.github/PULL_REQUEST_TEMPLATE.md). Complétala con la información solicitada.

9. **Espera la revisión.** El administrador del repositorio revisará el PR y hará el merge hacia `main` si todo está correcto. No hagas merge de tu propio PR salvo que se te indique lo contrario.

### Reglas rápidas

- No se trabaja directamente sobre `main`.
- No se abre un PR si los tests no pasan.
- Un PR debe resolver una sola tarea/feature/bug de forma clara.

## Documentación del proyecto

- [Plan y guía de recursos](docs/plan_guia.md): reglas para crear, reutilizar y organizar audios, imágenes y assets de minijuegos.
