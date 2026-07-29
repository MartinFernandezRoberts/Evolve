# Auditoría de integración del remaster

## Alcance revisado

La auditoría cubre el diff completo contra `master`, con especial atención a
`src/actions.js`, `src/jobs.js`, `src/vars.js` y todos los módulos bajo
`src/remaster/`. La escena sigue siendo una consumidora de `TownSnapshot`; no
importa `global`, no escribe recursos y no implementa costes o producción.

Se verificó que los únicos valores numéricos fijos en `src/remaster/` son de
composición: coordenadas SVG, límites de densidad, zoom, rangos visuales de
población y presupuesto de animación. Los valores de mock permanecen aislados
en `config/town-map.js` y no se cargan durante una partida.

## Comprobaciones ejecutadas

| Área | Procedimiento | Resultado |
| --- | --- | --- |
| Build Windows | `npm.cmd run build-win` | Correcto. |
| Partida nueva | Perfil de navegador limpio; se exportó la partida creada. | `visualRemaster: false` y `visualRemasterView: 'scene'` por defecto. |
| Importación antigua | Se exportó la partida nueva, se retiraron ambas claves del remaster y se importó mediante `window.importGame()`. | Recarga correcta; especie, días y semilla preservados; claves restauradas con valores retrocompatibles. |
| Exportación | Se inspeccionó el Base64 generado por `window.exportGame()`. | No cambia la codificación; sólo aparecen las dos preferencias aditivas. |
| Flag y vista | Se activó y desactivó el switch de Settings; se montó el gestor aislado con snapshot mock. | El flag persiste; escena, vista clásica y desmontaje devuelven el DOM/timer a cero. |
| Pausa | Se pulsó `#pausegame` y se reanudó. | `settings.pause` cambió `false → true → false`. |
| Ciclo de vida | Harness de navegador con contador de `setInterval`/`clearInterval`. | Un timer en escena; cero al pasar a clásica o desactivar; listeners explícitos se eliminan al destruir. |
| Responsive | 1920×1080, 1366×768, 1024×768 y 390×844. | Mapa visible, sin overflow horizontal; en 390px el panel pasa a una columna. |
| Teclado | Foco + `Enter` sobre Viviendas y `+` sobre el mapa. | Distrito seleccionado, panel actualizado, zoom a 115% y tooltip visible. |
| Reduced motion | Chrome con `--force-prefers-reduced-motion`. | Clases de reducción activas; no se muestran habitantes ni actividades animadas. |
| Assets | Búsqueda de URL remota, data URI y nombres protegidos; revisión de SVG/CSS. | Sólo SVG/CSS original; sin assets de terceros. |

## Correcciones de endurecimiento

- Los controles de zoom ya no usan callbacks anónimos: se conservan referencias
  y se retiran explícitamente al destruir `TownScene`.
- El gestor escucha `focus` y `pageshow` además de `visibilitychange`, y limpia
  los tres listeners. Esto cubre restauraciones de pestaña que no emiten la
  señal de visibilidad esperada.

## Límite de la prueba automatizada

No existe un save de Civilización versionado en el repositorio. Por ello la
prueba de motor usó una partida nueva real para persistencia/importación y la
demo aislada para mapa, interacción y ciclo de vida. La ruta de construcción
visual se revisó por trazado (`panel → comando inyectado → runAction`) y por el
harness de paridad, pero sigue siendo recomendable añadir un fixture de save de
Civilización sanitizado para ejecutar esa paridad de extremo a extremo en CI.
