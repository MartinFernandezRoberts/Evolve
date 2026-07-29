# Controles interactivos del remaster

## Frontera de comandos

La escena sigue leyendo exclusivamente `TownSnapshot`, pero recibe un
`GameActionBridge` inmutable inyectado por `TownSceneManager`. Los componentes de
`src/remaster/` llaman esos callbacks y no importan `global`, `actions` ni
`jobs`.

| Intención visual | Función de integración | Ruta de motor reutilizada |
| --- | --- | --- |
| Construir 1, 5 o 10 | `runVisualCityBuild()` | `runAction()` -> `c_action.action()` -> `payCosts()`/`postBuild()` |
| Encender o apagar | `setVisualCityPower()` | `setActionPower()` |
| Asignar o retirar un trabajador | `setVisualCityWorkers()` | `changeJobWorkers()` |
| Volver a controles clásicos | `openVisualClassicPanel()` | Selector de vista clásica existente |

`runAction()` admite una cantidad explícita sólo para este puente: sustituye el
multiplicador de teclado y conserva la lógica original de acciones,
requisitos, costes, inflación y cola, incluida la tecla Q si está activa. No se
muestra construir máximo porque la ruta de ciudad actual no ofrece esa
semántica nativa.

## Contrato `TownBuildingDetail`

Cada entrada de `TownSnapshot.visualBuildings` puede incluir `detail` cuando
procede del motor real. El contrato JSDoc en
`src/remaster/adapters/town-scene-contracts.js` contiene:

- Descripción y efecto originales, convertidos a texto antes de la escena.
- Filas de coste (id, texto, importe si el renderizador lo expone y estado)
  generadas por `actionDesc()` y resultado de `checkAffordable()`.
- Cantidad activa, energía resultante de `powered()`, empleos asociados, cola y
  recursos marcados como faltantes por el renderizador original.
- Multiplicadores permitidos; `maxBuild` sólo sería verdadero si el motor
  ofreciera esa semántica.

La escena presenta esos datos sin consultar `global` ni recalcular fórmulas.
Después de un comando, el gestor pide un snapshot inmediato; el muestreo normal
de un segundo sigue atendiendo los cambios del game loop. El panel conserva el
foco por `data-town-focus` durante esas actualizaciones. Las compras fallidas
se publican mediante el `messageQueue()` original.

## Harness de paridad

`src/remaster/adapters/town-action-parity-harness.js` compara la misma
operación en dos copias aisladas de una partida. Capture cada resultado con
`captureTownActionParityState(snapshot, buildingId)` y compárelos con
`compareTownActionParity(graphical, classic)`. Para el save exportado, el
entorno de prueba debe decodificarlo con el mecanismo existente y pasarlo a
`captureTownSaveParityState(saveState, buildingIds)`. El resultado cubre
cantidad, energía, cola, recursos, empleos y estructuras sin introducir un
segundo motor de pruebas.
