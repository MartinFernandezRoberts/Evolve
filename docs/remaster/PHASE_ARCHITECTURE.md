# Arquitectura gráfica por fases

> Estado: Checkpoint 1. Este fork no oficial de Evolve Idle conserva el motor,
> la interfaz clásica y todos los avisos MPL-2.0. El router no añade mecánicas,
> progreso, recursos ni persistencia.

## Objetivo

El remaster deja de asumir que toda partida está en Civilización. Una sola capa
de integración clasifica el estado real y monta una escena compatible o deja la
interfaz clásica intacta. La clasificación no depende de una partida preparada,
una especie o un planeta concretos.

```text
Motor existente
  global, actions.evolution, actions.city, races, resources, jobs
       │  lecturas y condiciones originales, concentradas en actions.js
       ▼
GameStateAdapter
  createGamePhaseSnapshot(state, phaseVisualStateReader)
       │  DTOs congelados, sin referencias a global
       ▼
PhaseSceneRouter
  Evolution / SentienceTransition / EarlySettlement / Civilization / Fallback
       │
       ├─ escenas estáticas de presentación original
       └─ EarlySettlementScene / CivilizationTownScene → TownScene + GameActionBridge
```

## Clasificación de fase

`src/remaster/config/phase-routing.js` es una tabla de decisión pura. Sólo
recibe señales ya resueltas por `src/actions.js`; no evalúa costes, producción,
requisitos ni umbrales de población.

| Señal de autoridad | Escena | Motivo |
| --- | --- | --- |
| Especie `protoplasm` y `actions.evolution.sentience.condition()` falsa | `EvolutionScene` | El motor mantiene la fase de evolución activa. |
| Especie `protoplasm` y la condición original de sentiencia verdadera | `SentienceTransitionScene` | La transición está disponible; no se replica su condición. |
| Especie sentiente, `settings.showCity`, sin ninguna estructura de `actions.city` con `count > 0` | `EarlySettlementScene` | Hay civilización real, aún sin estructura urbana construida. |
| Especie sentiente, `settings.showCity`, con una estructura real construida | `CivilizationTownScene` | Reutiliza el pueblo gráfico conectado ya existente. |
| Creación de raza/planeta, Big Bang, selección semillada incompleta, ciudad no disponible o estado incompleto | `UnsupportedPhaseScene` | No se monta nada; la ruta clásica es el fallback. |

El conteo se usa únicamente como presencia de una estructura ya construida, no
como coste, desbloqueo ni nueva regla. Las creaciones especiales (`noexport`),
selección de semilla y Big Bang no se fuerzan hacia un mapa genérico.

## Contratos inmutables

`src/remaster/adapters/phase-scene-contracts.js` define la frontera v3:

| Snapshot | Contenido | Fuente |
| --- | --- | --- |
| `PhaseSnapshot` | clase, soporte y razón de fallback | lector de fase autorizado |
| `EvolutionSnapshot` | pasos reales de `evolution`, tecnologías `evo*`, disponibilidad de sentiencia | estado y condición original |
| `RaceSnapshot` | id, nombre localizado, grupo, universo y semilla | `global.race` y `races` a través del puente |
| `EnvironmentSnapshot` | bioma, rasgos, estación, clima, temperatura, viento y día codificados | `city`/calendario existente |
| `SettlementSnapshot` | población y estructuras ya construidas | recursos y `city` existentes |
| `CivilizationSnapshot` | `TownSnapshot` v5 desde asentamiento inicial hasta Civilización | adaptador de ciudad existente |

`createGamePhaseSnapshot()` recibe un estado como argumento y un
`PhaseEngineReader`. Los módulos bajo `src/remaster/` no importan `global`; el
único cruce autorizado está en `src/actions.js` mediante
`phaseVisualStateReader`. El resultado y sus descendientes están congelados.

## Escenas y ciclo de vida

- `EvolutionScene` y `SentienceTransitionScene` son tarjetas SVG/CSS originales
  de sólo lectura. `EarlySettlementScene` y `CivilizationTownScene` envuelven
  el mismo `TownSceneManager`: el primero no muestra una ciudad preconstruida y
  ambos reciben las acciones originales.
- `UnsupportedPhaseScene` es intencionalmente vacío: no crea raíz, listener ni
  temporizador. La interfaz clásica sigue siendo la única UI para esa etapa.
- `PhaseSceneRouter` destruye la escena saliente antes de montar una nueva. Los
  listeners de idioma del shell estático se eliminan al destruirse; Civilización
  conserva su limpieza previa de listeners, SVG e intervalo.

El router se invoca al final de `drawEvolution()` y `drawCity()`, después de
que el motor haya construido la vista clásica. No crea un game loop ni toca
`main.js`. Cambiar de fase, importar, volver a una pestaña o alternar la vista
no recarga la página, no reinicia el worker ni modifica `global.settings`.

## Puente de acciones

La arquitectura deja dos direcciones explícitas:

```text
lectura:  Engine → GameStateAdapter → snapshots inmutables → escenas
intención: escena → GameActionBridge → wrappers de actions.js → motor original
```

En Checkpoint 1 sólo `CivilizationTownScene` recibe el puente ya existente. Las
futuras interacciones de Evolution, selección de raza, planeta, desafíos y
resets deberán añadir métodos pequeños al puente de `actions.js`; nunca deben
invocar `action()` directamente ni escribir en `global`.

## Verificación de esta fase

`test/remaster/integration-contract.test.js` cubre las cinco rutas del router
puro, la congelación del snapshot y la coexistencia con las pruebas de save,
acciones y locales. Las comprobaciones de navegador siguen siendo:

1. partida nueva → Evolution;
2. condición de sentiencia disponible → transición;
3. especie sentiente sin edificio → asentamiento inicial;
4. especie sentiente con edificio → pueblo de Civilización;
5. creación especial o fase no cubierta → clásico;
6. importación y toggle de vista sin cambiar la partida ni la preferencia.
