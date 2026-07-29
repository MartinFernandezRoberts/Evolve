# Controles interactivos del remaster

## Frontera de comandos

La escena sigue leyendo exclusivamente `TownSnapshot`, pero recibe un objeto
de comandos inyectado por `TownSceneManager`. Los componentes de
`src/remaster/` llaman esos callbacks y no importan `global`, `actions` ni
`jobs`.

| Intención visual | Función de integración | Ruta de motor reutilizada |
| --- | --- | --- |
| Construir 1, 5 o 10 | `runVisualCityBuild()` | `runAction()` -> `c_action.action()` -> `payCosts()`/`postBuild()` |
| Encender o apagar | `setVisualCityPower()` | `setActionPower()` |
| Asignar o retirar un trabajador | `setVisualCityWorkers()` | `changeJobWorkers()` |

`runAction()` admite una cantidad explícita sólo para este puente: sustituye el
multiplicador de teclado y conserva la lógica original de acciones,
requisitos, costes, inflación y cola. No se muestra construir máximo porque la
ruta de ciudad actual no ofrece esa semántica nativa.

## Contrato `TownBuildingDetail`

Cada entrada de `TownSnapshot.visualBuildings` puede incluir `detail` cuando
procede del motor real. El contrato JSDoc en
`src/remaster/adapters/town-scene-contracts.js` contiene:

- Descripción y efecto originales, convertidos a texto antes de la escena.
- Filas de coste generadas por `actionDesc()` y resultado de
  `checkAffordable()`.
- Cantidad activa, energía resultante de `powered()`, empleos asociados y cola.
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
`compareTownActionParity(graphical, classic)`. El resultado considera cantidad,
energía, cola, recursos visibles y trabajadores asociados sin modificar un save
ni introducir un segundo motor de pruebas.
