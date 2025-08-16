# Generador de Exámenes (TypeScript + Vite)

Esta es la nueva versión de “Generador de Exámenes”, reescrita completamente en TypeScript con Vite, sin Python ni Pyodide y sin CDNs (todas las dependencias se instalan vía npm).

Características conservadas:
- Lee el archivo `.txt` con el mismo formato original (cabecera opcional, `@@@@`, preguntas separadas por línea en blanco, `+++p`, expresiones `@@ expr @@`).
- Genera exámenes aleatorios con las mismas reglas que la versión Python.
- Exporta a:
  - Texto para imprimir (papel)
  - XML de Moodle (importable)
- Misma interfaz y flujo de uso (PicoCSS desde npm).

## Uso (desarrollo)

Requisitos: Node.js 18+

```bash
npm install
npm run dev
```

Abre el navegador en la URL que muestre Vite (por defecto http://localhost:5173). Carga tu `examen.txt`, elige formato y descarga.

## Build y despliegue en GitHub Pages

```bash
npm run build
```

Esto genera la carpeta `dist/` lista para publicar. Para GitHub Pages en el repositorio `jorgebg/generador-examenes`:
- Asegúrate de que `vite.config.ts` tiene `base: '/generador-examenes/'`.
- Publica el contenido de `dist/` en la rama configurada para Pages (por ejemplo, `gh-pages`).

Una receta típica con `gh-pages` (opcional):
```bash
npm i -D gh-pages
npm run build
npx gh-pages -d dist
```

## Tests

Se incluyen pruebas con Vitest para el parser, el redondeo y los generadores:
```bash
npm test
```

## Estructura del código

- `src/types.ts`: Tipos e interfaces de dominio.
- `src/parser.ts`: Parseo del archivo de entrada (cabecera, preguntas y multilínea).
- `src/eval.ts`: 
  - Evaluación de expresiones `@@ expr @@` para “papel” con 3 cifras significativas (mismo algoritmo que Python).
  - Transformación a formato `{= ... }` y `{var}` para Moodle.
  - Generación de datasets para Moodle.
- `src/rng.ts`: Generador de números aleatorios con semilla y `shuffle`.
- `src/paper.ts`: Lógica de generación del examen en texto (barajado y clave).
- `src/moodle.ts`: Generación del XML de Moodle (tipos, fracciones negativas, datasets, CDATA, etc.).
- `src/main.ts`: Lógica de UI y descarga de archivos. Importa PicoCSS desde npm.

## Notas de Migración (desde Python + Pyodide)

- Eliminado Python y Pyodide. Toda la lógica se ha portado a TypeScript ejecutándose nativamente en el navegador.
- Eliminados los CDNs. PicoCSS ahora se instala desde npm y se importa en `src/main.ts`.
- Se conserva el formato del archivo de entrada y las reglas:
  - Cabecera separada por `\n@@@@\n\n`.
  - Variables: `entero`, `real`, `lista`.
  - Para “papel”: se asigna un único valor a cada variable para todo el examen. Se sustituyen expresiones `@@ expr @@` evaluando con esas variables y se redondea a 3 cifras significativas como en la versión Python.
  - Las preguntas y respuestas se barajan. La primera respuesta listada en el archivo es la correcta.
  - Para Moodle: no se evalúan los valores en el texto; se sustituyen por `{= ... }` con `{var}` y se generan datasets con 10 valores por variable (para listas se repiten hasta alcanzar longitud suficiente). Penalización de respuestas incorrectas `-100/(n-1)` redondeada a 5 decimales, como en Python.
- El HTML mantiene la misma estructura visual con PicoCSS.

## Licencia y créditos

Se respetan los créditos y el espíritu del proyecto original. Véase el README histórico y los artículos enlazados en la web original.
