# Auditoría de integración jugable

> Fecha: 2026-07-29. Alcance: rama actual `remaster/playable-visual-overhaul`,
> comparada contra `master`. Esta auditoría precede deliberadamente cualquier
> refactor de la integración.

## Evidencia revisada

- `git status --short`, `git log --oneline --decorate -15` y
  `git diff --stat master...HEAD`.
- Todo `src/remaster/`, `AGENTS.md` y `docs/remaster/`.
- Fuentes de autoridad: `src/actions.js`, `src/jobs.js`, `src/resources.js`,
  `src/functions.js`, `src/main.js`, `src/index.js` y `src/vars.js`.
- Búsquedas estáticas de `global`, imports mock, textos/valores de recursos y
  creación/limpieza de listeners y temporizadores.

## Resultado de frontera

No hay acceso directo a `global` dentro de `src/remaster/`. El único cruce
actual es `src/actions.js`, que pasa el estado y callbacks a
`createGameTownSnapshot()`. Los componentes sólo reciben `TownSnapshot` y
comandos inyectados. No se encontraron fórmulas de coste ni de producción
copiadas en el remaster.

La escena sí contiene datos de demostración explícitos en
`config/town-map.js`; sólo `demo.js` los importa. Aún falta una comprobación de
build que haga fallar si ese módulo llega al bundle de producción.

## Hallazgos y plan de corrección

