/**
 * SVG pequeños y originales para los edificios de Civilización. Son símbolos
 * de presentación propios; no son sprites, mapas ni arte de terceros.
 */

import { getKenneyTownAsset } from './kenney-assets.js';

function secondaryShapes(count, markup) {
    return Array.from({ length: count }, (_, index) => `<g class="town-building__secondary town-building__secondary--${index}">${markup(index)}</g>`).join('');
}

/**
 * @param {string} sprite Id declarado por BuildingVisualRegistry.
 * @param {{ key: string, secondary: number }} level Nivel visual ya elegido.
 * @returns {string}
 */
export function createBuildingVisualSprite(sprite, level) {
    const secondary = level.secondary;

    switch (sprite) {
        case 'housing':
            return `<g class="town-building__sprite town-building__sprite--housing"><ellipse class="town-building__shadow" cx="0" cy="27" rx="50" ry="13"/><path class="town-building__wall" d="M-40 0h34v29h-34zM2-8h39v37H2z"/><path class="town-building__roof" d="m-47 1 24-23L-1 1zM-6-7 21-33 48-7z"/><path class="town-building__light" d="M-31 11h8v10h-8zM13 5h9v11h-9zM29 5h8v11h-8z"/>${secondaryShapes(secondary, (index) => `<path class="town-building__houselet" transform="translate(${index * 17 - 16} ${30 + (index % 2) * 6}) scale(.58)" d="M-13 0h26v18h-26zM-17 0 0-15 17 0z"/>`)}</g>`;
        case 'farm':
            return `<g class="town-building__sprite town-building__sprite--farm"><ellipse class="town-building__shadow" cx="0" cy="27" rx="53" ry="13"/><path class="town-building__field" d="M-54 0h79l-9 31h-77z"/><path class="town-building__furrows" d="m-43 3-8 25M-27 2l-7 27M-11 2-5 30M5 1l-2 31"/><path class="town-building__wall" d="M29 0h23v29H29z"/><path class="town-building__roof" d="m24 0 16-18L57 0z"/><path class="town-building__wheel" d="M40 13a9 9 0 1 0 .1 0M40 4v18M31 13h18M34 7l12 12M46 7 34 19"/>${secondaryShapes(secondary, (index) => `<path class="town-building__crop" transform="translate(${-44 + index * 20} 23)" d="m0 6 5-12 5 12M5-6v17"/>`)}</g>`;
        case 'lumberyard':
            return `<g class="town-building__sprite town-building__sprite--lumberyard"><ellipse class="town-building__shadow" cx="0" cy="27" rx="51" ry="13"/><path class="town-building__pine" d="M-48 11-30-38-12 11zM-24 15-5-29 14 15z"/><path class="town-building__trunk" d="M-31 9v20M-5 13v17"/><path class="town-building__wall" d="M7 1h48v28H7z"/><path class="town-building__roof" d="m0 1 31-20L62 1z"/><path class="town-building__logs" d="M12 34h42M16 40h36"/>${secondaryShapes(secondary, (index) => `<path class="town-building__log-stack" transform="translate(${index * 13 - 11} 45)" d="M0 0h19M2 5h15"/>`)}</g>`;
        case 'quarry':
            return `<g class="town-building__sprite town-building__sprite--quarry"><ellipse class="town-building__shadow" cx="0" cy="29" rx="54" ry="14"/><path class="town-building__stone" d="m-55 23 18-43 22 15 19-32 49 55H-51z"/><path class="town-building__cut" d="M-37 13h22M-13 1H7M15 16h23"/><path class="town-building__crane" d="M20 28V-39h7v67M10-33h48M51-33v31"/>${secondaryShapes(secondary, (index) => `<path class="town-building__rock" transform="translate(${-27 + index * 18} 34)" d="m0 0 8-6 10 4-3 8H3z"/>`)}</g>`;
        case 'mine':
            return `<g class="town-building__sprite town-building__sprite--mine"><ellipse class="town-building__shadow" cx="0" cy="29" rx="51" ry="14"/><path class="town-building__stone" d="m-54 26 23-49 23 18L17-38 56 26z"/><path class="town-building__mine-mouth" d="M-17 27V6c0-23 34-23 34 0v21z"/><path class="town-building__rails" d="M-47 37h59M-42 31l6 12M-21 29l6 14M0 28l6 15"/><path class="town-building__cart" d="M14 26h29l-5 12H19zM22 41a4 4 0 1 0 .1 0M35 41a4 4 0 1 0 .1 0"/>${secondaryShapes(secondary, (index) => `<path class="town-building__rock" transform="translate(${-42 + index * 13} 44)" d="m0 0 7-5 8 4-3 7H2z"/>`)}</g>`;
        case 'library':
            return `<g class="town-building__sprite town-building__sprite--library"><ellipse class="town-building__shadow" cx="0" cy="27" rx="48" ry="13"/><path class="town-building__wall" d="M-43 0h86v31h-86z"/><path class="town-building__roof" d="m-51 0 51-26L51 0z"/><path class="town-building__column" d="M-25 5v23M-8 5v23M9 5v23M26 5v23"/><path class="town-building__book" d="M-13-16h25v14H-13z"/>${secondaryShapes(secondary, (index) => `<path class="town-building__booklet" transform="translate(${-30 + index * 20} 37)" d="M0 0h14v8H0z"/>`)}</g>`;
        case 'university':
            return `<g class="town-building__sprite town-building__sprite--university"><ellipse class="town-building__shadow" cx="0" cy="27" rx="51" ry="13"/><path class="town-building__wall" d="M-45 3h90v29h-90z"/><path class="town-building__roof town-building__roof--cool" d="m-54 3 54-24L54 3z"/><path class="town-building__dome" d="M-26 3c0-36 52-36 52 0z"/><path class="town-building__beacon" d="M0-36v-17M-7-49h14"/>${secondaryShapes(secondary, (index) => `<path class="town-building__annex" transform="translate(${index ? 35 : -47} 15)" d="M0 0h16v17H0z"/>`)}</g>`;
        case 'temple':
            return `<g class="town-building__sprite town-building__sprite--temple"><ellipse class="town-building__shadow" cx="0" cy="28" rx="47" ry="13"/><path class="town-building__temple-wall" d="M-36 4h72v29h-72z"/><path class="town-building__temple-roof" d="m-46 4 46-34L46 4z"/><path class="town-building__column" d="M-22 6v25M-7 6v25M8 6v25M23 6v25"/><path class="town-building__banner" d="M0-30v-25h20L12-43l8 12z"/>${secondaryShapes(secondary, (index) => `<path class="town-building__shrine" transform="translate(${index ? 37 : -48} 25)" d="M0 0h14v14H0zM-3 0 7-9l10 9z"/>`)}</g>`;
        case 'garrison':
            return `<g class="town-building__sprite town-building__sprite--garrison"><ellipse class="town-building__shadow" cx="0" cy="28" rx="52" ry="13"/><path class="town-building__barracks" d="M-50 2h100v31h-100z"/><path class="town-building__roof town-building__roof--dark" d="m-58 2 58-27L58 2z"/><path class="town-building__battlements" d="M-50 2v-12h14V2h14v-12h14V2h14v-12h14V2h14v-12h14V2"/><path class="town-building__banner" d="M-29-10v-28h21l-8 13 8 12z"/>${secondaryShapes(secondary, (index) => `<path class="town-building__patrol" transform="translate(${-15 + index * 18} 42)" d="M0 0v-10M-4-10h8M-4 0l-4 7M4 0l4 7"/>`)}</g>`;
        case 'foundry':
            return `<g class="town-building__sprite town-building__sprite--foundry"><ellipse class="town-building__shadow" cx="0" cy="29" rx="53" ry="14"/><path class="town-building__industrial-wall" d="M-50 3h89v31h-89z"/><path class="town-building__roof town-building__roof--dark" d="m-58 3 43-23L48 3z"/><path class="town-building__chimney" d="M27-36h18v70H27z"/><path class="town-building__furnace" d="M-20 12h22v22h-22z"/><path class="town-building__light" d="M-14 19h10v8h-10z"/><path class="town-building__smoke" d="M37-41c-15-14 10-22-2-35 20 7 6 22 17 34"/>${secondaryShapes(secondary, (index) => `<path class="town-building__ingot" transform="translate(${-39 + index * 16} 41)" d="M0 0h12l4 6H-3z"/>`)}</g>`;
        case 'factory':
            return `<g class="town-building__sprite town-building__sprite--factory"><ellipse class="town-building__shadow" cx="0" cy="29" rx="54" ry="14"/><path class="town-building__industrial-wall" d="M-53 3h97v32h-97z"/><path class="town-building__roof town-building__roof--dark" d="m-61 3 39-21L53 3z"/><path class="town-building__chimney" d="M27-31h15v66H27z"/><path class="town-building__machine" d="M-29 13h37v22h-37zM-20 24a7 7 0 1 0 .1 0"/><path class="town-building__smoke" d="M35-37c-15-14 9-21-1-34 20 8 6 22 16 32"/>${secondaryShapes(secondary, (index) => `<path class="town-building__crate" transform="translate(${-44 + index * 16} 41)" d="M0 0h12v10H0zM0 0l12 10M12 0 0 10"/>`)}</g>`;
        case 'power-coal':
        case 'power-oil':
            return `<g class="town-building__sprite town-building__sprite--power"><ellipse class="town-building__shadow" cx="0" cy="29" rx="48" ry="12"/><path class="town-building__industrial-wall" d="M-42 6h74v27h-74z"/><path class="town-building__chimney" d="M10-45h20v78H10z"/><path class="town-building__coil" d="M-27 12c0-17 23-17 23 0s23 17 23 0"/><path class="town-building__light" d="M-31 21h9v7h-9zM-13 21h9v7h-9z"/><path class="town-building__smoke" d="M20-51c-17-15 11-24-2-39 24 10 7 25 19 38"/>${secondaryShapes(secondary, (index) => `<path class="town-building__pipe" transform="translate(${-40 + index * 18} 39)" d="M0 0h16v7H0z"/>`)}</g>`;
        case 'power-fission':
            return `<g class="town-building__sprite town-building__sprite--fission"><ellipse class="town-building__shadow" cx="0" cy="28" rx="47" ry="12"/><path class="town-building__industrial-wall town-building__industrial-wall--cool" d="M-41 7h82v27h-82z"/><path class="town-building__reactor" d="M-20 7c0-42 40-42 40 0z"/><path class="town-building__reactor-core" d="M0-13v24M-10-1h20"/><path class="town-building__tower-light" d="M-35 13h8v19h-8zM27 13h8v19h-8z"/>${secondaryShapes(secondary, (index) => `<path class="town-building__coolant" transform="translate(${-23 + index * 22} 39)" d="M0 0h14v7H0z"/>`)}</g>`;
        default:
            return '';
    }
}

