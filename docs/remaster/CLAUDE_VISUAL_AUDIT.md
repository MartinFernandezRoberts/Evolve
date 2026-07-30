# Auditoría visual y propuesta de rediseño (Claude)

> Fecha: 2026-07-30. Rama auditada: `remaster/playable-visual-overhaul`. Alcance:
> todo `src/remaster/`, sus puntos de integración en `src/actions.js`/`src/index.js`,
> los estilos LESS del remaster, `remaster-demo.html`, la documentación previa en
> `docs/remaster/` y una revisión visual real con Playwright/Chromium en
> 1920×1080, 1366×768, 1024×768 y 390×844. No se ha modificado motor, balance,
> formato de guardado ni código de producción en esta entrega: es sólo
> diagnóstico y propuesta, tal como pide el encargo.

## Resumen ejecutivo

La arquitectura de separación motor/vista es sólida y disciplinada: no hay
`global` importado dentro de `src/remaster/`, las acciones pasan por
`GameActionBridge` → `runAction()`, los snapshots están congelados y la
cobertura de fallback a la UI clásica está bien pensada. Esa base **se
conserva**. El problema no es arquitectónico: es de **contenido visual,
densidad, pulido y verificación real**. Con la app efectivamente en
ejecución y capturada en las cuatro resoluciones exigidas se observan fallos
concretos que ninguna de las auditorías previas (que fueron mayoritariamente
de código y checklist, no de captura visual comparada) había detectado:

- Dos caracteres corruptos (mojibake) en producción, en el control de zoom y
  en el emblema por defecto de un nodo de Evolution.
- La escena de Evolución rompe su layout en 1024×768, uno de los cuatro
  anchos que el propio `AGENTS.md`/`TEST_MATRIX.md` exigen verificar.
- Comparando el escenario "nueva partida" (población 0, cero edificios) con
  "industrial" (población 240, 48 viviendas, energía) en el mapa de
  Civilización: **el mapa es casi pixel-idéntico**. El "crecimiento visible
  del asentamiento" que pide el encargo original no ocurre en la práctica,
  pese a que existe documentación extensa (`SETTLEMENT_GROWTH.md`,
  `VISUAL_PROGRESSION.md`) describiendo cómo debería ocurrir.
