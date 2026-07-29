# Pipeline de assets locales

## Alcance

El remaster distribuye un subconjunto mínimo de assets CC0 de Kenney. Los packs completos no se incluyen. Cada PNG usado está versionado bajo `src/remaster/assets/kenney/`, su licencia incluida permanece en la carpeta del pack y `manifests/assets.json` aporta procedencia, página oficial, checksum SHA-256, fecha, modificación y uso.

Los packs curados son: Isometric Tiles Landscape, Isometric Roads, Isometric Tiles Buildings, Isometric Miniature Farm y UI Pack Adventure. Las referencias oficiales y el crédito están en `CREDITS.md`; las licencias en `THIRD_PARTY_LICENSES.md` y en las copias incluidas.

## Flujo

1. Verificar la licencia desde la página oficial antes de descargar.
2. Seleccionar sólo los archivos usados y copiar también el texto de licencia.
3. Registrar cada PNG en `manifests/assets.json`, incluyendo su SHA-256.
4. Usar la ruta lógica en `assets/kenney-assets.js`, nunca una URL remota.
5. `buildRemasterAssets.js` copia el subconjunto a `evolve/remaster-assets/kenney/` al ejecutar `npm run evolve` o `npm run evolve-debug`. Ese directorio es generado y no se versiona.

No se admite descargar assets en el navegador. Las imágenes se precargan sólo al montar la escena; los sprites de edificios se cargan de forma diferida al aparecer desbloqueados o construidos.

## Revisión artística y legal

La composición del mapa, recorridos, SVG de overlays y CSS son originales del fork. Los assets no se usan para recrear un mapa, personaje, logo o estética identificable de Nintendo o Donkey Kong Country. Toda incorporación futura debe mantener esta política y actualizar manifest, créditos y licencias.
