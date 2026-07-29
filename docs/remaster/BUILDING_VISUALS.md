# Edificios visuales de Civilización

## Alcance y fuente de verdad

`src/remaster/config/building-visual-registry.js` contiene
`BuildingVisualRegistry`, una lista declarativa de edificios que ya existen en
`actions.city`. Sus posiciones, sprites SVG propios, niveles y decoraciones son
sólo composición visual. No participan en costes, producción, desbloqueos ni
guardados.

El integrador de `src/actions.js` consulta por cada id las funciones originales
`checkCityRequirements()`, `checkTechQualifications()`, `checkAffordable()` y el
`title` de la acción. Esos resultados llegan como `TownSnapshot.visualBuildings`;
los módulos bajo `src/remaster/` no importan ni consultan el estado del motor.

| Id original | Distrito | Sprite SVG original |
| --- | --- | --- |
| `basic_housing` | Viviendas | Grupo de casas |
| `farm` | Agricultura | Parcelas y rueda de agua |
| `lumber_yard` | Bosque y madera | Aserradero |
| `rock_quarry` | Cantera y minería | Frente de cantera y grúa |
| `mine` | Cantera y minería | Galería y vagoneta |
| `library` | Ciencia y educación | Biblioteca |
| `university` | Ciencia y educación | Universidad con cúpula |
| `temple` | Religión | Templo |
| `garrison` | Ejército | Cuartel; equivalente de barracks en Civilización |
| `foundry` | Industria | Fundición |
| `factory` | Industria | Fábrica |
| `coal_power`, `oil_power`, `fission_power` | Industria | Variantes de central eléctrica |

## Estados de presentación

- **Bloqueado:** no se añade un sprite ni marcador: queda sólo el terreno del
  distrito. Al pasar de bloqueado a disponible, la parcela recibe un destello
  breve.
- **Desbloqueado sin construir:** se muestra una parcela disponible. Si la
  comprobación original de asequibilidad devuelve falso, aparece un marcador de
  suministro decorativo; no calcula ni deduce qué recurso falta.
- **Construido:** se muestra un único edificio por tipo y un contador `×N`.
  Para edificios con `on`, un valor cero atenúa luces, humo y maquinaria; este
  estado sólo representa el valor ya presente en el snapshot.

## Escala sin multiplicar sprites

Nunca se genera un sprite por cada unidad. El registro aplica umbrales visuales
declarativos por familia (compacta, cívica o industrial), hasta cuatro niveles.
El nivel añade como máximo tres anexos o elementos secundarios. La cantidad real
permanece visible en el contador y la suma del distrito determina una clase de
densidad `open`, `sparse`, `settled` o `dense` puramente decorativa.

Una subida de cantidad reemplaza sólo el SVG de ese edificio, actualiza su
contador y reproduce una animación breve. El mapa, los nodos restantes y los
listeners no se reconstruyen. Humo, luces, ruedas, estandartes, patrullas y agua
son animaciones CSS sin efectos en el motor y se reducen mediante
`prefers-reduced-motion`.
