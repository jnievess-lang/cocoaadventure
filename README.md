# Cocoa Adventure

Videojuego educativo construido con [Phaser 3](https://phaser.io/) y [Vite](https://vitejs.dev/).

## Requisitos previos

- [Node.js](https://nodejs.org/) 18 o superior.
- [pnpm](https://pnpm.io/) como gestor de paquetes.

### Instalar pnpm

Si no tienes pnpm instalado en tu computador, elige una de estas opciones:

**Usando npm (viene incluido con Node.js):**

```bash
npm install -g pnpm
```

**Usando Corepack (incluido con Node.js 16.13+):**

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

Verifica que quedó instalado correctamente:

```bash
pnpm --version
```

## Instalación del proyecto

1. Clona el repositorio y entra a la carpeta del proyecto.
2. Instala las dependencias:

   ```bash
   pnpm install
   ```

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

5. **Si los tests pasan**, sube tu rama y abre un **Pull Request (PR)** hacia `main`:

   ```bash
   git push origin tipo/nombre-descriptivo
   ```

   Al crear el PR se cargará automáticamente la [plantilla de Pull Request](.github/PULL_REQUEST_TEMPLATE.md). Complétala con la información solicitada.

6. **Espera la revisión.** El administrador del repositorio revisará el PR y hará el merge hacia `main` si todo está correcto. No hagas merge de tu propio PR salvo que se te indique lo contrario.

### Reglas rápidas

- No se trabaja directamente sobre `main`.
- No se abre un PR si los tests no pasan.
- Un PR debe resolver una sola tarea/feature/bug de forma clara.

## Documentación del proyecto

- [Plan y guía de recursos](docs/plan_guia.md): reglas para crear, reutilizar y organizar audios, imágenes y assets de minijuegos.
