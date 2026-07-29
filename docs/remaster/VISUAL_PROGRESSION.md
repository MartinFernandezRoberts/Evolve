# Progresión visual del asentamiento

`config/visual-progression.js` resuelve una capa de lectura para el diorama a partir de `TownSnapshot` inmutable. No añade estado a partidas, no escribe en el motor y no calcula costes, producción, asequibilidad ni desbloqueos.

Las etapas `wilderness`, `camp`, `first-homes`, `frontier`, `village`, `town`, `industrial`, `electrified` y `advanced` usan edificios y distritos ya confirmados por el snapshot. Las eras avanzadas proceden exclusivamente de la era ya publicada por `actions.tech`; no hay un reloj ni una tabla paralela de tecnologías. Un cambio `count: 0 -> 1` activa las animaciones breves existentes: el renderer conserva el estado anterior por ID y no crea un sprite por cada unidad. El detalle completo de Sentience a Civilización está en [SETTLEMENT_GROWTH.md](SETTLEMENT_GROWTH.md).

La densidad se expresa mediante un nivel visual de hasta tres anexos, badge de cantidad y variación de distrito. Carreteras y luz cambian sólo después de que el snapshot informe la población/tecnología correspondiente. Especies, bioma, estación, clima y rasgos planetarios continúan pasando por las capas ambiental y de habitantes existentes, sin simular población individual.

## Presupuesto y diagnóstico

La actualización del snapshot está desacoplada del frame rate por el gestor existente. El árbol SVG se reconstruye sólo cuando cambia su estructura; sprites y recursos se actualizan de forma diferencial. No hay temporizadores nuevos ni bucle `requestAnimationFrame` del remaster. Con pestaña oculta, reduced motion o equipo de baja potencia se pausa o simplifica el movimiento.

Para inspección de desarrollo, añadir `?remasterMetrics=1` a la URL muestra tiempo del último update, número de nodos SVG y heap cuando el navegador lo expone. El FPS no se inventa: la escena usa animaciones CSS y no mantiene un loop de render propio.
