# Cobertura motor/wiki para el remaster

> Inventario de Checkpoint 1. La wiki es un catálogo de documentación y
> referencias, nunca una fuente de reglas ni una superficie que se raspe en
> tiempo de ejecución. `src/` y sus funciones originales siguen siendo la
> autoridad ejecutable.

## Orden de autoridad

1. Motor y estado: `src/vars.js`, `src/actions.js`, `src/main.js`,
   `src/functions.js`, `src/jobs.js`, `src/resources.js`, `src/tech.js` y los
   módulos de región.
2. Definiciones: `actions`, `races`, `genus_def`, `biomes`, `planetTraits`,
   `universe_types`, desafíos, perks y resets.
3. Localización: `src/locale.js` y `strings/strings*.json`.
4. Catálogo de explicación: módulos fuente de `src/wiki/`.

## Matriz de cobertura

| Fase / opción | Contenido real | Definición o ruta de motor | Referencia wiki | Gráfico actual | Pendiente | Fallback |
| --- | --- | --- | --- | --- | --- | --- |
| Inicio de partida | `newGameData()` inicia `race.species = protoplasm`; `initTabs()` abre la pestaña correspondiente | `vars.js:newGameData`, `index.js:initTabs/loadTab` | `wiki/gameplay.js`, `wiki/basics.js` | `EvolutionScene` al activar el flag | Controles de recursos RNA/DNA | Evolución clásica |
| Evolución celular | RNA, DNA, membrana, orgánulos, núcleo, eucariota y mitocondria | `actions.evolution`, condiciones y acciones; desbloqueo en `main.js:fastLoop` | `wiki/structures.js:prehistoricPage`, `wiki/species.js` | Escena de lectura por fase | Nodos y acciones delegadas | Tarjetas de Evolution |
| Selección de género | Ramas animal, vegetal, fungi, insectoid, aquatic, etc. y sus requisitos | `actions.evolution`, `genus_condition`, `races.js:genus_def` | `wiki/species.js:evolutionPath` | Mantiene el contexto real en `EvolutionSnapshot` | Visualización de árbol y bloqueo | Tarjetas originales |
| Sentiencia | Acción original disponible tras su condición; escoge o prepara especie y llama a `sentience()` | `actions.evolution.sentience`, `actions.js:sentience` | `wiki/species.js`, `wiki/structures.js` | `SentienceTransitionScene` cuando `sentience.condition()` es verdadera | Confirmación/selección gráfica delegada | Acción clásica |
| Selección avanzada de especie | Especies extinguidas, synth/custom/hybrid y menú final | `raceList`, `evoExtraState`, acciones dinámicas `evolution-*` / `evolution-s-*` | `wiki/species.js`, `wiki/mechanics.js` | Sin ruta dedicada | Selector por catálogo real | Menú clásico |
| Genes y desafíos | Genes de desafío, modos y escenarios; sus flags cambian la partida | `challengeList`, `advancedChallengeList`, `setChallengeScreen`, `evoProgress` | `wiki/challenges.js`, `wiki/crispr.js` | Snapshot conserva el contexto; sin UI | Paneles de desafío y advertencias | Pantalla clásica |
| Sentiencia y asentamiento | Recursos iniciales, empleos, gobierno, ciudad, calendario y tecnología club | `sentience()`, `defineResources`, `defineJobs`, `defineGovernment`, `actions.city` | `wiki/gameplay.js`, `wiki/government.js`, `wiki/structures.js` | `EarlySettlementScene` hasta una estructura construida | Construcción/empleos iniciales en mapa | City clásico |
| Civilización planetaria | Edificios, recursos, trabajadores, tecnología, energía, moral, gobierno | `drawCity`, `actions.city`, `checkCityRequirements`, `checkAffordable`, `runAction`, `jobs.js` | `wiki/structures.js:planetaryPage`, `wiki/tech.js`, `wiki/government.js` | `CivilizationTownScene` existente | Cobertura de edificios no registrados | Town y tarjetas clásicas |
| Bioma, planeta y rasgos | Bioma, rasgos, geología, estación y clima | `races.js:biomes/planetTraits`, `actions.js:setPlanet`, `seasons.js` | `wiki/planets.js` | Town existente consume datos en Civilización; fase inicial muestra contexto | Arte específico por todos los rasgos | Texto clásico |
| Universo | Efectos y rutas de universo sin duplicar reglas | `space.js:universe_types`, `global.race.universe` | `wiki/universes.js` | Universo expuesto en `RaceSnapshot` | Temas visuales no mecánicos | UI clásica |
| Resets y prestigio | MAD, Bioseed, black hole, ascensión, cataclismo y posteriores | `resets.js`, `vars.js` y módulos regionales | `wiki/resets.js`, `wiki/prestige.js`, `wiki/perks.js` | No soportado deliberadamente | Slice independiente por reset | UI clásica |
| Espacio, Interstellar, Galaxia, Portal, Tau Ceti y Eden | Estructuras y acciones regionales | `space.js`, `portal.js`, `truepath.js`, `edenic.js` | `wiki/structures.js`, `wiki/projects.js`, `wiki/hell.js` | `UnsupportedPhaseScene` | Arquitectura y adaptadores propios | UI clásica |
| Importar/exportar, opciones y locales | Save Base64/UTF-16 original, ajuste externo del remaster, cambio de idioma | `functions.js:window.importGame/exportGame`, `locale.js`, `index.js` | `wiki/faq.js`, `wiki/gameplay.js` | No interceptado | Harness de navegador con saves sanitizados | Flujo original |

