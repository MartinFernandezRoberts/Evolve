/**
 * Formas SVG originales y abstractas. Son símbolos temporales del remaster:
 * no reutilizan personajes, escenarios ni marcas de obras de terceros.
 */

const weatherParticleMarkup = [
    [122, 132], [240, 224], [388, 116], [522, 244], [687, 150], [816, 285],
    [958, 114], [1106, 278], [1264, 156], [1382, 312], [1480, 200], [1540, 388]
].map(([x, y]) => `<path class="town-environment__particle" transform="translate(${x} ${y})" d="m0 0-8 21"/>`).join('');

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
            <g class="town-environment__traits">
                <path class="town-environment__trait town-environment__trait--toxic" d="M195 546c69-73 123 22 190-35 59-49 93 15 153-26" />
                <path class="town-environment__trait town-environment__trait--magnetic" d="M1282 193c44-58 90-55 128 1-41-29-83-28-128-1z" />
                <path class="town-environment__trait town-environment__trait--permafrost" d="m248 634 34-14 37 18 39-21 42 17" />
                <path class="town-environment__trait town-environment__trait--stormy" d="m1314 111 17 30 16-30-13 46" />
            </g>
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
