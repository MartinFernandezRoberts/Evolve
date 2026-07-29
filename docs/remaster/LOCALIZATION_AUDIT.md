# Auditoría de localización del remaster

## Fuente de verdad

La función original es `loc(key, variables)` en `src/locale.js`. Todas las
cadenas de la escena, el selector de vista y la demo usan esa misma función;
no se añadió una biblioteca ni un catálogo paralelo.

- El paquete base es `strings/strings.json` (`en-US`).
- Un idioma no inglés carga `strings/strings.<locale>.json` encima del paquete
  base. Una clave ausente conserva el inglés; una clave inexistente devuelve su
  propio identificador y se informa al habilitar `settings.expose`.
- La interpolación posicional usa `%0`, `%1`, etc. `loc()` no implementa un
  sistema genérico de pluralización: cada clave contiene su redacción plural.
- Los números del snapshot siguen usando `sizeApproximation()` de `vars.js`.
  Éste conserva la notación configurada y usa `Intl.NumberFormat`; la escena no
  vuelve a formatear cantidades de juego.
- `setLocale()` recarga el paquete original y emite `evolve:localechange`.
  El gestor de escena escucha ese evento, vuelve a leer el snapshot y actualiza
  su chrome sin recargar la página ni cambiar la partida.

El selector de Settings sigue siendo el mecanismo oficial para cambiar idioma.
Ahora guarda el idioma como antes y fuerza la actualización de su instancia Vue
y de la ciudad, sin terminar el worker ni recargar el documento.

## Idiomas disponibles

`en-US`, `es-ES`, `pt-BR`, `de-DE`, `it-IT`, `ru-RU`, `cs-CZ`, `pl-PL`,
`zh-CN`, `zh-TW`, `ko-KR`, `im-PL` y `ja-JP`.

Todas las claves con prefijo `remaster_` están declaradas explícitamente en
cada uno de esos archivos. `test/remaster/integration-contract.test.js` verifica
esa paridad y que los placeholders no cambien.

## Claves reutilizadas

La escena no duplica recursos, edificios, empleos ni acciones del juego. Reusa
`resource_*_name`, `job_*`, `city_*`, `construct`, `active`, `not_active`,
`queue`, `tab_resources`, `govern_*` y las descripciones/costes que ya prepara
el motor. Las claves propias se limitan al shell del mapa (`remaster_*`):
selector de vista, mapa, distritos, estados y mensajes de demo.

## Textos eliminados de `src/remaster`

Se retiraron los fallbacks visibles en inglés/español de controles, tooltips,
panel, aviso mock y selección de demo. Los literales restantes son ids de
datos mock, clases CSS, rutas de assets, símbolos (`+`, `−`, `×`) y comentarios
técnicos; no son texto de interfaz.

## Control de vista clásico/gráfico

El selector se monta como el primer hijo de `#city`, antes de las tarjetas
clásicas. Ese contenedor es estable, ya es el punto de extensión de `drawCity()`
y permite dejar intacta la navegación global y el ciclo del juego. Con la
preferencia activa muestra ambos botones, expone `aria-pressed`, funciona con
teclado y conserva el modo elegido en la preferencia versionada externa al save.
En fases fuera de `#city` no se monta la escena: la interfaz clásica permanece
como fallback y no queda un control que pueda abrir una vista no soportada.
