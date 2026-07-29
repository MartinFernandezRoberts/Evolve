# Integración con el motor de Evolve

## Mapa de responsabilidades actual

| Necesidad | Fuente actual | Integración del remaster |
| --- | --- | --- |
| Estado persistente | `global` y `save` en `src/vars.js` | Sólo lectura a través del adaptador; no ampliar el save `evolved`. |
| Catálogo de ciudad | `actions.city` en `src/actions.js` | Enumerar acciones existentes, ids y metadatos. |
| Visibilidad/requisitos | `checkCityRequirements()` y `checkTechQualifications()` | Delegar al motor; no copiar condiciones de tecnología, raza o path. |
| Coste ajustado | `adjustCosts()` y funciones `cost` de la acción | Invocar las funciones originales. |
| Asequibilidad | `checkAffordable()`, `checkCosts()` y `checkMaxCosts()` | Usar su resultado para badges y accesibilidad. |
| Compra/cola | `runAction()`, acción concreta, `payCosts()`, `postBuild()` | Exponer un wrapper fino de `runAction`; no llamar `action()` desde la escena. |
| Estructuras | `incrementStruct()`/`initStruct()` y acciones ciudad | Efectos sólo mediante la acción original. |
| Recursos | `fastLoop`/`midLoop`/`longLoop` y `modRes()` | Mostrar snapshot, sin cálculos paralelos. |
| Render clásico | `drawCity()` + `addAction()`/`setAction()` | Mantenerlo intacto y montar la raíz visual en paralelo/alternativa. |
| Ajustes | `global.settings` y Vue en `mainVue()` | Guardar sólo la preferencia visual fuera de `evolved`. |
| Importar/exportar | `window.exportGame()`/`window.importGame()` en `src/functions.js` | No interceptar ni modificar formatos. |

## Arranque y render

1. `index.html` carga `evolve/main.js`, bundle de `src/main.js`.
2. `src/vars.js` lee `localStorage.evolved`, lo descomprime desde UTF-16 y aplica migraciones de datos existentes.
3. `src/main.js` arma la interfaz mediante `index()`, crea `mainVue()`, define recursos/trabajos e inicializa tabs.
4. `loadTab()` de `src/index.js` crea el tab de Civilización y llama `drawCity()` cuando corresponde.
5. `drawCity()` elimina y crea tarjetas en `#city` desde `actions.city`.

El futuro controlador de escena debe montarse desde el paso 5 únicamente si `evolve.remaster.ui.v1.enabled` es verdadero. Debe destruirse al desaparecer `#city` y no dejar listeners globales ni timers vivos.

## Ruta de una compra

```text
nodo visual
  -> adapter.dispatchCityAction(id)
  -> wrapper público en actions.js
  -> runAction(actions.city[id], 'city', id)
  -> acción original: payCosts(), incrementStruct(), efectos
  -> postBuild(), colas y drawCity() originales
  -> snapshot nuevo para la escena
```

Esta ruta es un requisito. Invocar `actions.city[id].action()` directamente perdería parte de la semántica de multiplicadores, colas y postprocesado que ya implementa `runAction()`.

## Contrato sugerido del adaptador

Los nombres son orientativos; se implementarán sólo al comenzar la fase 1.

```js
const snapshot = civilizationAdapter.readSnapshot();
// { resources, population, biome, calendar, buildings, activeTab }

civilizationAdapter.getBuilding(id);
// { id, title, description, effect, count, category, powered, affordable, maxAffordable, costs }

civilizationAdapter.dispatchCityAction(id);
// Delega al wrapper original; no escribe global directamente.
```

`readSnapshot()` puede normalizar datos, pero no debe contener fórmulas de producción, coste, población, requisitos ni balance. Toda cadena de texto debe salir de `loc()` o de la acción original para conservar localización.

## Ciclo de juego, recursos y guardado

- `gameLoop('start')` configura el Web Worker con el período calculado por `loopTimers()`.
- El worker manda `periods` al hilo principal; `execGameLoops()` ejecuta `fastLoop()`, `midLoop()` y `longLoop()` en su cadencia actual.
- `modRes()` limita, rastrea y acumula cambios de recursos; el motor también tiene actualizaciones especializadas que la escena no debe reproducir.
- `longLoop()` actualiza `global.stats.current` y guarda `global` comprimido en `localStorage.evolved`, salvo excepciones ya existentes.
- `exportGame()` codifica el estado actual en Base64; `importGame()` valida el mínimo esperado, escribe el formato UTF-16 existente y recarga la página.

La escena no añade ticks de mecánica. Su refresco es de presentación y puede pausarse cuando no esté montada u oculta.

## Ajustes y feature flag

La configuración actual está en `global.settings`, enlazada en `mainVue()` y persistida junto con toda la partida. Para no cambiar su esquema ni contaminar exportaciones, el remaster usará una pequeña preferencia externa, por ejemplo:

```json
{ "version": 1, "enabled": false, "reducedMotion": "system" }
```

en la clave `evolve.remaster.ui.v1` de `localStorage`. La ausencia, error de lectura o versión desconocida equivale a `enabled: false`. El selector de modo debe ser usable desde la UI clásica y no debe modificar el estado del juego.

## Cambios de fuente previsibles

- `src/actions.js`: wrapper público mínimo para despachar la acción existente y punto de montaje/invalidez visual de `drawCity()`.
- `src/index.js`: control de preferencia visual en ajustes, sin tocar `global.settings`.
- `src/evolve.less`: estilos fuente de escena, toggle y fallbacks responsive.
- Nuevos módulos `src/remaster/`: configuración, adaptador, controlador, componentes SVG y manifest de assets.
- Posiblemente `buildEvolve.js` sólo si la estrategia de assets exige una copia explícita; no se justifica todavía.

No modificar directamente los bundles ni los CSS generados bajo `evolve/` o `wiki/`.
