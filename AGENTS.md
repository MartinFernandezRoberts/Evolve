# Guía para agentes y contribuidores

## Propósito del fork

Este repositorio es un fork no oficial de `pmotschmann/Evolve`, bajo MPL-2.0. El objetivo del remaster visual es presentar Evolve Idle como un pueblo interactivo sin alterar el juego original. Se conservan `LICENSE`, las cabeceras y avisos MPL-2.0 existentes, y cualquier archivo derivado mantiene sus obligaciones de licencia.

## Límites innegociables

- Conservar mecánicas, fórmulas, balance, progresión, tecnologías, especies, recursos, eventos, desafíos, resets, tiempo offline, localización y compatibilidad de guardados.
- No reescribir el motor ni migrar el proyecto completo a React, TypeScript u otro framework.
- No duplicar fórmulas del motor en la interfaz visual ni escribir directamente en `global` cuando exista una acción del juego que haga la operación.
- No cambiar el esquema del guardado `evolved`. Las preferencias exclusivas del remaster deben vivir en una clave de `localStorage` separada y versionada.
- No editar `evolve/main.js`, `evolve/evolve.css`, `wiki/wiki.js`, `wiki/wiki.css` u otros artefactos generados/minificados. Editar sus fuentes en `src/` y reconstruirlos.
- Mantener disponible y funcional la interfaz clásica. Todo el remaster queda detrás de un feature flag apagado por defecto.
- Consumir el estado mediante un adaptador; los clics visuales deben delegar a las acciones originales, incluidas sus rutas de cola y multiplicadores.
- Mantener el acoplamiento con `src/main.js` al mínimo y no añadir dependencias gráficas grandes sin una decisión documentada.

## Arte y propiedad intelectual

- Crear únicamente assets originales, placeholders propios, CSS, SVG o imágenes generadas específicamente para este proyecto.
- La referencia permitida es el lenguaje visual general de aventuras de consola de 16 bits con fondos prerenderizados de los años 90: dioramas, volumen pintado, caminos sinuosos, vegetación y paleta saturada.
- No copiar ni recrear personajes, sprites, mapas, logotipos, nombres, música, efectos ni otros assets de Donkey Kong Country, Nintendo o terceros. No recrear mapas existentes.

## Flujo de desarrollo

- Localizar primero la fuente de verdad del motor y reutilizar sus exports públicos. Documentar cualquier pequeño wrapper de integración antes de introducirlo.
- Para UI existente usar módulos JavaScript fuente y `src/evolve.less`; no introducir una segunda fuente de reglas de juego.
- Mantener cada cambio pequeño, reversible y aislado por feature flag. No mezclar refactors amplios con trabajo visual.
- Antes de editar, revisar `git status`; preservar cambios ajenos en un árbol de trabajo sucio.

## Comandos

```powershell
npm ci
npm run build-win
npm run build-debug-win
npm run serve
```

`npm run build-win` genera el bundle del juego y wiki, y compila LESS con los comandos compatibles con Windows. En sistemas POSIX se puede usar `npm run build`.

## Criterios de calidad

- El build de Windows debe terminar correctamente.
- La UI clásica debe seguir cargando con el flag apagado.
- Con el flag encendido, los datos mostrados deben venir de estado/funciones originales y las acciones deben seguir la ruta original de compra, cola, costes, requisitos y postprocesado.
- Probar al menos partida nueva, partida cargada, importación/exportación, pausa/tiempo acelerado, cambio de idioma y una transición de tecnología que redibuje la ciudad.
- No introducir cambios intencionales en archivos generados, minificados, `LICENSE` ni guardados de ejemplo.
- Añadir pruebas automatizadas cuando exista una superficie comprobable; mientras tanto, documentar las comprobaciones manuales reproducibles.

## Política de commits

- Un commit debe representar un propósito único y usar Conventional Commits cuando sea posible (por ejemplo, `docs:`, `feat:`, `fix:`).
- No incluir artefactos generados ni cambios ajenos. Revisar `git diff --check`, `git status --short` y el diff antes de confirmar.
- No hacer push, crear releases ni publicar assets sin autorización explícita.
- Los commits que toquen motor, persistencia, fórmulas o acciones requieren una justificación de compatibilidad y una prueba de regresión documentada.
