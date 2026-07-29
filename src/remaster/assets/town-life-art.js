/**
 * Formas SVG originales y abstractas. Son símbolos temporales del remaster:
 * no reutilizan personajes, escenarios ni marcas de obras de terceros.
 */

const weatherParticleMarkup = [
    [122, 132], [240, 224], [388, 116], [522, 244], [687, 150], [816, 285],
    [958, 114], [1106, 278], [1264, 156], [1382, 312], [1480, 200], [1540, 388]
].map(([x, y]) => `<path class="town-environment__particle" transform="translate(${x} ${y})" d="m0 0-8 21"/>`).join('');

// Capas originales y abstractas para los perfiles de bioma. Todas se montan
// una sola vez; el perfil resuelto sólo revela la variante correspondiente.
const biomeMarkup = `
    <g class="town-environment__biome town-environment__biome--grassland"><path d="M92 590l18-32 7 32 17-44 8 44m1282-111 17-38 8 38 16-29 7 29"/></g>
    <g class="town-environment__biome town-environment__biome--oceanic"><path d="M-20 640c93-38 152 42 252 0s163 35 269-4 175 35 274-2 183 31 291-5 182 35 276-2 167 28 277-1"/></g>
    <g class="town-environment__biome town-environment__biome--forest"><path d="M101 250l32-78 31 78m21 41 27-67 29 67m1148 40 30-74 31 74"/><circle cx="133" cy="202" r="29"/><circle cx="212" cy="248" r="24"/><circle cx="1419" cy="286" r="29"/></g>
    <g class="town-environment__biome town-environment__biome--desert"><path d="M92 610c94-88 185 10 286-50 97-57 177 25 290-32m624-298c67-45 119 4 199-33"/></g>
    <g class="town-environment__biome town-environment__biome--volcanic"><path d="M123 603 170 534l48 69m1092-430 39-72 44 72"/><path d="m145 604 24-33 25 33m1130-429 25-36 24 36"/></g>
    <g class="town-environment__biome town-environment__biome--tundra"><path d="m104 598 20-41 21 41 26-29 24 29m1185-336 20-43 22 43"/></g>
    <g class="town-environment__biome town-environment__biome--savanna"><path d="M123 316h98m-49 0v-57m0 0 37 34m-37-34-39 33m1183 272h92m-46 0v-55m0 0 33 31m-33-31-35 30"/></g>
    <g class="town-environment__biome town-environment__biome--swamp"><ellipse cx="177" cy="609" rx="74" ry="20"/><ellipse cx="1399" cy="470" rx="64" ry="18"/><path d="m132 587 7-41m15 39 7-47m1142-91 8-43m14 40 8-48"/></g>
    <g class="town-environment__biome town-environment__biome--ashland"><path d="M93 580l44-24 44 21 45-29m1127-317 40-25 43 21 42-30"/></g>
    <g class="town-environment__biome town-environment__biome--taiga"><path d="M101 322l33-101 34 101m22 14 30-91 32 91m1132 56 31-102 35 102"/></g>
    <g class="town-environment__biome town-environment__biome--hellscape"><path d="M105 618c31-61 63-53 97 0m1111-397c31-61 63-53 97 0"/><path d="M124 607h58m1154-401h57"/></g>
    <g class="town-environment__biome town-environment__biome--eden"><path d="M119 564c24-42 48-42 72 0m1156-335c23-41 46-41 70 0"/><circle cx="155" cy="550" r="11"/><circle cx="1382" cy="215" r="11"/></g>`;

