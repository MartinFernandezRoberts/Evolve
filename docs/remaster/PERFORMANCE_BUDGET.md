# Presupuesto de rendimiento: vida y ambiente

## Límite de composición

La escena no modela la población. Al montarse crea una reserva fija de SVG y
luego alterna clases y atributos sobre esa reserva.

| Perfil | Habitantes visibles | Viñetas de actividad | Partículas de clima |
| --- | ---: | ---: | ---: |
| Normal | 8 | 6 | 12 |
| Dispositivo de bajo rendimiento | 4 | 3 | 4 |
| `prefers-reduced-motion` | 0 animados | 0 animadas | 0 |

El rango visual de población es decorativo y queda limitado a ocho figuras. Un
contador alto nunca crea más nodos SVG. Los seis tipos de viñeta son agricultor,
minería, transporte, investigación, guardia e industria; cada uno usa una forma
original preasignada.

## Frecuencia y suspensión

- El adaptador conserva el muestreo de `TownSnapshot` de un segundo; no hay un
  `requestAnimationFrame` ni un temporizador propio de la capa de vida.
- Los estilos CSS animan sólo transformación, opacidad o filtro en un conjunto
  reducido de elementos. No modifican el estado del juego.
- Al ocultarse la pestaña, el gestor deja de solicitar snapshots y la escena
  pausa las animaciones. Al volver, solicita un snapshot puntual. Los eventos
  `focus` y `pageshow` repiten esta sincronización para restauraciones donde la
  visibilidad no se notifica de inmediato.
- Se usa el indicio conservador `hardwareConcurrency <= 2` o `deviceMemory <= 2`
  cuando el navegador lo expone para reducir el presupuesto. Si no lo expone,
  se mantiene el perfil normal.
- `prefers-reduced-motion` se observa en tiempo de ejecución y elimina los
  elementos animados de vida y clima, conservando el mapa y sus controles.

## Regla de implementación

No se deben crear habitantes, rutas, temporizadores ni objetos de simulación en
un tick del juego. Las capas sólo reciben el DTO de sólo lectura, comparan
contadores y reutilizan los grupos SVG creados durante el montaje. Cualquier
aumento del presupuesto requiere una prueba manual en escritorio y móvil y una
actualización de esta tabla.
