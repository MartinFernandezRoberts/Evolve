# Arquitectura del remaster visual

> Estado: propuesta inicial, sin implementación de la escena.
>
> Este es un fork no oficial de Evolve Idle. El remaster preserva el motor original y los avisos MPL-2.0; no está afiliado a Peter Motschmann ni a Nintendo.

## Arquitectura encontrada

`index.html` carga dependencias externas de jQuery, Vue 2 y Buefy, además de `evolve/main.js`. Ese archivo es el bundle generado desde `src/main.js` con esbuild.

La aplicación no tiene un árbol Vue único que contenga toda la interfaz. `src/index.js` construye el esqueleto DOM/tabs y `mainVue()` crea el bind principal de los ajustes. `src/functions.js` expone `vBind()`, que crea y destruye instancias Vue 2 puntuales. `src/main.js` llama `index()`, `mainVue()`, `defineJobs()`, `defineResources()` e `initTabs()` durante el arranque.

La ciudad es una proyección de `actions.city` en `src/actions.js`, no un modelo independiente. `drawCity()` filtra cada entrada con `checkCityRequirements()`, la agrupa por distrito si `cLabels` está activo y la materializa con `addAction()`/`setAction()` dentro de `#city`. Cada tarjeta recibe un bind Vue propio y su clic entra a `runAction()`; éste aplica multiplicadores, colas y `postBuild()` antes o después de que la acción concreta ejecute `payCosts()` e `incrementStruct()`.

El estado de juego reside en el objeto exportado `global` de `src/vars.js`. El motor lo actualiza principalmente en `fastLoop`, `midLoop` y `longLoop` de `src/main.js`; `modRes()` en `src/functions.js` centraliza gran parte de los cambios de recursos rastreados. Un Web Worker existente (`evolve/evolve.js`) programa los ticks y envía sus mensajes al hilo principal, que ejecuta `execGameLoops()`.

## Capas propuestas

```text
Motor Evolve existente
  vars.js, actions.js, jobs.js, resources.js, main.js, funciones de coste/cola
       | lecturas y llamadas delegadas, sin fórmulas copiadas
Adaptador del remaster
  snapshots de ciudad, disponibilidad, costes y acciones de despacho
       | DTOs inmutables y eventos de UI
Escena gráfica de Civilización
  composición del mapa, cámara, render y actualización visual diferencial
       | selección, foco y accesibilidad
Componentes interactivos
  nodos de edificios, panel de detalle, HUD resumido, selector de modo
       | SVG/CSS/bitmaps originales
Assets y configuración
  manifest de assets, temas por bioma, flag y preferencias versionadas
       | pruebas unitarias, smoke build y pruebas manuales
Pruebas
  adaptador, equivalencia de acciones, regresiones de guardado/UI clásica
```

### Motor original

Permanece como única autoridad de reglas. Conserva todas las mutaciones de estado, `actions.city`, `checkAffordable`, `payCosts`, `adjustCosts`, `runAction`, colas, recursos, eventos, resets y serialización. El remaster no reimplementa condiciones, costes, producción ni efectos de edificios.

### Adaptador de estado

Un módulo futuro, por ejemplo `src/remaster/civilization-adapter.js`, puede construir un snapshot sólo de lectura para la fase planetaria:

- recursos visibles: nombre localizado, `amount`, `max`, `diff` y estado de visualización;
- población, empleo y datos ambientales ya calculados por el juego;
- edificios de `actions.city` que superen `checkCityRequirements()`, con título/effect originales, contador, categoría, estado de energía y asequibilidad obtenida mediante `checkAffordable()`;
- costes calculados con la función original `adjustCosts()`, nunca a partir de una copia de fórmulas;
- identificadores estables de acción y de edificio, no referencias DOM de la interfaz clásica.

El adaptador debe tener dos superficies separadas: `readSnapshot()` y comandos de intención. Para construir, el comando debe delegar a una pequeña API pública que envuelva `runAction(actions.city[id], 'city', id)`. Ese wrapper conserva multiplicadores de tecla, cola de construcción, inflación, `postBuild()` y redibujos existentes. No se debe llamar directamente a `action.action()` ni mutar `global.city`/`global.resource` desde la escena.

La inspección de detalle puede reutilizar `actionDesc()` mediante un wrapper de presentación o mostrar las cadenas `title`, `desc` y `effect` de la acción original. El primer enfoque evita que el remaster cree descripciones y números alternativos.

### Escena gráfica