/**
 * Composes a registered building from curated, local CC0 artwork. Secondary
 * forms are capped visual density markers, never an instance per unit.
 * @param {{ asset: string, animations: string[] }} definition
 * @param {{ key: string, secondary: number }} level
 */
export function createKenneyBuildingVisual(definition, level) {
    const asset = getKenneyTownAsset(definition.asset);
    const secondary = Math.min(level.secondary, 3);
    const smoke = definition.animations.includes('smoke-rise')
        ? '<path class="town-building__smoke town-building__smoke--raster" d="M25 -30c-12 -15 8 -20 -1 -33 18 8 5 21 15 31"/>'
        : '';
    const beacon = definition.animations.includes('beacon-pulse') || definition.animations.includes('reactor-pulse')
        ? '<circle class="town-building__raster-light" cx="0" cy="-31" r="5"/>'
        : '';
    const crop = definition.asset === 'farmland'
        ? `<image class="town-building__crop-raster" href="${getKenneyTownAsset(level.key === 'small' ? 'cornYoung' : 'cornMature')}" x="-48" y="-56" width="78" height="126" preserveAspectRatio="xMidYMax meet"/>`
        : '';
    const annexes = secondaryShapes(secondary, (index) => `<image class="town-building__secondary-raster" href="${asset}" x="${-43 + index * 30}" y="20" width="38" height="38" preserveAspectRatio="xMidYMax meet"/>`);

    return `<g class="town-building__sprite town-building__sprite--kenney">
        <ellipse class="town-building__shadow" cx="0" cy="27" rx="52" ry="14"/>
        <image class="town-building__raster" href="${asset}" x="-54" y="-58" width="108" height="102" preserveAspectRatio="xMidYMax meet"/>
        ${crop}${annexes}${beacon}${smoke}
    </g>`;
}
