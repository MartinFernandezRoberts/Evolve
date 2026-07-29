import { createDistrictArt } from '../assets/town-art.js';

const svgNamespace = 'http://www.w3.org/2000/svg';

function escapeMarkup(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Crea un nodo de mapa accesible. Sólo comunica intención de selección: no
 * compra ni muta estado de juego durante la fase mock.
 *
 * @param {import('../adapters/town-scene-contracts.js').TownDistrict} district
 * @param {{ onSelect: (district: import('../adapters/town-scene-contracts.js').TownDistrict, element: SVGGElement) => void, onInspect: (district: import('../adapters/town-scene-contracts.js').TownDistrict, element: SVGGElement) => void, onLeave: () => void }} handlers
 * @returns {SVGGElement}
 */
export function createTownNode(district, handlers) {
    const node = document.createElementNS(svgNamespace, 'g');
    node.classList.add('town-node');
    node.dataset.townNode = district.id;
    node.dataset.townNodeLabel = district.label;
    node.setAttribute('transform', `translate(${district.position.x} ${district.position.y})`);
    node.setAttribute('role', 'button');
    node.setAttribute('tabindex', '0');
    node.setAttribute('aria-pressed', 'false');
    node.setAttribute('aria-describedby', 'town-scene-tooltip');
    node.setAttribute('aria-label', `${district.label}. ${district.status}`);
    node.innerHTML = `
        <title>${escapeMarkup(district.label)}</title>
        <ellipse class="town-node__focus" cx="0" cy="24" rx="100" ry="58" />
        <g filter="url(#town-shadow)">${createDistrictArt(district)}</g>
        <g class="town-node__building-layer" data-town-building-layer></g>
        <g class="town-node__marker" transform="translate(58 -38)">
            <circle r="18" fill="${district.accent}" />
            <text data-town-marker text-anchor="middle" dominant-baseline="central">${district.marker}</text>
        </g>
        <g class="town-node__label" transform="translate(0 74)">
            <rect x="-79" y="-15" width="158" height="30" rx="15" />
            <text text-anchor="middle" dominant-baseline="central">${escapeMarkup(district.label)}</text>
        </g>
    `;

    node.addEventListener('click', () => handlers.onSelect(district, node));
    node.addEventListener('mouseenter', () => handlers.onInspect(district, node));
    node.addEventListener('focus', () => handlers.onInspect(district, node));
    node.addEventListener('mouseleave', handlers.onLeave);
    node.addEventListener('blur', handlers.onLeave);
    node.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handlers.onSelect(district, node);
        }
    });

    return node;
}

/**
 * @param {SVGGElement[]} nodes
 * @param {string} selectedId
 */
export function updateTownNodeSelection(nodes, selectedId) {
    nodes.forEach((node) => {
        const selected = node.dataset.townNode === selectedId;
        node.classList.toggle('is-selected', selected);
        node.setAttribute('aria-pressed', String(selected));
    });
}

/**
 * Actualiza datos volátiles sin reconstruir la silueta SVG ni sus listeners.
 * @param {SVGGElement} node
 * @param {import('../adapters/town-scene-contracts.js').TownDistrict} district
 */
export function updateTownNode(node, district) {
    const marker = node.querySelector('[data-town-marker]');
    if (marker && marker.textContent !== String(district.marker)) {
        marker.textContent = String(district.marker);
    }
    node.setAttribute('aria-label', `${district.label}. ${district.status}`);
}