La escena se monta sólo si el flag está activo y se limita inicialmente a Civilización planetaria. Una raíz propia, por ejemplo `#visual-remaster-root`, debe ser hija de `#city` pero no de los contenedores `#city-dist-*`; así `drawCity()` puede seguir redibujando sus tarjetas clásicas. Cuando el tab se recrea, el controlador vuelve a montar la raíz.

El controlador visual puede leer el snapshot en una cadencia visual limitada mientras esté montado y no pausado por la visibilidad del documento. No crea un segundo game loop ni modifica recursos. `drawCity()`/`postBuild()` son puntos de invalidación de estructura; los cambios frecuentes de recursos se detectan con un snapshot ligero y render diferencial.

La escena conoce posiciones y variantes artísticas por tipo de edificio, bioma y nivel visual. Esas decisiones son puramente de presentación: no se guardan coordenadas de juego ni se convierten en una nueva lógica de desbloqueo.

### Componentes interactivos

- Nodo de edificio: foco de teclado, nombre localizado, contador, estado de energía, asequibilidad y comando de construcción delegado.
- Panel de detalle: costes/effect originales, estado de cola y acceso a las opciones especiales existentes.
- HUD: sólo recursos y datos del snapshot; la barra clásica permanece disponible.
- Selector clásico/remaster: no cambia el estado de la partida y tiene retorno inmediato al modo clásico.

La interacción debe mantener equivalencia funcional con la tarjeta clásica: un clic de construcción, acciones en cola, modificadores de cantidad, tooltips y accesibilidad.

### Assets y configuración

Los assets estarán bajo una carpeta de fuente nueva, por ejemplo `src/remaster/assets/`, con manifest, procedencia y licencia por archivo. Sólo se aceptan SVG/CSS/placeholders propios o imágenes generadas para este fork. La preferencia del flag debe almacenarse fuera de `global.settings` y de la cadena `evolved`, en una clave local versionada como `evolve.remaster.ui.v1`; así no cambia el esquema de guardado, exportación ni importación del juego.

### Pruebas

Primero pruebas sin dependencias pesadas para el adaptador: edificios visibles, costes delegados, asequibilidad, contadores y despacho. Añadir después pruebas de navegador para alternar modos y comprobar que una compra produce el mismo estado que el control clásico. El build de Windows es el smoke test obligatorio de cada cambio.

## Evaluación del renderizador

| Alternativa | Ventajas | Coste/riesgo | Decisión |
| --- | --- | --- | --- |
| DOM + SVG | Accesible, integrable con Vue 2/jQuery, inspectable, sin dependencia y adecuado para decenas de nodos. | Animación y efectos complejos menos eficientes que canvas. | Recomendada para el MVP. |
| Canvas 2D | Bueno para partículas, fondos y muchas animaciones. | Hit-testing, tooltips, foco, semántica y responsive deben reconstruirse; duplica trabajo de UI. | Posponer; útil sólo si una medición muestra límite de SVG. |
| PixiJS | WebGL, atlas y efectos eficientes para escenas grandes. | Dependencia grande, pipeline de assets, más acoplamiento y menor valor en el MVP. | No añadir sin prototipo medido que justifique Canvas/WebGL. |

La recomendación es SVG semántico sobre DOM para el mapa y nodos, CSS para capas, sombras y transiciones, y una lista DOM accesible como alternativa paralela. Este enfoque satisface el alcance inicial sin dependencia gráfica nueva; Canvas o PixiJS serán decisiones posteriores basadas en perfilado y requisitos concretos.

## Punto de extensión menos invasivo

El punto principal es `drawCity()` en `src/actions.js`: ya es el lugar que conoce cambios de requisitos, tecnologías y edificios visibles, y no exige reescribir el motor ni alterar `src/main.js`. La extensión futura debe montar/invalidar una raíz visual al final de esa función cuando el flag esté activo; cuando esté apagado, no debe cambiar el camino actual.

Para las acciones interactivas hace falta un cambio mínimo adicional y explícito: exportar desde `src/actions.js` un wrapper de `runAction()` para la ciudad. El adaptador lo invocará y no conocerá las mutaciones internas. La actualización visual frecuente queda dentro del controlador de escena mediante snapshots, evitando instrumentar `fastLoop()` en `src/main.js`.

## Compatibilidad

- No se modifica `global`, el contenido de `evolved`, ni el formato Base64/UTF-16 de importación/exportación.
- La interfaz clásica sigue siendo fuente de verdad y fallback funcional.
- Cambios de idioma, raza, planeta, tecnología, reset, partida importada o cambios de pestaña desmontan/reconstruyen sólo la capa visual; no recalculan el juego.
- El bundle sigue construido por esbuild y los estilos por LESS, compatible con los comandos Windows existentes.
