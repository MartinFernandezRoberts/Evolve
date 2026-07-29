# Prototipo interactivo del pueblo

## Propósito y límites

`remaster-demo.html` es una página aislada para evaluar la dirección visual. Sólo consume `src/remaster/config/town-map.js`, que contiene datos mock explícitos. No importa módulos del motor, no lee/escribe `localStorage`, no modifica `global`, no compra edificios y no altera guardados.

La composición, rutas, overlays SVG y CSS son originales del fork. La escena
usa además un subconjunto mínimo de assets CC0 locales de Kenney para terreno,
caminos, edificios, granja y UI. Sus licencias, créditos, páginas de origen y
checksums están en `ASSET_PIPELINE.md`, `CREDITS.md` y
`assets/kenney/manifests/assets.json`; no se descarga ningún asset en tiempo
de ejecución.

## Abrir la demo

Desde la raíz del repositorio:

```powershell
npm run build-win
npm run serve
```

Abrir `http://localhost:4400/remaster-demo.html` (o el puerto informado por `servehere`). La interfaz clásica sigue en `http://localhost:4400/index.html`.

La demo admite `?scenario=new`, `small`, `intermediate`, `industrial` o
`aquatic` para revisar los estados mock aislados. La matriz completa está en
`TEST_MATRIX.md`; el diagnóstico opcional se activa con
`?remasterMetrics=1`.

La página necesita el bundle generado `evolve/remaster-demo.js`; `npm run build-win` lo crea desde `src/remaster/demo.js`.

## Interacción disponible

- Botones, rueda del ratón, `+`, `-` y `0` para zoom/restablecer vista.
- Arrastrar el terreno para desplazar el mapa.
- Hover, foco de teclado, `Enter` o `Espacio` para seleccionar distritos.
- Tooltip, panel lateral y estado accesible de la selección.
- Soporte de reducción de movimiento mediante `prefers-reduced-motion`.

## Pruebas manuales de resolución

Revisar la demo en 1920×1080, 1366×768, 1024×768 y 390×844. En anchos menores de 960px el panel pasa debajo del mapa; en móvil la cabecera, recursos y controles reducen su densidad sin ocultar la selección.

## Integración actual

`TownScene` recibe un `TownSnapshot` documentado con JSDoc. El adaptador de juego produce el mismo contrato desde una entrada de sólo lectura y el prototipo puede abrirse también desde la pestaña de ciudad: activar **Visual Remaster** en Settings y seleccionar **Vista gráfica**. La demo conserva sus datos mock aislados.

En una partida real, el panel visual construye, alterna energía y ajusta los
empleos asociados mediante las rutas originales. La demo conserva sus mocks y
no ejecuta acciones de partida. El contrato completo está en
`TOWN_SNAPSHOT.md`.
