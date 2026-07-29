# Progresión visual del asentamiento

`config/visual-progression.js` resuelve una capa de lectura para el diorama a partir de `TownSnapshot` inmutable. No añade estado a partidas, no escribe en el motor y no calcula costes, producción, asequibilidad ni desbloqueos.

Los rangos `outpost`, `village`, `town`, `industrial` y `electrified` usan solamente población publicada por el snapshot y señales de tecnologías reales (`agriculture`, `steel`, `electricity`, `electronics`, `fission`). Los valores de población son umbrales de composición configurables, no reglas de juego. Un cambio de edificios ya construido/desbloqueado activa las animaciones breves existentes: el renderer conserva el estado anterior por ID y no crea un sprite por cada unidad.

La densidad se expresa mediante un nivel visual de hasta tres anexos, badge de cantidad y variación de distrito. Carreteras y luz cambian sólo después de que el snapshot informe la población/tecnología correspondiente. Especies, bioma, estación, clima y rasgos planetarios continúan pasando por las capas ambiental y de habitantes existentes, sin simular población individual.

## Presupuesto y diagnóstico

La actualización del snapshot está desacoplada del frame rate por el gestor existente. El árbol SVG se reconstruye sólo cuando cambia su estructura; sprites y recursos se actualizan de forma diferencial. No hay temporizadores nuevos ni bucle `requestAnimationFrame` del remaster. Con pestaña oculta, reduced motion o equipo de baja potencia se pausa o simplifica el movimiento.

Para inspección de desarrollo, añadir `?remasterMetrics=1` a la URL muestra tiempo del último update, número de nodos SVG y heap cuando el navegador lo expone. El FPS no se inventa: la escena usa animaciones CSS y no mantiene un loop de render propio.
