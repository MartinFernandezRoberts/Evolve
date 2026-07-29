/**
 * Formas SVG originales y temporales del prototipo. No proceden de assets
 * externos ni intentan reproducir mapas, personajes o marcas de terceros.
 */

export function createTownBackdrop() {
    return `
        <defs>
            <linearGradient id="town-grass" x1="0" y1="0" x2="0.9" y2="1">
                <stop offset="0" stop-color="#529f67" />
                <stop offset="0.48" stop-color="#3b865e" />
                <stop offset="1" stop-color="#245e51" />
            </linearGradient>
            <linearGradient id="town-water" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#54c1c4" />
                <stop offset="1" stop-color="#237d9a" />
            </linearGradient>
            <linearGradient id="town-mountain" x1="0" y1="0" x2="0.7" y2="1">
                <stop offset="0" stop-color="#99a9ad" />
                <stop offset="1" stop-color="#44596a" />
            </linearGradient>
            <pattern id="town-grain" width="12" height="12" patternUnits="userSpaceOnUse">
                <path d="M1 2h1M8 6h1M4 10h1" stroke="#d6eea4" stroke-opacity=".18" stroke-width="1" />
            </pattern>
            <filter id="town-shadow" x="-25%" y="-25%" width="150%" height="160%">
                <feDropShadow dx="0" dy="12" stdDeviation="7" flood-color="#123f47" flood-opacity=".45" />
            </filter>
        </defs>
        <rect class="town-scene__terrain" width="1600" height="900" rx="48" fill="url(#town-grass)" />
        <rect width="1600" height="900" rx="48" fill="url(#town-grain)" />
        <path class="town-scene__water" d="M-40 636C166 548 235 704 416 650c182-54 245 94 412 52 211-53 350-178 812-14v292H-40z" fill="url(#town-water)" />
        <path class="town-scene__water-line" d="M-18 688c168-72 257 58 425 5 194-61 261 78 451 36 190-42 345-155 764-11" />
        <path class="town-scene__mountain town-scene__mountain--left" d="M-30 180 118 48l115 125 102-95 154 160-519 58z" fill="url(#town-mountain)" />
        <path class="town-scene__mountain town-scene__mountain--right" d="m1045 128 132-108 99 97 120-66 194 167-36 133-504-41z" fill="url(#town-mountain)" />
        <g class="town-scene__mountain-highlights">
            <path d="m56 111 62-63 42 48-39-9-28 47zM1134 78l43-58 46 46-39-7-22 44zM1318 116l78-65 53 65-69-18-34 42z" />
        </g>
        <g class="town-scene__paths">
            <path d="M330 250C472 258 485 349 620 385c87 23 103 25 171 38 124 22 176-23 245-82 69-59 87-77 151-107" />
            <path d="M790 425c-105-32-177-94-247-140" />
            <path d="M790 425c-24-107-42-154-35-234" />
            <path d="M788 427c-119 54-244 75-430 108" />
            <path d="M790 426c77 82 80 139 76 232" />
            <path d="M789 427c129 46 211 107 376 185" />
            <path d="M789 426c129 57 182 68 260 78" />
            <path d="M791 426c-38 135-92 203-181 276" />
        </g>
        <g class="town-scene__trees" aria-hidden="true">
            <g transform="translate(180 333)"><path d="M0 38 20 0l21 38z" /><path d="M8 52 21 16l15 36z" /><rect x="18" y="48" width="6" height="15" /></g>
            <g transform="translate(244 432) scale(.8)"><path d="M0 38 20 0l21 38z" /><path d="M8 52 21 16l15 36z" /><rect x="18" y="48" width="6" height="15" /></g>
            <g transform="translate(1400 406) scale(.92)"><path d="M0 38 20 0l21 38z" /><path d="M8 52 21 16l15 36z" /><rect x="18" y="48" width="6" height="15" /></g>
            <g transform="translate(1370 545) scale(.72)"><path d="M0 38 20 0l21 38z" /><path d="M8 52 21 16l15 36z" /><rect x="18" y="48" width="6" height="15" /></g>
        </g>
        <g class="town-scene__rocks" aria-hidden="true">
            <path d="m252 635 26-18 34 14-7 30-42 1zM1314 304l22-17 39 15-7 29-44 2zM965 183l20-11 28 16-8 22-36-2z" />
        </g>
    `;
}

/**
 * Devuelve la silueta única de cada distrito. La posición se aplica fuera de
 * este fragmento para separar datos de composición y arte temporal.
 *
 * @param {import('../adapters/town-scene-contracts.js').TownDistrict} district
 * @returns {string}
 */
