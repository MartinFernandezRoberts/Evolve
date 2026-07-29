# Contrato `TownSnapshot`

## Propósito

`TownSnapshot` es el límite de sólo lectura entre Evolve y la escena visual de
Civilización. Se define con JSDoc en
`src/remaster/adapters/town-scene-contracts.js`; su versión actual es `3`.
`TownScene` y sus componentes no importan ni acceden a `global`.

El único productor de juego es
`createGameTownSnapshot(gameState, engineReader)` en
`src/remaster/adapters/game-town-adapter.js`. Recibe el estado como parámetro y
un lector fino del puente de motor (`src/actions.js`), selecciona datos ya
calculados y devuelve un objeto congelado en profundidad. No incorpora costes,
producción, requisitos, asequibilidad ni escrituras.

## Forma

| Campo | Contenido | Uso visual |
| --- | --- | --- |
| `contractVersion` | Versión del DTO. | Rechazar una forma incompatible. |
| `source` | `'mock'` o `'engine'`. | Identificar demo y partida real. |
| `title`, `subtitle` | Encabezado de la vista. | HUD de la escena. |
| `resources` | Recursos visibles en el orden original: identificador, nombre, monograma propio, tooltip, cantidades originales, formato original, tendencia, aviso, desbloqueo y comercio cuando existe. | Barra dinámica completa y recursos requeridos por el edificio seleccionado. |
| `districts` | Diez distritos con posición y arte SVG propios, contador y edificios agrupados. | Nodos, marcas y panel lateral. |
| `visualBuildings` | Edificios reales del registro con nombre localizado, cantidad, actividad, bloqueo, coste siguiente, cola, energía, empleo y asequibilidad originales. | Edificio SVG, parcela disponible, estado, contador y panel. |
| `context.species` | Id y nombre de especie. | Temas y paneles posteriores. |
| `context.biome` | Id y nombre del bioma. | Tema ambiental posterior. |
| `context.planet` | Planeta de origen mostrado por la raza. | Contexto de escena posterior. |
| `context.environment` | Estación, clima, temperatura, viento, día y `city.ptrait` en su codificación original. | Velo ambiental, lluvia y rasgos planetarios sin reglas nuevas. |
| `context.season`, `context.weather` | Códigos originales de calendario. | Ambiente sin recalcular clima. |
| `context.population` | Recurso de población con cantidad y máximo. | HUD posterior. |
| `context.stage` | Etiqueta de etapa producida por `tabLabel('city')`. | Encabezado contextual, sin duplicar umbrales de población. |
| `context.workers` | Nombre, descripción original, asignación, cupo y capacidad de cambio de cada empleo. | Distrito y panel. |
| `context.buildings` | Estructuras urbanas construidas, con su título original cuando existe una acción de ciudad. | Agrupación y detalle de distrito. |
| `context.technologies` | Tecnologías numéricas activas. | Variantes visuales posteriores. |
| `context.energy` | Energía disponible, generada, consumida y bandera `powered` desde el helper compartido del juego. | Estado visual y panel. |
| `context.morale` | Moral actual y potencial. | Estado visual posterior. |
| `context.government` | Id y etiqueta de gobierno. | Distrito de gobierno posterior. |

`TownDistrict.buildings` es una vista agrupada de `context.buildings`. Las
coordenadas, colores y variantes de arte de cada distrito vienen de
`src/remaster/config/town-layout.js`; son presentación estática y no se guardan
en la partida.

`context.species.type` conserva el grupo original de especie para escoger una
familia visual de arquitectura y habitantes abstractos. La capa de vida también
consume este muestreo de un segundo: la población se muestra por rangos
decorativos y las viñetas de agricultor, minería, transporte, investigación,
guardia e industria se habilitan mediante trabajadores o edificios ya presentes.
No hay una lista de habitantes ni se calcula producción en la escena.
`calendar.day` no aporta una hora o fase diurna fiable; por ello no se inventa
un ciclo de día/noche.

`visualBuildings` se limita a ids incluidos en `BuildingVisualRegistry`. El
adaptador recibe desde la integración los resultados de las comprobaciones y
renderizadores originales para `unlocked`, `affordable`, nombre, costes,
efecto, energía, empleo y cola; no vuelve a expresar esas reglas en la escena.

## Frecuencia y actualización

El gestor crea el snapshot inicial al montar y, mientras la vista gráfica está
visible, solicita uno nuevo como máximo cada 1000 ms. El intervalo es ajeno al
frame rate y a los ticks de Evolve. Con la página oculta no solicita snapshots;
al volver a estar visible realiza una actualización puntual.

El mapa y sus listeners se conservan si no cambia la estructura de distritos.
Sólo se actualizan los valores de recursos, marcas de construcción y panel del
distrito seleccionado. El gestor se limpia al desactivar la opción, cambiar de
pestaña o perder su contenedor.

## Reglas de evolución

- Añadir un campo requiere actualizar el JSDoc, este documento y, si cambia la
  forma de manera incompatible, `contractVersion`.
- Una acción visual no pertenece a este DTO. Debe pasar por un comando de
  intención que llame al flujo público del motor.
- El contrato no se persiste ni aparece como un formato de save independiente.
- `TownSnapshot` y todos sus descendientes están congelados; los componentes no
  pueden modificar accidentalmente datos del motor.
