# Dirección de arte: pueblo de Civilización

## Intención

El pueblo debe sentirse como un diorama vivo de aventura de consola de 16 bits con fondos prerenderizados de los años 90: volúmenes suaves, sombras pintadas, color saturado, caminos que enlazan hitos y vegetación generosa. La lectura prima sobre el ornamento: cada edificio jugable se distingue de un vistazo y los recursos siguen siendo claros.

Es inspiración de lenguaje visual general, no una recreación de una obra concreta. Este fork no usa ni debe usar personajes, sprites, mapas, logotipos, nombres, música, sonidos o assets de Donkey Kong Country, Nintendo ni terceros; tampoco recrea mapas existentes.

## Composición del mapa

- Vista tres cuartos, ligeramente elevada, con profundidad por superposición y sombras de contacto.
- Un camino principal serpentea por el pueblo y ramales cortos conectan nodos de construcción; no hay cuadrícula rígida.
- Capas: terreno/base, caminos/agua, edificios, vegetación frontal, señalización e interfaz.
- El ayuntamiento o asentamiento inicial sirve como ancla visual; viviendas, industria, ciencia, comercio y defensa se agrupan de forma legible pero no simétrica.
- El mapa es una composición de presentación, no un sistema de colocación ni un mapa del mundo real.

## Paleta, materiales y luz

- Verdes profundos, turquesas, ocres cálidos, piedra azulada y acentos de cobre/dorado para estados interactivos.
- Volumen mediante degradados limitados, sombreado ambiental, bordes de luz y texturas sutiles; evitar imitar patrones reconocibles de otros juegos.
- Luz diurna cálida con sombras suaves hacia una dirección consistente. Las variaciones de estación/clima sólo reinterpretan datos existentes del juego.
- Edificios de energía, falta de recursos y cola usan estados de color/iconografía accesibles además del color.

## Lenguaje de edificios y nodos

- Siluetas fuertes y originales: vivienda, granja, almacén, cantera, taller, banco, templo, laboratorio y defensa deben reconocerse por forma antes que por texto.
- Los contadores y badges se anclan sin tapar la silueta. El estado desactivado se comunica con luz apagada, sin convertirlo en otra regla de juego.
- Los nodos usan foco visible, objetivos táctiles amplios y un nombre localizado accesible. La lista de compatibilidad asegura que ningún edificio queda sin control.

## Movimiento

- Movimiento escaso y funcional: humo, agua, luces, estandartes o partículas ambientales originales a baja frecuencia.
- Respetar `prefers-reduced-motion`; el movimiento no transmite información imprescindible sin alternativa textual.
- No añadir audio en el MVP.

## Adaptación de especie y entorno

- La familia original de la especie determina una variación de arquitectura y habitantes abstractos: acuática, mamífera, artrópoda, aviar, reptiliana, humanoide o adaptable para otros grupos. Es una capa de color, materiales y siluetas; no cambia costes, empleos ni desbloqueos.
- Las especies acuáticas usan canales, estanques, detalles húmedos y figuras abstractas. Octigoran recibe una variante de canales más amplios y tentáculos SVG originales, nunca personajes o sprites derivados de terceros.
- Estación, clima y rasgos planetarios sólo tintan, velan o decoran la escena usando los códigos ya presentes en el snapshot. No se deduce una hora del día cuando el motor no la expone.

## Producción de assets

- Priorizar composiciÃ³n SVG/CSS original sobre un subconjunto local de tiles CC0 curados de Kenney. No se cargan packs ni URLs externas en tiempo de ejecuciÃ³n; las fuentes, licencias y checksums viven en `assets/kenney/` y se describen en `ASSET_PIPELINE.md`.
- Cualquier bitmap generado debe ser nuevo para el proyecto, incluir fuente/prompt/licencia en el manifest y no contener marcas, personajes ni elementos protegidos de terceros.
- Guardar fuentes y manifiestos en la zona fuente del remaster; el build decide sus artefactos de distribución.
- Revisar cada asset por legibilidad a escala pequeña, contraste y tamaño antes de incluirlo.