export function createDistrictArt(district) {
    const roof = '#b95647';
    const wall = '#e2bd80';
    const stone = '#849aa3';

    switch (district.art) {
        case 'homes':
            return `<g class="town-art town-art--homes"><ellipse class="town-art__shadow" cx="0" cy="35" rx="74" ry="21"/><path fill="${wall}" d="M-61 7h41v31h-41zM-13-5h46v43h-46zM40 6h37v32H40z"/><path fill="${roof}" d="m-69 8 28-27 29 27zM-24-5 10-37 44-5zM31 7 58-18 85 7z"/><path class="town-art__window" d="M-49 18h9v11h-9zM2 8h11v13H2zM54 18h9v11h-9z"/></g>`;
        case 'farm':
            return `<g class="town-art town-art--farm"><ellipse class="town-art__shadow" cx="0" cy="35" rx="79" ry="21"/><path class="town-art__field" d="M-77 5h104l-13 37H-82z"/><path class="town-art__furrow" d="m-61 9-10 29M-42 8l-9 31M-23 7l-7 34M-4 6l-5 35M15 5l-4 37"/><path fill="#e3c48d" d="M42-1h28v39H42z"/><path fill="#d8794d" d="m34 0 22-26L79 0z"/><path class="town-art__mill" d="M58-9V-37M39-28h38M44-40l27 24M71-40 44-16"/></g>`;
        case 'lumber':
            return `<g class="town-art town-art--lumber"><ellipse class="town-art__shadow" cx="0" cy="36" rx="72" ry="20"/><path class="town-art__pine" d="M-60 15-38-47-15 15zM-32 23-9-35 15 23z"/><path class="town-art__trunk" d="M-40 12v26M-10 18v24"/><path fill="#bf7651" d="M5 5h65v35H5z"/><path fill="#734639" d="m-3 5 39-27L79 5z"/><path class="town-art__log" d="M12 43h57M17 51h48"/></g>`;
        case 'quarry':
            return `<g class="town-art town-art--quarry"><ellipse class="town-art__shadow" cx="0" cy="36" rx="78" ry="22"/><path fill="${stone}" d="m-79 29 30-51 37 25 28-45L83 23l-13 21H-73z"/><path class="town-art__cut" d="M-54 12h31M-28-2h26M13 14h32"/><path class="town-art__crane" d="M31 27V-37h8v64M20-32h66M70-32v37M56-32 70-48"/></g>`;
        case 'observatory':
            return `<g class="town-art town-art--observatory"><ellipse class="town-art__shadow" cx="0" cy="36" rx="70" ry="20"/><path fill="#b7d0d1" d="M-49 9h97v31h-97z"/><path class="town-art__dome" d="M-37 10c0-43 75-43 75 0z"/><path class="town-art__lens" d="M-7-13h34l-6 12H1z"/><path fill="#e8bd73" d="m-58 8 58-25 58 25z"/></g>`;
        case 'shrine':
            return `<g class="town-art town-art--shrine"><ellipse class="town-art__shadow" cx="0" cy="36" rx="62" ry="18"/><path fill="#9a85ba" d="M-34 35V-7h68v42z"/><path fill="#d2c9e7" d="m-46-7 46-43L46-7z"/><path class="town-art__arch" d="M-10 35V12c0-17 20-17 20 0v23"/><path class="town-art__flag" d="M0-50v-27h26l-9 13 9 14z"/></g>`;
        case 'workshop':
            return `<g class="town-art town-art--workshop"><ellipse class="town-art__shadow" cx="0" cy="36" rx="76" ry="20"/><path fill="#a86f50" d="M-66 5h105v35H-66z"/><path fill="#5d4b51" d="m-75 5 55-31L49 5z"/><path class="town-art__metal" d="M-44 16h14v18h-14zM-12 16H2v18h-14zM20 16h14v18H20z"/><path fill="#6a717b" d="M48-30h22v69H48z"/><path class="town-art__smoke" d="M61-36c-19-19 12-25-2-44 24 10 7 25 20 40"/></g>`;
        case 'council':
            return `<g class="town-art town-art--council"><ellipse class="town-art__shadow" cx="0" cy="36" rx="76" ry="20"/><path fill="#d0b77a" d="M-60 5h120v34H-60z"/><path fill="#8d5943" d="m-70 5 70-39L70 5z"/><path class="town-art__column" d="M-38 9v29M-13 9v29M13 9v29M38 9v29"/><path class="town-art__flag" d="M0-34v-31h26L15-50l11 15z"/></g>`;
        case 'fort':
            return `<g class="town-art town-art--fort"><ellipse class="town-art__shadow" cx="0" cy="37" rx="78" ry="21"/><path fill="#798c95" d="M-70 3h140v38H-70z"/><path class="town-art__battlement" d="M-70 3v-14h18V3h17v-14h18V3h17v-14h18V3h17v-14h18V3h17v-14h18V3"/><path fill="#657781" d="M-54-13h27v22h-27zM28-13h27v22H28z"/><path class="town-art__flag" d="M-40-14v-32h25l-10 15 10 14z"/></g>`;
        case 'hall':
        default:
            return `<g class="town-art town-art--hall"><ellipse class="town-art__shadow" cx="0" cy="39" rx="88" ry="23"/><path fill="#d5c18e" d="M-68 5h136v39H-68z"/><path fill="#ad5e45" d="m-79 5 79-47L79 5z"/><path class="town-art__tower" d="M-16 5V-57h32V5z"/><path fill="#e2bb6d" d="m-28-57 28-25 28 25z"/><path class="town-art__window" d="M-48 17h12v14h-12zM36 17h12v14H36zM-5-42H5v16H-5z"/><path class="town-art__fountain" d="M-14 53c7-17 21-17 28 0z"/></g>`;
    }
}
