# Perfiles visuales de raza, bioma y planeta

## Propósito

La apariencia del pueblo es una composición de presentación. No es un mapa por
especie, no contiene condiciones de juego y no se guarda en `evolved`:

```text
BaseSettlementLayout
  + BiomeVisualProfile
  + RaceVisualProfile
  + SpeciesVisualOverrides (opcional)
  + TechnologyEraVisualRegistry
  + PlanetOverlayRegistry
  + WeatherAndSeasonProfile
  + BuildingState ya presente en TownSnapshot
  = TownVisualProfile
```

`BaseSettlementLayout` conserva los diez distritos y caminos curvos del mapa
planetario. Cada perfil modifica materiales, paleta, overlays, habitantes o
decoración; nunca posiciones de juego, costes, requisitos, producción,
desbloqueos, recursos, población o guardados.

## Descubrimiento y registros

`src/remaster/adapters/game-town-adapter.js` es el único lugar de esta entrega
que importa definiciones del motor. Al cargar crea un catálogo de sesión con:

| Registro | Fuente de ids | Resultado |
| --- | --- | --- |
| `RaceVisualProfileRegistry.genera` | `genus_def` | Familia arquitectónica y de habitantes por cada género existente. |
| `RaceVisualProfileRegistry.species` | `races` | Herencia del género y una excepción decorativa opcional. |
| `BiomeVisualProfileRegistry` | `biomes` | Terreno, agua, vegetación, paleta, clima y capa SVG por bioma. |
| `TechnologyEraVisualRegistry` | `TownSnapshot.context.technologies[].era` | Tono de construcciones y luz para era conocida o futura. |
| `PlanetOverlayRegistry` | `planetTraits` | Overlay ambiental por rasgo planetario. |

Los ids no se mantienen en una lista manual de cobertura. Los constructores
recorren las definiciones inyectadas y crean una entrada para cada una. Las
tablas internas de familia sólo asignan lenguaje visual; si el motor añade un
género, especie, bioma, rasgo o era que no tenga variante dedicada, recibe un
perfil genérico estable y visible.

Los componentes de `src/remaster/components/` no importan estas definiciones,
no consultan `global` y no conocen ids de especie. Sólo consumen
`TownSnapshot.context.visual`.

## Familias artísticas

Los géneros existentes se resuelven en familias de apariencia: humanoide,
mamífero/carnívoro/herbívoro, pequeño, gigante, reptiliano, aviar, artrópodo,
acuático, vegetal, fungi, feérico, térmico, polar, desértico, infernal,
celestial, sintético, eldritch e híbrido. Una familia describe, por ejemplo,
material, forma de vivienda, emblema, landmark, animación y arte abstracto de
habitantes. No cambia sus rasgos ni efectos.

`SpeciesVisualOverrides` es deliberadamente pequeño. En esta entrega
`octigoran` hereda el perfil acuático y añade cúpula de marea, jardín de
tentáculos y emblema espiral. Esa variante sólo añade canales, estanques y arte
abstracto; incluso en desierto, el bioma continúa aportando dunas y paleta
árida mientras la especie conserva sus canales. Una especie sin override
hereda por completo su género.

## Biomas, clima y rasgos

Los doce biomas actuales tienen una capa SVG original y ligera: pradera,
costa, bosque, dunas, basalto, tundra, sabana, pantano, ceniza, taiga, cinder y
jardín. Las capas están montadas una sola vez y se revelan mediante clases
resueltas; no se descargan mapas ni imágenes de terceros.

Estación, clima, temperatura y viento conservan la codificación ya publicada
por `city.calendar`. La adaptación visual sólo traduce esos códigos a lluvia,
nieve, cubierto, despejado, viento y tintes estacionales. No calcula un clima
nuevo ni una hora ficticia.

Los catorce rasgos de `planetTraits` se convierten en overlays puramente
ambientales: toxicidad, flora, brasas, tormenta, halo, magnetismo, restos,
anillos, flare, cristales, grieta, escarcha, órbita o meteoro. Los overlays no
modifican producción, supervivencia, daño, recursos ni eventos.

## Era y edificios

La era se toma de la propiedad `era` que el lector autorizado ya obtuvo de la
acción tecnológica. `foundational`, `industrialized` y `advanced` tienen pieles
dedicadas; una era futura se registra dinámicamente con apariencia neutral.
`BuildingState` resume sólo cantidades y distritos de
`TownSnapshot.visualBuildings` ya existentes para composición. No es fuente de
una regla de desbloqueo ni recalcula energía o actividad.

## Cobertura y regresión

`createVisualProfileCoverageFixtures(definitions)` en
`src/remaster/adapters/visual-profile-coverage.js` genera fixtures desde las
definiciones inyectadas. Comprueba automáticamente:

- todos los géneros, especies, biomas y rasgos definidos;
- un género, bioma, rasgo y era futuros con fallback;
- una especie acuática sobre desierto con canales preservados;
- un pueblo vacío tras reset, sin reutilizar el perfil anterior;
- que resolver el perfil no modifica el snapshot de entrada.

El adaptador exporta `createGameTownVisualProfileCoverage()` para auditoría en
una sesión real. Las pruebas de contrato usan definiciones inyectadas para que
puedan ejecutarse fuera del navegador sin importar el estado global del juego.

No se añadieron dependencias ni assets externos: los nuevos elementos son SVG
inline originales y estilos LESS fuente. El presupuesto de animación existente
sigue aplicando `prefers-reduced-motion`, pestaña oculta y modo de baja potencia.