- El lenguaje de arte por silueta que describe `ART_DIRECTION.md`
  ("vivienda, granja, almacén... deben reconocerse por forma antes que por
  texto") existe en el código pero **no se usa**: es código muerto. Lo que se
  renderiza de verdad son 5-6 recortes Kenney reutilizados con distinto tinte
  en los 13 edificios y 10 distritos, por lo que muchos edificios son
  visualmente intercambiables.

Ninguno de estos problemas requiere cambiar de tecnología de render. Son
defectos de composición, verificación y aprovechamiento de lo ya construido.
La recomendación central de este documento es **no relanzar la capa gráfica
desde cero**: conservar el adaptador, los contratos, el router de fases y la
integración con el motor, y **rehacer selectivamente el contenido visual**
(arte de edificios activado de verdad, densidad real por distrito, estados
vacíos con más composición, HUD y paneles de los sistemas que hoy sólo
enlazan a lo clásico) más una tanda de correcciones concretas.

## Alcance y método

1. Lectura completa de los 19 documentos en `docs/remaster/` y de
   `AGENTS.md`.
2. Lectura de todo `src/remaster/` (34 módulos JS, 3 hojas LESS, manifest de
   assets) y de los puntos de cruce en `src/actions.js` e `src/index.js`.
3. `npm run test-remaster` (pasa).
4. Build real (`buildEvolve.js`, `lessc`+`csso` para `evolve.css`,
   `buildWiki.js`) y servidor estático local, porque `servehere`/`lessc` del
   `package.json` invocan shims de shell incompatibles con la instalación de
   Node del entorno; se usó un servidor Node mínimo equivalente sólo para
   esta auditoría.
5. Playwright/Chromium (instalado temporalmente, sin tocar
   `package.json`/`package-lock`, no committeado) para capturar:
   - Partida nueva real con el flag activado (`evolve.visual-remaster.preferences.v1`)
     en 1920×1080, 1366×768, 1024×768 y 390×844 → siempre aterriza en
     `EvolutionScene`, que es el primer contacto real de cualquier jugador.
   - `remaster-demo.html` con los cinco escenarios documentados en
     `TEST_MATRIX.md` (`new`, `small`, `intermediate`, `industrial`,
     `aquatic`), que son la única forma practicable de ver `CivilizationTownScene`
     con densidad alta sin jugar horas reales (no hay ningún save de
     Civilización en el repositorio, algo que `PLAYABLE_INTEGRATION_AUDIT.md`
     ya señalaba como limitación).
   - UI clásica (flag apagado) como control, en desktop y en 390×844.
6. Verificación de cada hallazgo dudoso contra el código fuente antes de
   incluirlo (por ejemplo, se descartó que el mojibake fuera un artefacto del
   servidor de prueba: se confirmó carácter por carácter en el fichero
   fuente).

## Problemas críticos

### C1. Caracteres corruptos en producción (mojibake)

`src/remaster/scene/evolution-scene.js:76` y `:306` contienen literalmente:

```js
<button type="button" data-evolution-control="zoom-out">âˆ’</button>
...
emblem.textContent = 'â—‡';
```

Debían ser `−` (signo menos, U+2212) y `◇` (rombo, U+25C7); alguien guardó el
archivo con una re-codificación incorrecta (UTF-8 reinterpretado como
Latin-1/Windows-1252 y vuelto a guardar). Es 100% reproducible: aparece en
las cuatro capturas de la escena de Evolución, tanto sirviendo con
`Content-Type: text/javascript` como forzando `; charset=utf-8` explícito
(se probó ambas formas para descartar el servidor de pruebas como causa). Es
el primer botón que ve cualquier jugador nuevo con el flag activado. Grep
adicional en `src/remaster/**/*.js` no encontró más casos, así que está
acotado a estos dos puntos, pero indica que el flujo de guardado/edición no
tiene ninguna verificación de codificación.

**Corrección recomendada:** sustituir por escape Unicode (`'−'`,
`'◇'`) o entidad HTML seguras en vez del carácter literal, y añadir una
comprobación de build (grep de bytes de reemplazo Unicode `�` o del
patrón `Ã.|â€.` sobre `evolve/main.js`) al lado de `buildRemasterValidation.js`
para que esta clase de error no vuelva a pasar desapercibida.

### C2. La escena de Evolución rompe el layout en 1024×768

En 1024×768 (una de las cuatro resoluciones obligatorias) la barra de
herramientas del mapa y el panel lateral se salen del viewport: el botón
"+", el indicador "100%" y el borde derecho del panel ("Classic Vi…",
"Major Even…") quedan cortados, sin scroll horizontal que los recupere.
Causa: `src/remaster/styles/phase-scenes.less:187` fija
`grid-template-columns: minmax(0, 1fr) minmax(16rem, 24rem)` para
`.evolution-scene__layout`, y el breakpoint que colapsa a una columna está en
`:515` con `@media (max-width: 850px)`. Entre 851px y ~1150px de ancho útil
(1024px de viewport menos el HUD lateral clásico) el contenido mínimo del
layout de dos columnas no cabe. `CivilizationTownScene`/`TownScene` no tiene
este problema (su propio breakpoint en `town-scene.less` está mejor ajustado
y se comprobó en `AUDIT.md`), pero `EvolutionScene` es código más nuevo
(checkpoint 2, commit `6a1050a3`) y no había pasado por esa misma revisión
responsive.

**Corrección recomendada:** subir el breakpoint de colapso a algo como
`@media (max-width: 1180px)` o usar `minmax(0, 1fr) minmax(14rem, 20rem)`
con `overflow-wrap` en las etiquetas, y añadir 1024×768 a la matriz de
pruebas manual específica de `EvolutionScene` (hoy sólo se documenta para
`TownScene`/demo en `TEST_MATRIX.md`).

### C3. Crecimiento del asentamiento casi imperceptible

Se comparó pixel a pixel `remaster-demo.html?scenario=new` (población 0,
cero edificios reales, sólo `basic_housing` desbloqueado con conteo 0) contra
`?scenario=industrial` (población 240, 48 viviendas, 15 granjas, energía,
`electricity` investigada). **El mapa resultante es casi idéntico**: los
mismos diez "landmarks" de distrito, en las mismas posiciones, con la misma
insignia numérica en el círculo superior. La única diferencia visible son
micro-etiquetas `×N` diminutas bajo un par de edificios en el escenario
industrial.

La causa está en el diseño de dos capas independientes que no se comunican
bien:

- `createTownNode()` (`src/remaster/components/town-node.js:36`) siempre
  dibuja `createKenneyDistrictArt(district)`: un "landmark" fijo por
  distrito que **no depende de si hay algo construido**. Se ve incluso con
  cero edificios reales.
- El badge numérico que se lee como "6" en "Housing" no es el recuento de
  casas: es `district.marker`, un valor decorativo **fijo por escenario
  mock** (`src/remaster/config/town-map.js:15-26`), desconectado de
  `mockVisualBuildings`/`option.counts` (líneas 28-58) que sí varían por
  escenario. En una partida real (`game-town-adapter.js`) el marcador viene
  de otro cálculo, pero el problema de fondo persiste: el landmark de
  distrito es arte estático, y los edificios reales (`TownBuildingLayer`) se
  dibujan como sprites secundarios pequeños, posicionados con offsets de
  apenas 30-40px (`building-visual-registry.js:49-62`), fácilmente
  eclipsados por el landmark.

Esto contradice directamente el objetivo del encargo ("evolución visible
desde organismo hasta civilización", "crecimiento progresivo del
asentamiento") y el propio `VISUAL_PROGRESSION.md`, que describe una
progresión por etapas que en el código existe (`resolveSettlementVisualProgression`)
pero cuyo efecto visual es mucho más sutil de lo que la documentación da a
entender.

**Corrección recomendada:** ver la propuesta de rediseño (sección "Escenario
central"): el landmark de distrito debe **ocultarse o reducirse a un
marcador de terreno** hasta que haya al menos un edificio real, y su
"nivel" visual (tamaño, decoración, iluminación) debe derivar del recuento
real más alto de ese distrito, no ser una silueta constante.

### C4. En móvil real, la escena gráfica queda fuera de la pantalla por un bug preexistente de la UI clásica

A 390×844 el contenedor de pestañas (`#evolution`, y por herencia `#city`)
empieza en `y ≈ 888px` **tanto con el flag activado como desactivado**: el
encabezado, la barra de recursos clásica y el Message Log ocupan casi una
pantalla completa antes de que arranque el contenido de la pestaña. Es un
problema de la UI clásica en móvil angosto, no introducido por el remaster,
pero **bloquea por completo la verificación jugable en 390×844** que exige
`AGENTS.md`, y explica por qué una captura "arriba del pliegue" del modo
gráfico en móvil parece mostrar sólo la UI clásica superpuesta: la escena
real está ahí, sólo que 130px más abajo del alto total del viewport.

**Corrección recomendada:** no es competencia exclusiva del remaster
arreglar el layout clásico, pero si el objetivo es que el remaster sea
"jugable" en móvil, hace falta una intervención mínima y quirúrgica: colapsar
el Message Log por defecto en anchos `≤ 600px` (ya existe un patrón similar
en `town-scene.less` para el panel) para que el contenido de la pestaña
aparezca en el primer scroll. Documentar esta dependencia explícitamente en
vez de asumir "responsive: correcto" como hacían las auditorías previas.

## Problemas funcionales

- **Truncamiento de recursos en todas las resoluciones, incluida
  1920×1080.** La etiqueta "Knowledge" se corta a "Kn…" en la barra de
  recursos de `TownScene` (`syncResourceDisplay()`,
  `src/remaster/scene/town-scene.js:328-378`) en las cinco capturas de
  escritorio del demo, no sólo en móvil. Es un ancho fijo insuficiente para
  nombres de recursos largos en inglés (y peor en otros idiomas: alemán,
  francés, ruso tienden a nombres más largos).
- **Mensaje contradictorio en el panel de distrito.** Al seleccionar un
  distrito con un edificio ya construido (p. ej. "Town Center — 1 built") el
  panel muestra a la vez "No buildings are currently available in this
  district" (`renderDistrictPanel`, `src/remaster/components/town-panel.js:71-95`,
  cuando `buildings` sólo incluye construibles/desbloqueados y no lo ya
  construido si no cumple el filtro). El jugador ve "1 construido" arriba y
  "no hay edificios disponibles" abajo, en el mismo panel, sin explicación.
- **Gobierno, Ejército, Comercio, Religión e Investigación no tienen panel
  gráfico propio**, solo enlaces "abrir panel clásico"
  (`classicPanels` en `src/remaster/components/town-panel.js:46-53`, ver
  también `WIKI_COVERAGE.md`). El encargo pide explícitamente que estos
  aparezcan como "panel contextual" del remaster, no como salida forzosa a
  la interfaz antigua cada vez. Hoy la experiencia gráfica es
  fundamentalmente "Evolution + Ciudad"; todo lo demás sigue siendo 100 %
  clásico.
- **`remaster-demo.html` carga jQuery desde una CDN externa**
  (`<script src="https://unpkg.com/jquery@3.6.3/...">`, `remaster-demo.html:23`)
  que **no se usa en absoluto**: `demo.js` y `TownScene` son DOM/SVG puro sin
  jQuery. Contradice el principio explícito de `ASSET_PIPELINE.md` ("No se
  admite descargar assets en el navegador... nunca una URL remota") aunque
  técnicamente no sea un "asset" de arte, y es peso muerto que además rompe
  la demo si no hay red.
- **Doble sistema de arte de edificio sin resolver.** Existen dos
  implementaciones completas y paralelas: `createBuildingVisualSprite()`
  (SVG original a mano, un símbolo por edificio,
  `src/remaster/assets/building-visuals.js:17-51`) y
  `createKenneyBuildingVisual()` (recorte raster CC0,
  `:59-78`). Sólo la segunda se usa
  (`TownBuildingLayer.updateEntry`, `town-building-layer.js:106`). Lo mismo
  ocurre con `createDistrictArt()` (SVG a mano,
  `src/remaster/assets/town-art.js:89-117`) frente a
  `createKenneyDistrictArt()` (`:126-151`, la que sí se usa en
  `town-node.js:36`). El código muerto no es neutro: es exactamente el arte
  que cumple el objetivo de "silueta reconocible por forma" del brief, y
  está siendo ignorado a favor de una versión que lo cumple peor (ver C3 y
  "problemas artísticos").

## Problemas artísticos

- La escena de Evolución (primer contacto de cualquier partida nueva) es un
  degradado radial de fondo, dos manchas de resplandor y un único círculo
  "organismo" sobre una elipse de sombra. No hay textura, no hay sensación
  de diorama ni de "fondo prerenderizado de 16 bits": es más cercana a una
  pantalla de carga abstracta que a un escenario. Con sólo una o dos
  acciones disponibles al inicio (`RNA` es la única al arrancar), el 90 % del
  lienzo de 1600×900 queda vacío. El panel derecho, cuando el edificio/nodo
  seleccionado tiene poco texto, también deja mucho espacio en blanco.
- El mapa de Civilización sí logra sensación de diorama (terreno, montañas,
  agua, caminos curvos) pero **choca de estilo**: el terreno, las montañas y
  los caminos son SVG plano vectorial dibujado a mano
  (`createTownBackdrop()`, `town-art.js:8-80`) mientras los edificios son
  recortes raster con sombreado pseudo-isométrico Kenney. Conviven dos
  lenguajes visuales distintos en el mismo fotograma.
- Los iconos de recursos son un círculo de color con una sola letra
  (`resource.iconText`, primera letra del nombre localizado). Es funcional
  pero no ilustrado; con recursos que comparten inicial (o en idiomas donde
  varios nombres empiezan igual) pierde incluso su valor identificador.
- Aunque el registro de edificios (`building-visual-registry.js`) define
  hasta 4 niveles visuales con anexos crecientes por familia
  (compacta/cívica/industrial), en la práctica el "nivel" que más destaca a
  simple vista es el landmark fijo del distrito (C3), no estos niveles: el
  trabajo de diseño de niveles existe pero su efecto queda opacado.

## Problemas de UX

- Etiqueta "VISUAL REMASTER" duplicada: aparece en la barra superior del
  selector clásico/gráfico y otra vez como "eyebrow" dentro del propio
  encabezado de la escena, a menos de 40px de distancia vertical.
- El Message Log clásico permanece siempre visible por encima de la escena
  gráfica y compite por atención y espacio vertical; en desktop es tolerable,
  en móvil es la causa directa de C4.
- No hay guía de qué hacer primero más allá de un único botón "Evolve": no
  hay ningún onboarding, tooltip de bienvenida o indicación visual de hacia
  dónde crece el árbol de evolución.
- No existe minimapa ni indicador de progreso hacia Sentiencia (p. ej. "N
  pasos completados de M"), pese a que el snapshot ya expone
  `evolution.final` y los pasos construidos.
- Controles de zoom con el glifo roto (C1) reducen la confianza percibida en
  el resto de la interfaz, aunque sea un problema puntual.

## Problemas de arquitectura (código)

Esto **no** es una lista de cosas mal hechas: la mayoría de la arquitectura
descrita en `ARCHITECTURE.md`/`ENGINE_INTEGRATION.md`/`PHASE_ARCHITECTURE.md`
se verificó correcta durante esta auditoría (ver "Componentes reutilizables").
Los puntos reales de fricción para mantenimiento son:

- Los dos sistemas de arte paralelos (SVG a mano vs. Kenney raster, ver
  arriba) deberían resolverse con una decisión explícita y borrar la rama
  perdedora, no dejar ambas implementaciones completas en el árbol.
- `src/remaster/styles/town-scene.less` tiene 1985 líneas en un único
  archivo, sin una partición clara por componente (nodo, panel, HUD,
  landmark, animaciones de vida). Seguirá creciendo con cada iteración de
  arte; conviene dividirlo antes de que el rediseño añada más reglas.
- No existe ningún guard de build que detecte caracteres de reemplazo o
  mojibake (a diferencia del guard que sí existe para mocks en el bundle,
  `buildRemasterValidation.js`). C1 habría sido trivialmente detectable con
  una regla `grep` adicional.
- El flujo de build documentado en `package.json`/`AGENTS.md`
  (`lessc`, `csso-cli`, `servehere`) invoca shims de shell (`node_modules/.bin/*`)
  que fallan al ejecutarse directamente con `node` en este entorno concreto
  de Windows (Node 24 del sistema más un paquete `node@^16` "broncoceado"
  como dependencia, que sólo aporta un binario en blanco). No es un bug del
  remaster, pero conviene que quede registrado: se resolvió invocando los
  puntos de entrada JS reales (`node_modules/less/bin/lessc`,
  `node_modules/csso-cli/bin/csso`) en vez de los shims de `.bin`.

## Problemas de rendimiento

No se detectaron problemas de rendimiento graves. El diseño ya documentado
en `PERFORMANCE_BUDGET.md` (muestreo a 1 Hz, sin `requestAnimationFrame`
propio, reserva fija de figuras de vida, pausa en pestaña oculta y
`prefers-reduced-motion`) se confirmó presente en el código
(`town-scene-manager.js`, `town-life-layer.js`) y es una base correcta que
**debe conservarse** en el rediseño. El único coste añadido observado es
cosmético: recortes raster Kenney múltiples por edificio (imagen principal +
hasta 3 "anexos" que repiten la misma imagen a distinta posición,
`createKenneyBuildingVisual()`, `building-visuals.js:71`), que no es
significativo a la densidad actual (máximo ~14 edificios definidos) pero
tampoco aporta variedad visual proporcional a su coste.

## Componentes reutilizables

Conservar sin reescribir:

- **Toda la frontera motor/adaptador**: `game-town-adapter.js`,
  `game-phase-adapter.js`, `phase-scene-contracts.js`,
  `town-scene-contracts.js`, `game-action-bridge.js`. Es la parte más
  valiosa del trabajo previo: snapshots inmutables, sin fórmulas
  duplicadas, verificado por `test/remaster/integration-contract.test.js`.
- **`PhaseSceneRouter`** y la tabla de clasificación de fase
  (`config/phase-routing.js`): la lógica de qué escena montar según señales
  del motor es correcta y no necesita cambios.
- **`TownSceneManager`** y su presupuesto de muestreo/limpieza de listeners:
  la disciplina de ciclo de vida (destruir SVG, listeners e intervalos al
  cambiar de fase/pestaña/flag) es sólida y evita fugas.
- **`BuildingVisualRegistry`** como *esquema* (niveles, posiciones,
  animaciones, `workerJobs`): el diseño de datos es bueno; lo que hay que
  cambiar es qué función de arte consume ese registro (ver propuesta).
- **`TownBuildingLayer`** como motor de sincronización incremental
  (diffing por id, animaciones de "growing"/"unlocked"/"actioned"): la
  mecánica es correcta, sólo hace falta mejorar lo que dibuja.
- El sistema de localización (`loc()` reutilizado sin duplicar catálogo) y
  la migración de preferencias fuera de `evolved`
  (`config/remaster-preferences.js`): ambos cumplen exactamente lo que pide
  `AGENTS.md` y no deben tocarse.
- El SVG de terreno/montañas/agua de `createTownBackdrop()`
  (`town-art.js:8-80`): es original, de buena calidad y coherente con la
  dirección de arte; el problema no es este fondo, es lo que se superpone
  encima (ver propuesta de arte de edificios).

## Componentes que deben reemplazarse o resolverse

- **`createKenneyDistrictArt()`** como landmark fijo por distrito
  (`town-art.js:126-151`) — sustituir por composición derivada del estado
  real (ver propuesta).
- Decidir entre `createBuildingVisualSprite()`/`createDistrictArt()` (SVG a
  mano) y las variantes Kenney; **no mantener ambas indefinidamente**. Esta
  auditoría recomienda recuperar y terminar la vía SVG a mano (más barata de
  variar por edificio y ya alineada con "silueta reconocible"), pero es una
  decisión de arte, no sólo técnica (ver pregunta abierta en Riesgos).
- El fondo de `EvolutionScene` (`evolution-scene.js`, sección del SVG de
  fondo con degradado radial) — necesita más capas de composición para dejar
  de leerse como pantalla de carga.
- El bloque `<script src="https://unpkg.com/...">` de `remaster-demo.html:23`
  — eliminar, no se usa.
- Layout de dos columnas de `EvolutionScene` en el rango 851-1150px — ajustar
  breakpoint (C2).

## Propuesta de rediseño

### Pilares

1. **El landmark de distrito deja de ser decoración fija.** Un distrito sin
   ninguna estructura real se ve como terreno/parcela disponible (ya existe
   ese estado, `hiddenWhenLocked.available = 'terrain-plot'`, simplemente no
   se usa de forma consistente); el "hito" visual del distrito sólo aparece
   y crece cuando el snapshot confirma construcciones reales, con al menos 3
   siluetas perceptiblemente distintas por familia de edificio (no sólo tinte
   de color).
2. **Cerrar el ciclo de arte por silueta.** Terminar y activar
   `createBuildingVisualSprite()`/`createDistrictArt()` (o su evolución) como
   fuente única de verdad de arte de edificio; retirar la ruta Kenney o
   limitarla a decoración ambiental (árboles, rocas, agua) donde ya encaja
   bien con el fondo vectorial.
3. **Todo sistema jugable visible en el remaster, no sólo enlazado.** Gobierno,
   Ejército, Comercio, Religión e Investigación obtienen un panel contextual
   propio dentro del mismo patrón de panel lateral que ya existe para
   edificios de ciudad (mismo componente, mismo contrato de datos delegado al
   motor), en vez de un botón que saca al jugador a la pestaña clásica.
4. **Estados vacíos con más composición, no menos.** La escena de Evolución
   con un solo nodo disponible debe seguir sintiéndose como un lugar
   (partículas ambientales, capas de profundidad, textura), no como un
   placeholder.
5. **No añadir una segunda economía visual.** Todo esto se apoya en datos que
   el snapshot ya expone o puede exponer sin nueva lógica de juego (conteo,
   nivel, distrito, era, bioma); ver "archivos que cambiarán".

### HUD permanente

- Barra de recursos (ya existe, corregir truncamiento — ancho flexible con
  `title`/tooltip completo y `text-overflow: ellipsis` real en vez de corte
  duro).
- Indicador compacto de producción/consumo neto por recurso visible (flecha +
  valor, ya hay `resource.trend` en el contrato; falta exponerlo como cifra,
  no sólo como clase CSS `is-trending-up/down`).
- Selector clásico/gráfico (ya existe) y botón de import/export accesible
  desde el HUD (hoy sólo desde Settings clásico).
- Icono de notificaciones/mensajes que sustituya el Message Log siempre
  visible por un badge con panel desplegable (soluciona C4 y el problema de
  "message log siempre encima").

### Escenario central

- Mapa de distrito con landmark condicionado a construcción real (pilar 1).
- Nodo de Evolución: mismo lienzo pero con más capas de fondo (terreno
  primigenio, corrientes, motas de luz a distintas profundidades) para que
  un único nodo visible no se lea como pantalla vacía.
- Ruta de crecimiento: cuando un distrito pasa de "sparse" a "settled" a
  "dense" (ya calculado en `getDistrictVisualDensity()`), el camino de tierra
  hacia ese distrito se ensancha/pavimenta (ya hay precedente de clases CSS
  por camino, `.town-scene__path--*`, sólo falta variarlas por densidad en
  vez de sólo por presencia).

### Panel contextual / paneles nuevos

Mismo componente `renderTownPanel`-like, extendido con vistas para:

- **Construcción** (ya existe).
- **Trabajadores** (ya existe, dentro del panel de edificio).
- **Investigación**: lista de tecnologías visibles con coste/estado
  delegado a `checkAffordable()`/`checkTechQualifications()`, mismo patrón
  que `EvolutionSnapshot`.
- **Gobierno**: tipo actual, efectos, acción de cambio delegada a la acción
  original de gobierno.
- **Ejército**: resumen de unidades/garrison ya expuesto parcialmente;
  añadir acciones delegadas equivalentes a las de la pestaña clásica de
  ejército.
- **Comercio**: rutas/mercado ya calculados por el motor, sólo proyectados.
- **Religión**: edificios y efectos de moral ya expuestos parcialmente en
  `context.morale`.
- **Configuración, estadísticas, import/export**: overlays/modales de acceso
  rápido, delegando 100 % en las funciones clásicas (`window.exportGame()`,
  etc.), nunca reimplementadas.

### Clasificación de superficies

| Elemento | Tipo |
| --- | --- |
| Barra de recursos, producción neta, selector clásico/gráfico | HUD permanente |
| Panel de distrito/edificio, Investigación, Gobierno, Ejército, Comercio, Religión | Panel lateral contextual (mismo slot, contenido intercambiable) |
| Import/export, estadísticas, configuración | Modal |
| Notificaciones/Message Log | Overlay desplegable desde un icono del HUD |
| Mapa de Evolución, mapa de Civilización | Vista de escena (mapa central) |
| Cualquier sistema no cubierto todavía por un panel gráfico (resets, espacio, portal, Tau Ceti, Edén...) | Acceso temporal a panel clásico, explícito, no oculto |

### Wireframes textuales

**Desktop, escena de Civilización:**

```
┌───────────────────────────────────────────────────────────────────┐
│ [Clásico|Gráfico]      HUD: recursos con tendencia · notificaciones│
├───────────────────────────────────────────┬─────────────────────┤
│                                             │ Panel contextual     │
│   Mapa (landmark condicionado a build)     │ (distrito / edificio │
│   + navegador de distritos + zoom          │  / gobierno / etc.)  │
│                                             │                       │
├─────────────────────────────────────────────────────────────────┤
│ pista de interacción                                              │
└───────────────────────────────────────────────────────────────────┘
```

**Móvil (≤600px):** Message Log colapsado por defecto tras un icono del
HUD; mapa a ancho completo arriba, panel contextual debajo en vez de al
lado (patrón que `town-scene.less` ya usa en su breakpoint de 850px;
extenderlo también a `phase-scenes.less`).

### Estrategia gráfica

Se evaluaron las cuatro opciones que ya proponía `ARCHITECTURE.md` con los
hallazgos de esta auditoría en mente:

| Opción | Evaluación tras la auditoría |
| --- | --- |
| DOM + SVG (actual) | Ninguno de los problemas encontrados (C1-C4, truncamiento, landmark estático, choque de estilo) es una limitación de esta tecnología: son de composición y contenido. Mantenerla. |
| Canvas 2D | Resolvería menos que lo que costaría: perderíamos foco de teclado, `aria-label` y estructura semántica ya construidos en `TownNode`/`TownBuildingLayer`, sin resolver ninguno de los hallazgos críticos. No se recomienda. |
| PixiJS/WebGL | Añade una dependencia grande no justificada por ningún cuello de botella medido (no se detectaron problemas de rendimiento, ver sección correspondiente); contradice explícitamente `AGENTS.md`. No se recomienda. |
| Híbrida (SVG mapa + Canvas para partículas de clima/vida) | Posible mejora futura acotada sólo si se decide enriquecer mucho las partículas ambientales del pilar 4; no es necesaria para resolver los hallazgos de esta auditoría. Aplazar. |

**Decisión: mantener DOM + SVG.** El trabajo pendiente es de arte y
composición (activar el sistema de siluetas ya escrito, variar densidad real,
enriquecer estados vacíos), no de motor de render.

## Estrategia de implementación (checkpoints propuestos)

1. **Correcciones críticas aisladas** (C1-C4 + truncamiento de recursos +
   mensaje contradictorio del panel + retirar el `<script>` de CDN sin uso).
   Sin dependencias nuevas, sin tocar el contrato de snapshot. Es la entrega
   más pequeña y de menor riesgo; debería salir primero e independiente del
   resto.
2. **Decisión y cierre del sistema de arte de edificio** (activar
   `createBuildingVisualSprite()`/`createDistrictArt()` como fuente única,
   o completar una alternativa definitiva) + landmark de distrito
   condicionado a construcción real. Este es el checkpoint que resuelve C3,
   el hallazgo más alineado con el objetivo original del encargo
   ("evolución visible", "crecimiento progresivo").
3. **Paneles de Gobierno/Ejército/Comercio/Religión/Investigación** dentro
   del remaster, reutilizando el patrón de panel ya existente y delegando en
   los mismos puntos de motor que hoy sólo enlazan a lo clásico.
4. **Enriquecimiento de estados vacíos y HUD** (fondo de Evolución con más
   capas, indicador de producción neta, notificaciones como overlay en vez
   de Message Log fijo, minimapa/progreso hacia Sentiencia).
5. **Pulido responsive transversal**: aplicar a `EvolutionScene` los mismos
   breakpoints y revisión que ya tiene `TownScene`, y colapsar el Message Log
   clásico en móvil angosto.

Cada checkpoint es reversible, deja la UI clásica intacta y termina con
`npm run build-win` + `npm run test-remaster` en verde, siguiendo el mismo
criterio de salida que ya usa el resto de `docs/remaster/`.

## Archivos que cambiarán (estimación)

- `src/remaster/scene/evolution-scene.js` (C1, C2, enriquecimiento de fondo)
- `src/remaster/scene/town-scene.js` (truncamiento de recursos, indicador de
  tendencia)
- `src/remaster/components/town-node.js`, `town-building-layer.js` (landmark
  condicionado, activar arte por silueta)
- `src/remaster/assets/town-art.js`, `building-visuals.js` (resolver los dos
  sistemas de arte)
- `src/remaster/config/building-visual-registry.js` (si el arte por silueta
  necesita metadatos adicionales por nivel)
- `src/remaster/components/town-panel.js` (mensaje contradictorio, nuevos
  paneles de Gobierno/Ejército/Comercio/Religión/Investigación)
- `src/remaster/styles/phase-scenes.less`, `town-scene.less`,
  `town-integration.less` (breakpoints, partición del archivo grande)
- `src/actions.js` (wrappers delegados adicionales para los nuevos paneles,
  siguiendo el mismo patrón que `runVisualCityBuild`/`runVisualEvolutionAction`)
- `remaster-demo.html` (retirar `<script>` de CDN)
- `docs/remaster/ART_DIRECTION.md`, `BUILDING_VISUALS.md`,
  `SETTLEMENT_GROWTH.md` (actualizar una vez el checkpoint 2 cambie qué
  función de arte es la fuente de verdad)
- `buildRemasterValidation.js` (guard adicional de codificación)

No se prevén cambios en `src/vars.js`, formato de guardado, fórmulas,
balance ni en ningún módulo fuera de `src/remaster/` salvo los wrappers
delegados ya establecidos en `src/actions.js`.

## Dependencias propuestas

**Ninguna dependencia nueva de producción.** Se mantiene DOM + SVG (ver
"Estrategia gráfica"). Para desarrollo/QA, esta auditoría usó Playwright de
forma temporal y no persistida (`npm install --no-save`, sin tocar
`package.json`/`package-lock.json`); se recomienda considerar añadirlo como
`devDependency` real en un futuro checkpoint dedicado a pruebas automatizadas
de regresión visual, pero es una decisión aparte que debe pedirse
explícitamente, no un efecto colateral de esta entrega.

## Riesgos

- **Decisión de arte pendiente** (SVG a mano vs. raster Kenney): esta
  auditoría recomienda SVG a mano por alineación con "silueta reconocible" y
  menor coste de variación por edificio/raza/bioma, pero es una preferencia
  de dirección de arte que conviene confirmar antes del checkpoint 2, no
  asumir unilateralmente.
- **Alcance de los paneles nuevos (checkpoint 3)** puede crecer rápido si se
  intenta cubrir cada acción especial de Gobierno/Ejército/Comercio/Religión
  de golpe; debe tratarse como slices independientes por sistema, igual que
  `ROADMAP.md` ya hace para Evolution/Civilización.
- **El bug de Message Log en móvil (C4) es de la UI clásica**, no del
  remaster; tocar ese layout obliga a probar que la UI clásica sigue
  funcionando igual con el flag apagado (criterio explícito de
  `AGENTS.md`), y podría interpretarse como "tocar la interfaz clásica" si
  no se acota estrictamente al colapso del Message Log en anchos angostos.
- **No hay save de Civilización real en el repositorio** (ya señalado en
  `PLAYABLE_INTEGRATION_AUDIT.md`): toda verificación de densidad alta sigue
  dependiendo de los escenarios mock de `remaster-demo.html`, que representan
  bien el contrato pero no sustituyen una partida real jugada hasta
  Civilización industrial.
- **Herramientas de build del entorno**: si el checkpoint de QA quiere
  automatizar capturas de regresión visual, hará falta resolver primero por
  qué `node_modules/.bin/*` no es invocable directamente con el Node del
  sistema en este entorno (ver "Problemas de arquitectura").

## Anexo: evidencia de capturas

| Captura | Ruta/escenario | Resolución | Hallazgo principal |
| --- | --- | --- | --- |
| Evolution, partida nueva | `index.html`, flag activo | 1920×1080 | C1 (mojibake), escena mayormente vacía |
| Evolution, partida nueva | `index.html`, flag activo | 1366×768 | Igual que arriba, layout aún correcto |
| Evolution, partida nueva | `index.html`, flag activo | 1024×768 | C2: layout roto, controles cortados |
| Evolution, partida nueva | `index.html`, flag activo | 390×844 | C4: escena fuera del viewport visible |
| Civilización, demo `new` | `remaster-demo.html?scenario=new` | 1920×1080 | C3: apenas distinguible de `industrial` |
| Civilización, demo `intermediate` | `remaster-demo.html?scenario=intermediate` | 1920×1080 | Mejor caso visual de la app; choque de estilo SVG/raster |
| Civilización, demo `industrial` | `remaster-demo.html?scenario=industrial` | 1920×1080 | C3: casi idéntico a `new` |
| Civilización, demo `industrial` | `remaster-demo.html?scenario=industrial` | 1024×768 | Layout de dos columnas se mantiene correcto (a diferencia de Evolution) |
| Civilización, demo `industrial` | `remaster-demo.html?scenario=industrial` | 390×844 | Truncamiento de etiquetas de distrito, mapa recortado en los bordes |
| Civilización, demo `aquatic` | `remaster-demo.html?scenario=aquatic` | 1920×1080 | Override de especie visible sólo alrededor de Town Center |
| Clásico, control | `index.html`, flag apagado | 1920×1080 / 390×844 | Confirma que el bug de Message Log en móvil es preexistente, no del remaster |

Las capturas se generaron con Playwright/Chromium en un servidor estático
local temporal y no se han incorporado como archivos al repositorio.
