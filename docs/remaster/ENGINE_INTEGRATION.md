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
| Compra y cola | `runAction()`, `payCosts()`, `postBuild()` | Fuera de alcance por ahora; los controles visuales de acción siguen deshabilitados. |
| Importar/exportar | `importGame()`/`exportGame()` | No se interceptan ni se cambia su codificación. |

## Feature flag y persistencia

`src/vars.js` inicializa dos claves aditivas dentro del sistema de ajustes
original:

```js
global.settings.visualRemaster = false;
global.settings.visualRemasterView = 'scene'; // 'scene' | 'classic'
```

La opción **Visual Remaster** está apagada por defecto y se enlaza con el Vue
existente de Settings en `src/index.js`. Al formar parte de `global.settings`,
se persiste mediante el mismo ciclo de guardado que el juego. No se añade un
formato de guardado alternativo, no se modifica la codificación UTF-16/Base64 y
las partidas antiguas que no contienen estas claves reciben los valores por
defecto al cargarse.

Esto es una extensión retrocompatible del objeto de settings, no una nueva
fuente de verdad del remaster. Con el flag apagado, `syncTownScene()` no crea
raíz DOM, listeners ni temporizadores.

## Punto de montaje y ciclo de vida

1. El juego llama a `drawCity()` desde su flujo habitual de Civilización.
2. La función termina de construir las tarjetas clásicas sin cambios.
3. Sólo entonces pasa `global` al adaptador `createGameTownSnapshot(global)`.
4. `syncTownScene()` monta una raíz hija de `#city` cuando el flag está activo.
5. La vista gráfica añade `visual-remaster-scene` a `#city` y oculta sólo sus
   tarjetas de ciudad; la vista clásica las vuelve a mostrar de inmediato.

El gestor `src/remaster/scene/town-scene-manager.js` limita las lecturas a una
vez por segundo, omite el documento oculto y destruye SVG, listener de
visibilidad, listener de clic y temporizador al apagar el flag, abandonar la
pestaña o perder su raíz. `TownScene.setSnapshot()` actualiza recursos, marcas
y panel de forma diferencial; no reconstruye el mapa salvo que cambie su
estructura visual.

## Acciones futuras

El prototipo conectado es intencionalmente de sólo lectura. Al activar compras
visuales se debe añadir un wrapper mínimo en `src/actions.js` que delegue la
intención hacia la ruta pública original:

```text
nodo visual -> wrapper de actions.js -> runAction(...) -> motor existente
```

No se debe invocar `actions.city[id].action()` directamente ni mutar la partida
desde el adaptador o los componentes.

## Contrato de estado

El contrato público `TownSnapshot` se documenta de forma completa en
[`TOWN_SNAPSHOT.md`](TOWN_SNAPSHOT.md). Lo produce
`src/remaster/adapters/game-town-adapter.js` a partir de una entrada explícita
y no conserva referencias al estado que recibe. La escena consume sólo ese DTO.

## Compatibilidad

- El game loop, balance, recursos, costes, tecnologías y resets no cambian.
- `drawCity()` continúa generando los paneles clásicos y éstos siguen siendo el
  fallback inmediato de la vista gráfica.
- `importGame()` y `exportGame()` permanecen sin modificaciones. Una partida
  anterior, sin los ajustes nuevos, abre con Visual Remaster desactivado; al
  activarlo se obtiene un snapshot de sólo lectura de esa misma partida.
- Los bundles y CSS generados siguen siendo productos de `npm run build-win`;
  sólo se editan fuentes JavaScript y LESS.