| Problema | Archivo actual | Estado actual | Fuente de verdad real | Cambio previsto | Riesgo |
| --- | --- | --- | --- | --- | --- |
| Snapshot de recursos incompleto y con formato propio | `adapters/game-town-adapter.js` | Filtra `display`, usa `toLocaleString`, una paleta cíclica y sólo entrega `amount`, `max`, `diff`. | `resources.js:loadResource()` define nombre, orden, `display`, `max`, `diff`, `trade`, `bar`; `vars.js:sizeApproximation` y la UI clásica formatean valores. | Pasar un lector de presentación del puente de motor; exponer orden, visibilidad, precisión/formato, tendencia y datos de intercambio ya existentes. Eliminar el formateo/paleta que pretendan ser datos del juego. | Bajo: sólo DTO y HUD; ninguna mutación. |
| Textos no localizados o ficticios en producción | `game-town-adapter.js`, `town-panel.js`, `town-scene.js`, `town-scene-manager.js`, `town-layout.js` | Cabeceras, estados, botones, resúmenes y tooltips están escritos en español; `humanizeId()` fabrica nombres de respaldo. | `locale.js:loc()`, nombres de recurso ya resueltos por `resources.js`, título/descripción/efecto de `actions.city`. | El puente entregará todas las cadenas de juego disponibles y un pequeño diccionario visual localizado mediante `loc()` para la semántica exclusiva del remaster. Los componentes no concatenarán mensajes de juego. | Medio: comprobar todos los idiomas y fallback de cadenas nuevas. |
| Datos de edificio insuficientes | `game-town-adapter.js`, `actions.js:getCityVisualBuildingDetail()` | Incluye contador, `on`, asequibilidad, texto de coste renderizado, efecto, energía puntual, empleo y cola; no expone bloqueo/estado explícito, identificadores de coste, límites ni resumen completo de energía. | `actions.city`, `checkCityRequirements`, `checkTechQualifications`, `actionDesc`, `checkAffordable`, `global.city.power`, `global.city.power_total`, `global.queue`. | Ampliar el lector de edificio de `actions.js` sin cálculos nuevos: estado resuelto, costes del renderizador original, datos de cola y energía que ya calcula el motor. | Medio: `actionDesc()` crea DOM temporal; mantenerlo aislado y limpiar. |
| Estado global de civilización parcial | `game-town-adapter.js` | Especie, bioma, clima, población, trabajos, edificios, tecnología, energía, moral y gobierno son parciales; no hay etapa/era, ocupación/disponibilidad ni producción presentada por el motor. | `global.race`, `global.city`, `global.civic`, `global.tech`, `main.js` y los renderizadores clásicos. | Expresar sólo valores existentes en un contrato inmutable; representar como ausente lo que el motor no publica, nunca derivarlo con una fórmula visual. | Bajo. |
| Preferencia del remaster modifica el objeto serializado de partida | `vars.js`, `index.js`, `actions.js` | `visualRemaster` y `visualRemasterView` se añaden a `global.settings`, por lo que aparecen en import/export. Esto contradice la regla de `AGENTS.md` de usar una clave versionada separada. | `vars.js:save` es el `localStorage` original; import/export serializan todo `global`. | Migrar las preferencias visuales a una clave de `localStorage` propia, versionada y retrocompatible; el switch de Settings seguirá usando el controlador del juego, pero no alterará `evolved`. | Medio: migrar valores existentes y conservar partida importada. |
| Puente de acciones limitado y con regla visual duplicada | `actions.js`, `jobs.js` | Construye, conmuta energía y mueve trabajadores. `setVisualCityWorkers()` bloquea explícitamente `garrison`, y `runVisualCityBuild()` fuerza cola desactivada. | Tarjetas clásicas usan `runAction()`, `setActionPower()` y `changeJobWorkers()`; `runAction()` ya conoce multiplicadores y cola. | Definir `GameActionBridge` con capacidades reales. Validar capacidad en el puente usando la misma información que la tarjeta clásica; dejar operaciones no soportadas como navegación a su panel clásico, no simulaciones. | Medio: preservar teclas/modificadores, cola y foco. |
| Snapshot no es inmutable | `game-town-adapter.js` | Devuelve objetos nuevos pero mutables. | El estado del motor es autoridad y no debe poder mutarlo la UI. | Congelar en profundidad el DTO al salir del adaptador. | Bajo: los componentes ya sólo leen. |
| Harness de paridad no ejecuta el motor | `adapters/town-action-parity-harness.js` | Compara dos snapshots entregados desde fuera; no carga el mismo save ni dispara controles clásicos. | `window.importGame`, `window.exportGame`, controles de ciudad y wrappers de acción existentes. | Añadir harness de navegador/manual reproducible que exporte/importa copias y compare los campos autoritativos después de cada acción. Mantener el comparador puro como utilidad. | Medio: no hay fixture de Civilización sanitizado en el repositorio. |
| Mocks no protegidos por la compilación | `config/town-map.js`, `demo.js`, `buildEvolve*.js` | La demo tiene una entrada separada, pero el build no inspecciona las entradas del bundle `main`. | Metafile de esbuild. | Añadir validación de metafile que rechace `town-map.js` y `demo.js` en `evolve/main.js`; permitirlos sólo en `remaster-demo.js`. | Bajo. |
| Ids de edificios declarados en la composición visual | `config/building-visual-registry.js`, `config/town-layout.js` | Los catorce ids de ciudad y los diez distritos son un mapa estático de presentación; no son estado ni costes simulados. | Claves de `actions.city` y títulos originales resueltos por el lector. | Mantener el registro declarativo, validar los ids contra `actions.city` desde el integrador y llevar nombre, bloqueo, coste y conteo por snapshot. | Bajo: la composición puede requerir ampliación al aparecer un edificio de ciudad sin arte. |
| Barra de recursos truncada | `town-scene.js` | Renderiza como máximo seis recursos y no informa icono, aviso de lleno/agotar ni recursos que bloquean el edificio seleccionado. | Orden y datos de recursos de `resources.js`; filas de `actionDesc()` para costes actuales. | Renderizar todos los recursos visibles en su orden, con ficha accesible, nombre, cantidad/capacidad, tendencia, tooltip y estado de advertencia ya resuelto por el puente. Mostrar los costes bloqueantes del edificio seleccionado. | Medio: densidad en móvil; requerirá overflow accesible. |
| Ciclo de vida principal limpio, limpieza de demo no verificable | `town-scene.js`, `town-scene-manager.js`, `demo.js` | Manager limpia intervalo y listeners; la demo usa un listener `{ once: true }` anónimo. | DOM y `window` del navegador. | Mantener el manager; convertir el listener de demo en referencia limpiable o aislarlo en la entrada de demo. | Bajo. |

## Temporizadores y bucles

