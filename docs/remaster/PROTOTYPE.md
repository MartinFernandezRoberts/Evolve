# Prototipo interactivo del pueblo

## Propósito y límites

`remaster-demo.html` es una página aislada para evaluar la dirección visual. Sólo consume `src/remaster/config/town-map.js`, que contiene datos mock explícitos. No importa módulos del motor, no lee/escribe `localStorage`, no modifica `global`, no compra edificios y no altera guardados.

Los SVG del mapa y de los edificios temporales son formas originales escritas para este fork. No se han descargado ni incorporado assets de terceros.

## Abrir la demo

Desde la raíz del repositorio:

```powershell
npm run build-win
npm run serve
```

Abrir `http://localhost:4400/remaster-demo.html` (o el puerto informado por `servehere`). La interfaz clásica sigue en `http://localhost:4400/index.html`.

La página necesita el bundle generado `evolve/remaster-demo.js`; `npm run build-win` lo crea desde `src/remaster/demo.js`.

## Interacción disponible

- Botones, rueda del ratón, `+`, `-` y `0` para zoom/restablecer vista.
- Arrastrar el terreno para desplazar el mapa.
- Hover, foco de teclado, `Enter` o `Espacio` para seleccionar distritos.
- Tooltip, panel lateral y estado accesible de la selección.
- Soporte de reducción de movimiento mediante `prefers-reduced-motion`.

## Pruebas manuales de resolución

Revisar la demo en 1920×1080, 1366×768, 1024×768 y 390×844. En anchos menores de 960px el panel pasa debajo del mapa; en móvil la cabecera, recursos y controles reducen su densidad sin ocultar la selección.

## Siguiente integración

`TownScene` recibe un `TownSceneSnapshot` documentado con JSDoc. El futuro adaptador del motor deberá producir ese contrato y delegar las acciones a la ruta original descrita en `ENGINE_INTEGRATION.md`; no debe reutilizar los datos mock ni añadir fórmulas a la escena.
