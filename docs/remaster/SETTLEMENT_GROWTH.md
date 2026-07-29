# Crecimiento jugable: Sentience a Civilización

## Alcance

El asentamiento inicial usa `TownScene` desde que el motor expone `showCity` y
antes de que exista cualquier estructura de `actions.city`. No se crea una
aldea inicial ficticia: el terreno, bioma, especie, planeta, población,
tecnologías, recursos, edificios y empleos llegan en el mismo `TownSnapshot`
inmutable que usa Civilización.

La clasificación sigue siendo de `resolvePhaseRoute()` y el lector autorizado
de `src/actions.js`. La única diferencia de `EarlySettlementScene` es
`presentationMode: 'early-settlement'`; costes, desbloqueos, recursos, cola,
guardado y acciones permanecen fuera de `src/remaster/`.

## Reglas de presentación

| Hecho confirmado por el snapshot | Resultado visual |
| --- | --- |
| Sin población ni edificio/desbloqueo visible | `wilderness`: sólo naturaleza. |
| Población o una parcela desbloqueada, sin edificio | `camp`: mapa casi vacío y terrenos disponibles. |
| Primera vivienda real | `first-homes`: aparece la silueta registrada, contador y camino a viviendas. |
| Agricultura, madera o extracción real | `frontier`: parcela y actividad del distrito correspondiente. |
| Tres o cinco distritos con estructuras reales | `village` o `town`: mayor densidad y composición de caminos. |
| Era original `industrialized`, infraestructura de energía construida o era `advanced` | `industrial`, `electrified` o `advanced`. |

Los últimos niveles son composición visual. Las eras proceden de
`actions.tech[id].era`, transportadas por el adaptador; no se mide tiempo de
juego ni se reproduce una fórmula de progreso. El número de edificios sólo se
convierte en niveles visuales, anexos y contadores definidos por
`BuildingVisualRegistry`, nunca en un sprite por unidad.

## Expansión y transiciones

Las posiciones de distritos y rutas están declaradas en `town-layout.js` y
`town-art.js`. Son deterministas y no se guardan. Cuando el diff del
`TownSnapshot` detecta `count: 0 -> 1`, `TownBuildingLayer` ejecuta una breve
animación de construcción; el nodo del distrito pasa a tener hito y el camino
correspondiente se revela por clase CSS. Ninguna semilla visual afecta el
estado del juego y actualmente no se persiste semilla adicional.

Habitantes, humo, transporte, luces, guardias y maquinaria reutilizan los
contadores de población, trabajadores, edificios y energía ya preparados. Se
limitan por `TOWN_LIFE_BUDGET`, no representan individuos y se pausan o
simplifican con pestaña oculta, `prefers-reduced-motion` o dispositivo de bajo
rendimiento.

## Interacción y cobertura

Las parcelas y edificios incluidos en `BuildingVisualRegistry` usan
`GameActionBridge.build`, `setPower` y `setWorkers`, que delegan a las rutas
originales de `actions.js`. Todas las claves reales de `actions.city` aparecen
en `TownSnapshot.buildingCoverage`: una tiene panel gráfico o queda marcada
con fallback `classic-city`. El lateral ofrece las pestañas clásicas de ciudad,
investigación, gobierno, ejército, mercado y ajustes; abrir una de ellas usa
`loadTab()` y los estados de pestaña originales, nunca una pantalla duplicada.

## Reset e importación

El router destruye la escena saliente al cambiar de fase. En un reset, una
importación o una nueva especie/planeta, el próximo snapshot vuelve a resolver
la ruta real: Evolution, transición, asentamiento vacío, Civilización o
fallback clásico. No se escriben preferencias, seeds ni datos de escena dentro
de `evolved`; la única preferencia continúa siendo la clave versionada de
`localStorage` del remaster.

## Comprobaciones reproducibles

1. Partida nueva: avanzar hasta Sentience, activar el flag y confirmar un mapa
   natural sin hitos urbanos construidos.
2. Construir una vivienda y después una granja desde el mapa: comprobar que
   las tarjetas clásicas, recursos, cola y contador coinciden tras cada acción.
3. Construir, activar/desactivar energía y asignar trabajadores desde el panel
   gráfico; repetir la misma acción desde la tarjeta clásica y comparar el
   snapshot.
4. Abrir cada fallback clásico, cambiar de pestaña, pausar, ocultar/mostrar la
   página y regresar a la escena.
5. Importar un save existente y realizar un reset: comprobar que no queda una
   raíz, listener o temporizador del asentamiento anterior.