La escena no crea un game loop ni usa `requestAnimationFrame`. El único
temporizador productivo es el muestreo de `TownSceneManager` cada 1000 ms; se
detiene al cambiar a clásico, desactivar el flag, ocultar/desmontar la escena o
perder el host. Las animaciones son CSS y se pausan/simplifican para pestaña
oculta, `prefers-reduced-motion` y equipos modestos.

## Correcciones aplicadas tras la auditoría

- `TownSnapshot` pasó a contrato 4 y se congela en profundidad. Su lector de
  motor entrega recursos en el orden de la UI original, textos de `loc()`,
  trabajo/descripciones del módulo de empleos, tecnologías, energía agregada,
  bloqueo, costes, cola y recursos faltantes ya resueltos.
- `GameActionBridge` es la única superficie de intención de los componentes.
  Construcción conserva la semántica de cola de `runAction()`; energía y
  trabajadores reutilizan sus funciones originales. La vuelta a la vista
  clásica no toca la partida.
- Las preferencias se movieron a
  `evolve.visual-remaster.preferences.v1`. La migración elimina las claves
  históricas de `settings` antes de guardar o exportar.
- `buildRemasterValidation.js` inspecciona el metafile de esbuild y rechaza que
  `town-map.js` o `demo.js` entren en `evolve/main.js`.
- La barra ya no se limita a seis recursos: muestra todos los visibles, su
  monograma SVG/CSS propio, tooltip, tendencia, alerta y los requisitos del
  edificio seleccionado. No se añadió ninguna fórmula de juego.
- Las estructuras construidas que no pertenecen al registro visual conservan
  ahora también su título real de `actions.city`; el registro sólo decide qué
  estructuras obtienen arte de distrito.
- El listener de `pagehide` de la demo conserva una referencia explícita y se
  retira al destruir la escena.
- La revisión visual de 390×844 detectó texto de cabecera que podía exceder el
  ancho de la demo; el LESS ahora permite romper esas cadenas y reduce sólo la
  escala tipográfica de la cabecera móvil. No afecta al snapshot ni al motor.

## Protocolo de paridad reproducible

Usar una partida de Civilización sanitizada y dos perfiles de navegador:

1. Importar exactamente el mismo export en ambos perfiles; dejar el remaster
   apagado en uno y activarlo en el otro.
2. Para cada edificio de la lista, ejecutar una sola acción gráfica y la misma
   acción clásica: construir 1, construir 5, construir 10 cuando esté
   disponible; después encender/apagar o mover un trabajador si la tarjeta
   clásica ofrece ese control.
3. Tras cada operación, capturar el snapshot con
   `captureTownActionParityState()` y la partida decodificada con
   `captureTownSaveParityState()`; comparar ambos resultados con
   `compareTownActionParity()`.
4. Verificar además que `window.exportGame()` no contiene
   `settings.visualRemaster` ni `settings.visualRemasterView`.

`npm run test-remaster` verifica de forma automatizada el contrato puro: la
migración de preferencias no deja campos en el objeto serializable, el puente
delegado no contiene acciones propias, el reductor de paridad compara los
campos autoritativos y el guard de esbuild rechaza un import mock. La ejecución
de acciones contra dos partidas de Civilización sigue siendo una prueba de
navegador manual, porque el repositorio no contiene un save de Civilización
sanitizado ni un corredor de navegador.

Edificios obligatorios: `basic_housing`, `farm`, `lumber_yard`, `rock_quarry`,
`mine`, `library`, `university`, `temple`, `foundry`, `factory`, `coal_power`,
`oil_power` y `fission_power`. `garrison` no se asigna por el control genérico
de empleos porque su interfaz original usa controles militares propios.

## Criterio de salida de esta entrega

1. El bundle principal no puede importar datos mock.
2. `TownSnapshot` es inmutable, documentado y sólo contiene datos derivados de
   autoridades existentes.
3. Todas las acciones gráficas disponibles atraviesan el puente original y se
   vuelven a leer desde el motor inmediatamente.
4. Una operación de ciudad en dos copias de la misma partida deja iguales
   recursos, edificios, energía, trabajadores y save exportado.
5. La preferencia visual no cambia el formato de una partida importada o
   exportada.