## Checkpoint 2 update: playable Evolution

`EvolutionScene` now consumes all currently available entries of
`actions.evolution` through `EvolutionSnapshot`, rather than carrying a list
of cellular upgrades, genera, species, or challenges. The snapshot exposes
real visible resources, net resource change, `evolution.final`, actual costs
from `actionDesc()`, affordability from `checkAffordable()`, `reqs`, grants,
emblems, and active challenge state.

| Content | Engine source | Graphical coverage | Explicit fallback |
| --- | --- | --- | --- |
| RNA/DNA and cellular actions | Initial `actions.evolution` definitions | Generic interactive node and original dispatcher | Classic Evolution cards |
| Genus decisions and branches | `genus_condition`, `genus_def`, `reqs` and grants | Dynamically discovered after original conditions pass | Classic Evolution cards |
| Special, extinct, synth, custom and hybrid species | Dynamic entries built from `raceList` / `evoExtraState` | Dynamically discovered after original conditions pass | Original selection/menu flow |
| Challenge and scenario entries | `challengeList`, `advancedChallengeList`, `setChallengeScreen` | Active state and original action when visible | Original challenge screen |
| Sentience | `actions.evolution.sentience` then `sentience()` | Final node delegates to the original transition | Classic Sentience action |

The runtime `coverage` matrix iterates every live definition in
`actions.evolution`. Each one is either a generic executable node or declares
`classic-hidden-until-available` / `classic-unsupported`; hidden branches are
not pre-revealed. See [EVOLUTION_SCENE.md](EVOLUTION_SCENE.md).

## Checkpoint 3 update: perfiles visuales de raza y planeta

| Contexto real | Fuente de ids | Cobertura gráfica | Fallback |
| --- | --- | --- | --- |
| Géneros y especies | `races.js:genus_def` y `races` | `RaceVisualProfileRegistry` se genera para cada id y compone arquitectura, residentes, viviendas, emblema y landmark. | Perfil adaptable visible para género o especie futura. |
| Biomas | `races.js:biomes` | `BiomeVisualProfileRegistry` genera terreno, agua, vegetación, paleta y capa SVG original por cada id. | Terreno templado neutral. |
| Rasgos planetarios | `races.js:planetTraits` y `city.ptrait` | `PlanetOverlayRegistry` genera overlays decorativos de mineral, toxicidad, vegetación, tormenta y luz. | Overlay neutral sin efecto mecánico. |
| Tecnología y edificios | Era ya preparada desde `actions` y `TownSnapshot.visualBuildings` | Piel de era y densidad/actividad visual con datos ya existentes. | Era neutral para id futuro. |
| Estación y clima | `city.calendar` / `seasons.js` | Lluvia, nieve, viento y tintes estacionales a partir de los códigos originales. | Ambiente templado si no hay código conocido. |

La cobertura se genera mediante `createVisualProfileCoverageFixtures()` con las
definiciones inyectadas por el adaptador. Incluye todos los ids, fallback,
acuático en desierto y un snapshot vacío posterior a reset. Ninguna fila añade
reglas ni sustituye la UI clásica.

## Rutas de acciones clásicas que deben conservarse

| Intención futura | Punto clásico | Integración permitida |
| --- | --- | --- |
| Ejecutar una evolución, tecnología o estructura | `runAction()` | Wrapper estrecho de `actions.js`, con requisitos, cola y `postBuild()` originales. |
| Comprobar requisito o disponibilidad | `condition()`, `check*Requirements()`, `checkAffordable()` | Resultado preparado en un snapshot; nunca se copia la fórmula. |
| Pagar costes | `payCosts()` / `adjustCosts()` dentro de la acción | No exponer una implementación visual. |
| Elegir raza o ejecutar sentiencia | Acción dinámica de `actions.evolution` → `sentience()` | Wrapper que conserve el camino original. |
| Empleos y energía | `changeJobWorkers()` / `setActionPower()` | `GameActionBridge` existente para Civilización. |
| Importar/exportar/reset | APIs y flujos originales | No interceptar, mutar ni serializar datos visuales. |

## Decisiones de alcance

- `UnsupportedPhaseScene` no intenta representar la wiki ni inventar una ruta
  para una región. El clásico es una capacidad, no un error.
- La escena de transición se activa desde la condición original de sentiencia,
  no desde una cantidad de DNA/RNA escrita en el remaster.
- La distinción asentamiento/Civilización usa sólo la presencia de una
  estructura `actions.city` ya construida. No depende de especie, población,
  bioma, desafío o planeta.
- Las futuras filas de la matriz se añaden antes de habilitar controles de una
  nueva fase, con referencia al módulo de motor y a su página wiki fuente.