const traitMarkup = `
    <path class="town-environment__trait town-environment__trait--toxic" d="M195 546c69-73 123 22 190-35 59-49 93 15 153-26" />
    <path class="town-environment__trait town-environment__trait--bloom" d="M268 610c21-53 42-53 63 0m-31-27c-21 0-21-29 0-29 21 0 21 29 0 29m1040-370c22-51 44-51 65 0m-32-28c-20 0-20-28 0-28 20 0 20 28 0 28" />
    <path class="town-environment__trait town-environment__trait--ember" d="m253 632 22-61 19 61 20-44 20 44m1013-476 22-62 20 62 20-45 20 45" />
    <path class="town-environment__trait town-environment__trait--storm" d="m1314 111 17 30 16-30-13 46" />
    <path class="town-environment__trait town-environment__trait--halo" d="M1245 170c49-58 133-58 182 0" />
    <path class="town-environment__trait town-environment__trait--magnetic" d="M1282 193c44-58 90-55 128 1-41-29-83-28-128-1z" />
    <path class="town-environment__trait town-environment__trait--debris" d="m190 621 19-17 23 11 19-20 27 14m1082-354 17-18 25 9 19-18" />
    <path class="town-environment__trait town-environment__trait--rings" d="M1168 156c74-40 160-38 244 4m-215 24c57-27 124-25 186 5" />
    <path class="town-environment__trait town-environment__trait--flare" d="M1461 154v-72m-36 36h72m-61-25 50 50m0-50-50 50" />
    <path class="town-environment__trait town-environment__trait--crystal" d="m257 607 22-50 22 50 21-35 20 35m1012-383 20-46 22 46 20-33 21 33" />
    <path class="town-environment__trait town-environment__trait--rift" d="M1330 258c-39 45 40 46 0 94 44 36-28 49 11 90" />
    <path class="town-environment__trait town-environment__trait--frost" d="m248 634 34-14 37 18 39-21 42 17" />
    <path class="town-environment__trait town-environment__trait--orbit" d="M1205 215c87-75 183-66 250 13m-217 5c59-51 126-47 184 8" />
    <path class="town-environment__trait town-environment__trait--meteor" d="m1391 115 67 64m-48-80 61 19" />`;

export function createTownEnvironmentArt() {
    return `
        <g class="town-environment" aria-hidden="true">
            <rect class="town-environment__veil" x="0" y="0" width="1600" height="900" rx="48" />
            <g class="town-environment__aquatic">
                <path class="town-environment__canal" d="M211 572c176-83 241 8 351-34 119-45 121-109 244-88 101 17 157 116 305 44" />
                <path class="town-environment__canal town-environment__canal--small" d="M522 386c62 38 127 36 202 31 84-6 125 19 158 58" />
                <ellipse class="town-environment__pool" cx="706" cy="351" rx="94" ry="37" />
                <ellipse class="town-environment__pool town-environment__pool--small" cx="901" cy="543" rx="58" ry="25" />
                <path class="town-environment__reeds" d="m611 359 7-23m9 20 5-21m355 214 4-22m10 20 7-18" />
            </g>
            <g class="town-environment__biomes">${biomeMarkup}</g>
            <g class="town-environment__traits">${traitMarkup}</g>
            <g class="town-environment__weather">${weatherParticleMarkup}</g>
        </g>
    `;
}

