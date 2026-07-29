# Integración con el motor de Evolve

## Límite de responsabilidad

El remaster es una proyección visual del motor existente. `global`, `actions.city`,
`runAction()`, `checkAffordable()`, `adjustCosts()`, los bucles de recursos y la
serialización siguen siendo la única autoridad de juego. Ningún módulo de
`src/remaster/` compra, calcula costes, cambia recursos ni importa `global`.

| Necesidad | Autoridad original | Uso actual del remaster |
| --- | --- | --- |
| Estado y guardado | `global`/`save` en `src/vars.js` | Se entrega al adaptador como entrada de sólo lectura. |
| Ciudad y requisitos | `actions.city`/`drawCity()` en `src/actions.js` | `drawCity()` conserva su render clásico y sincroniza la capa visual al final. |
| Recursos y progreso | `fastLoop`, `midLoop`, `longLoop`, `modRes()` | El snapshot lee valores ya calculados; no replica fórmulas. |
| Compra y cola | `runAction()`, `payCosts()`, `postBuild()` | `runVisualCityBuild()` delega en la misma ruta con una cantidad explícita; no recalcula costes ni requisitos. |
| Importar/exportar | `importGame()`/`exportGame()` | No se interceptan ni se cambia su codificación. |

## Feature flag y persistencia

El switch sigue apareciendo en Settings y usa su ciclo Vue original, pero su
preferencia de presentación se guarda fuera de la partida:

```js
localStorage['evolve.visual-remaster.preferences.v1'] = {
  version: 1,
  enabled: false,
  view: 'scene' // 'scene' | 'classic'
};
```

La opción **Visual Remaster** está apagada por defecto y se enlaza con el Vue
existente de Settings en `src/index.js`. No forma parte de `global.settings`:
por tanto no cambia el JSON, UTF-16/Base64, importación ni exportación de una
partida. Al arrancar, `migrateLegacyRemasterPreferences()` conserva una elección
de versiones previas y elimina esas dos claves aditivas antes del primer save o
export.

Es una preferencia de interfaz retrocompatible, no una fuente de verdad de
reglas. Con el flag apagado, `syncTownScene()` no crea raíz DOM, listeners ni
temporizadores.

## Punto de montaje y ciclo de vida

1. El juego llama a `drawCity()` desde su flujo habitual de Civilización.
2. La función termina de construir las tarjetas clásicas sin cambios.
3. Sólo entonces el puente de `actions.js` pasa el estado y lectores de
   presentación ya resueltos a `createGameTownSnapshot(global, reader)`.
4. `syncTownScene()` monta una raíz hija de `#city` cuando el flag está activo.
5. La vista gráfica añade `visual-remaster-scene` a `#city` y oculta sólo sus
   tarjetas de ciudad; la vista clásica las vuelve a mostrar de inmediato.

El gestor `src/remaster/scene/town-scene-manager.js` limita las lecturas a una
vez por segundo, omite el documento oculto y destruye SVG, listeners de clic,
visibilidad, foco y restauración de página, además del temporizador, al apagar
el flag, abandonar la pestaña o perder su raíz. El foco y `pageshow` vuelven a
sincronizar el estado como respaldo para restauraciones del navegador.
`TownScene.setSnapshot()` actualiza recursos, marcas y panel de forma
diferencial; no reconstruye el mapa salvo que cambie su estructura visual.

## Localizacion en caliente y selector de vista

`loc()` sigue siendo la unica funcion de traduccion. `setLocale()` recarga el
paquete original y emite `evolve:localechange`; el gestor reetiqueta el selector
y pide un snapshot actualizado sin recargar ni reiniciar el motor. El contrato
conserva ids estables para acciones, edificios, recursos y distritos; las
cadenas de interfaz se resuelven al renderizar o mediante lectores originales.

El selector se inserta como primer hijo de `#city`. Es el lugar menos invasivo:
`drawCity()` ya reconstruye ese contenedor, no se altera la navegacion global y
el control permanece visible en ambas vistas. Sus botones usan claves
localizadas, `aria-pressed` y la preferencia versionada externa al save. Fuera
de la pestana de ciudad el selector no se monta; la UI clasica es el fallback
de las etapas no soportadas.

## Acciones delegadas

Los controles visuales reciben un `GameActionBridge` inmutable. Sus wrappers
mínimos de `src/actions.js` delegan la intención hacia la ruta original:

```text
nodo visual -> wrapper de actions.js -> runAction(...) -> motor existente
```

También se reutilizan `setActionPower()` y `changeJobWorkers()` para energía y
trabajadores. Las cantidades visuales respetan la tecla de cola activa de
`runAction()`; no se fuerza una semántica paralela. No se invoca
`actions.city[id].action()` directamente desde la escena ni se muta la partida
desde el adaptador o los componentes. El detalle, los recursos faltantes y la
lista de costes se preparan con los renderizadores y comprobaciones del motor
antes de cruzar la frontera `TownSnapshot`.

## Contrato de estado

El contrato público `TownSnapshot` se documenta de forma completa en
[`TOWN_SNAPSHOT.md`](TOWN_SNAPSHOT.md). Lo produce
`src/remaster/adapters/game-town-adapter.js` a partir de una entrada explícita
y no conserva referencias al estado que recibe. La escena consume sólo ese DTO.

Para los edificios visuales, `drawCity()` entrega al adaptador un callback fino
que consulta el título, requisitos, calificaciones y asequibilidad mediante las
funciones originales. El DTO resultante contiene sólo sus respuestas ya
resueltas en `visualBuildings`; el registro y los componentes de
`src/remaster/` no importan el estado del motor. Véase
[`BUILDING_VISUALS.md`](BUILDING_VISUALS.md).

## Compatibilidad

- El game loop, balance, recursos, costes, tecnologías y resets no cambian.
- `drawCity()` continúa generando los paneles clásicos y éstos siguen siendo el
  fallback inmediato de la vista gráfica.
- `importGame()` y `exportGame()` permanecen sin modificaciones. Una partida
  anterior, sin los ajustes nuevos, abre con Visual Remaster desactivado; al
  activarlo se obtiene un snapshot de sólo lectura de esa misma partida.
- Los bundles y CSS generados siguen siendo productos de `npm run build-win`;
  sólo se editan fuentes JavaScript y LESS.