/** @param {string} profile */
export function createTownResidentArt(profile) {
    switch (profile) {
        case 'aquatic':
            return '<ellipse class="town-life__body" cx="0" cy="0" rx="7" ry="8"/><circle class="town-life__eye" cx="-2" cy="-2" r="1.2"/><circle class="town-life__eye" cx="2" cy="-2" r="1.2"/><path class="town-life__tentacle" d="M-5 6c-6 8 0 10-5 16M-1 7c-4 8 2 10-2 16M3 7c2 7 8 8 3 15M6 5c6 6 2 11 7 14"/>';
        case 'mammalian':
            return '<path class="town-life__body" d="M-6 8V-1c0-10 12-10 12 0v9z"/><path class="town-life__ear" d="m-6-4-4-6 7 3m3-1 6-4-1 8"/><circle class="town-life__eye" cx="2" cy="-2" r="1.2"/>';
        case 'arthropod':
            return '<ellipse class="town-life__body" cx="0" cy="0" rx="6" ry="8"/><path class="town-life__limb" d="m-5-3-7-6m7 10-8 2m8 3-7 7m10-15 0-8m2 12 8-5m-8 9 9 2m-8 3 7 7"/>';
        case 'avian':
            return '<path class="town-life__body" d="M-7 8 0-9 8 8z"/><path class="town-life__beak" d="m0-7 7 3-7 2z"/><path class="town-life__wing" d="m-1 0-9 4 7 2z"/>';
        case 'reptilian':
            return '<path class="town-life__body" d="M-6 8V-3c0-8 12-8 12 0v11z"/><path class="town-life__tail" d="M5 7c9 0 9 7 14 5"/><circle class="town-life__eye" cx="2" cy="-4" r="1.2"/>';
        case 'humanoid':
            return '<circle class="town-life__body" cx="0" cy="-5" r="4"/><path class="town-life__cloak" d="m-5 9 5-11 5 11z"/>';
        case 'small':
            return '<circle class="town-life__body" cx="0" cy="-3" r="4"/><path class="town-life__cloak" d="m-7 8 7-8 7 8z"/><path class="town-life__crest" d="m-5-5 5-6 5 6"/>';
        case 'giant':
            return '<circle class="town-life__body" cx="0" cy="-8" r="6"/><path class="town-life__cloak" d="m-8 12 8-15 8 15z"/>';
        case 'plant':
            return '<path class="town-life__body" d="M-6 8C-9-7 9-12 6 8z"/><path class="town-life__leaf" d="M0-1c-11-5-11-13-2-11M1-1c12-6 12-14 3-11"/>';
        case 'fungi':
            return '<path class="town-life__body" d="M-4 9V0h8v9z"/><path class="town-life__cap" d="M-10 0c1-14 19-14 20 0z"/>';
        case 'thermal':
            return '<path class="town-life__body" d="M-6 9c-6-11 9-21 12 0z"/><path class="town-life__flame" d="M0-4c-7-7 5-13 1-20 10 8 5 15-1 20"/>';
        case 'polar':
            return '<circle class="town-life__body" cx="0" cy="-4" r="5"/><path class="town-life__cloak" d="m-7 10 7-11 7 11z"/><path class="town-life__frost" d="m-10-8 20 0M0-14v12"/>';
        case 'desert':
            return '<circle class="town-life__body" cx="0" cy="-5" r="4"/><path class="town-life__cloak" d="m-7 10 7-11 7 11z"/><path class="town-life__veil" d="M-6-4h12"/>';
        case 'fey':
        case 'angelic':
            return '<circle class="town-life__body" cx="0" cy="-5" r="4"/><path class="town-life__wing" d="m-3 1-10-7 4 11m5-4 10-7-4 11"/><path class="town-life__halo" d="M-6-12c3-4 9-4 12 0"/>';
        case 'demonic':
            return '<path class="town-life__body" d="M-6 9V-2c0-8 12-8 12 0v11z"/><path class="town-life__horn" d="m-5-5-4-8 8 5m2-1 7-5-3 9"/>';
        case 'synthetic':
            return '<rect class="town-life__body" x="-6" y="-9" width="12" height="18" rx="3"/><path class="town-life__circuit" d="M-3-4h6M-3 1h6M0-8v16"/>';
        case 'eldritch':
            return '<path class="town-life__body" d="M0-11c11 5 8 17 0 20-9-3-11-15 0-20z"/><circle class="town-life__eye" cx="0" cy="-1" r="2"/><path class="town-life__tentacle" d="M-3 6c-8 6-1 13-7 17M3 6c8 6 1 13 7 17"/>';
        default:
            return '<path class="town-life__body" d="M-7 8c-4-14 18-18 14 0z"/><path class="town-life__crest" d="m-3-5 3-8 3 8"/><circle class="town-life__eye" cx="2" cy="-3" r="1.2"/>';
    }
}

/** @param {string} activity */
export function createTownActivityArt(activity) {
    switch (activity) {
        case 'farmer':
            return '<circle class="town-life__worker-head" cx="0" cy="-6" r="4"/><path class="town-life__worker-body" d="m-5 10 5-12 5 12z"/><path class="town-life__tool" d="m7-8 8 19m-3-7 7 1"/>';
        case 'miner':
            return '<circle class="town-life__worker-head" cx="0" cy="-6" r="4"/><path class="town-life__worker-body" d="m-5 10 5-12 5 12z"/><path class="town-life__tool" d="m7-7 9 18M8-5l9-4"/>';
        case 'transport':
            return '<rect class="town-life__cart" x="-11" y="-2" width="21" height="11" rx="2"/><circle class="town-life__wheel" cx="-6" cy="10" r="3"/><circle class="town-life__wheel" cx="6" cy="10" r="3"/><path class="town-life__parcel" d="M-6-10h11v8H-6z"/>';
        case 'researcher':
            return '<circle class="town-life__worker-head" cx="0" cy="-6" r="4"/><path class="town-life__worker-body" d="m-5 10 5-12 5 12z"/><path class="town-life__lens" d="m8-5 5 5m-7-1 5-5"/>';
        case 'guard':
            return '<circle class="town-life__worker-head" cx="0" cy="-6" r="4"/><path class="town-life__worker-body" d="m-5 10 5-12 5 12z"/><path class="town-life__spear" d="M8-14v27"/>';
        default:
            return '<path class="town-life__cart" d="M-11 8V-6h22V8z"/><path class="town-life__industrial-glow" d="M-5-5h10v11H-5z"/><path class="town-life__smoke" d="M2-8c-8-6 4-8-2-15"/>';
    }
}
