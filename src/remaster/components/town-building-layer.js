import { createBuildingVisualSprite } from '../assets/building-visuals.js';
import { getBuildingVisualDefinition, getBuildingVisualLevel, getDistrictVisualDensity } from '../config/building-visual-registry.js';

const svgNamespace = 'http://www.w3.org/2000/svg';

function createSvgElement(name) {
    return document.createElementNS(svgNamespace, name);
}

function formatCount(count, cap) {
    return count > cap ? `${cap}+` : String(count);
}

function getVisualState(definition, building) {
    if (building.count > 0) {
        if (definition.states.supportsPower && building.on !== null && building.on <= 0) {
            return 'off';
        }
        return 'on';
    }
    if (!building.unlocked) {
        return 'hidden';
    }
    return building.affordable === false ? 'no-resources' : 'available';
}

function restartMotion(element, className) {
    element.classList.remove(className);
    void element.getBoundingClientRect();
    element.classList.add(className);
}

/**
 * Renderizador incremental de los edificios registrados. Sólo recibe el DTO
 * TownSnapshot y definiciones visuales; no conoce ni consulta el motor.
 */
export class TownBuildingLayer {
    /** @param {{ onSelect?: (id: string) => void }} [options] */
    constructor(options = {}) {
        this.entries = new Map();
        this.history = new Map();
        this.onSelect = options.onSelect || (() => {});
    }

    /** @param {(id: string) => void} onSelect */
    setOnSelect(onSelect) {
        this.onSelect = onSelect || (() => {});
    }

    /** @param {SVGGElement} layer @param {object} definition @param {object} building */
    createEntry(layer, definition, building) {
        const element = createSvgElement('g');
        const position = definition.positions[0];
        element.classList.add('town-building');
        element.dataset.townBuilding = building.id;
        element.setAttribute('transform', `translate(${position.x} ${position.y}) scale(${position.scale})`);
        element.setAttribute('aria-hidden', 'true');
        const onClick = (event) => {
            event.stopPropagation();
            this.onSelect(building.id);
        };
        element.addEventListener('click', onClick);

        const plot = createSvgElement('g');
        plot.classList.add('town-building__plot');
        plot.setAttribute('data-building-plot', '');
        plot.innerHTML = '<ellipse cx="0" cy="28" rx="40" ry="13"/><path d="M-28 27h56M-22 20h44"/>';

        const art = createSvgElement('g');
        art.setAttribute('data-building-art', '');

        const supply = createSvgElement('g');
        supply.classList.add('town-building__supply');
        supply.setAttribute('data-building-supply', '');
        supply.innerHTML = '<path d="M-8 14h16v13H-8zM-8 14l16 13M8 14-8 27"/><path d="M0 8v12M-5 13h10"/>';

        const badge = createSvgElement('g');
        badge.classList.add('town-building__badge');
        badge.setAttribute('data-building-badge', '');
        badge.innerHTML = '<rect x="20" y="-37" width="31" height="20" rx="10"/><text x="35.5" y="-23" text-anchor="middle"></text>';

        element.append(plot, art, supply, badge);
        layer.append(element);
        return { element, art, plot, supply, badge, onClick, state: null, count: null, level: null, unlocked: null, label: '' };
    }

    /** @param {object} entry @param {object} definition @param {object} building @param {{ count: number, unlocked: boolean }|undefined} previous */
    updateEntry(entry, definition, building, previous) {
        const state = getVisualState(definition, building);
        const level = building.count > 0 ? getBuildingVisualLevel(definition, building.count) : null;
        const countIncreased = Boolean(previous && building.count > previous.count);
        const unlockedNow = Boolean(previous && previous.unlocked === false && building.unlocked === true);
        const becameBuilt = Boolean(previous && previous.count === 0 && building.count > 0);

        entry.element.classList.toggle('is-on', state === 'on');
        entry.element.classList.toggle('is-off', state === 'off');
        entry.element.classList.toggle('is-available', state === 'available');
        entry.element.classList.toggle('is-resource-starved', state === 'no-resources');
        entry.plot.classList.toggle('is-hidden', building.count > 0);
        entry.supply.classList.toggle('is-hidden', state !== 'no-resources');
        entry.badge.classList.toggle('is-hidden', building.count <= 0);
        entry.element.setAttribute('aria-label', `${building.label}: ${building.count}`);

        if (level && (!entry.level || entry.level.key !== level.key)) {
            entry.art.innerHTML = createBuildingVisualSprite(definition.sprite, level);
        }

        if (building.count > 0) {
            const label = entry.badge.querySelector('text');
            const text = `×${formatCount(building.count, definition.quantityIndicator.cap)}`;
            if (label.textContent !== text) {
                label.textContent = text;
            }
        }

        if (unlockedNow) {
            restartMotion(entry.element, 'is-unlocked');
        }
        if (countIncreased || becameBuilt) {
            restartMotion(entry.element, 'is-growing');
        }

        entry.state = state;
        entry.count = building.count;
        entry.level = level;
        entry.unlocked = building.unlocked;
        entry.label = building.label;
    }

    /**
     * @param {import('../adapters/town-scene-contracts.js').TownSnapshot} snapshot
     * @param {Map<string, SVGGElement>} nodeById
     */
    sync(snapshot, nodeById) {
        const nextIds = new Set();
        const buildingsByDistrict = new Map();

        snapshot.visualBuildings.forEach((building) => {
            const definition = getBuildingVisualDefinition(building.id);
            if (!definition) {
                return;
            }
            const previous = this.history.get(building.id);
            this.history.set(building.id, { count: building.count, unlocked: building.unlocked });
            const state = getVisualState(definition, building);
            if (state === 'hidden') {
                return;
            }
            nextIds.add(building.id);
            if (!buildingsByDistrict.has(definition.district)) {
                buildingsByDistrict.set(definition.district, []);
            }
            buildingsByDistrict.get(definition.district).push(building);

            const node = nodeById.get(definition.district);
            const layer = node?.querySelector('[data-town-building-layer]');
            if (!layer) {
                return;
            }
            let entry = this.entries.get(building.id);
            if (!entry || entry.element.parentNode !== layer) {
                entry?.element.remove();
                entry = this.createEntry(layer, definition, building);
                this.entries.set(building.id, entry);
            }
            this.updateEntry(entry, definition, building, previous);
        });

        this.entries.forEach((entry, id) => {
            if (!nextIds.has(id)) {
                entry.element.removeEventListener('click', entry.onClick);
                entry.element.remove();
                this.entries.delete(id);
            }
        });

        nodeById.forEach((node, districtId) => {
            const density = getDistrictVisualDensity(buildingsByDistrict.get(districtId) || []);
            node.classList.remove('town-node--open', 'town-node--sparse', 'town-node--settled', 'town-node--dense');
            node.classList.add(`town-node--${density}`);
        });
    }

    reset() {
        this.entries.forEach((entry) => entry.element.removeEventListener('click', entry.onClick));
        this.entries.clear();
    }

    /** @param {string} id */
    flash(id) {
        const entry = this.entries.get(id);
        if (entry) {
            restartMotion(entry.element, 'is-actioned');
        }
    }

    destroy() {
        this.entries.forEach((entry) => {
            entry.element.removeEventListener('click', entry.onClick);
            entry.element.remove();
        });
        this.entries.clear();
        this.history.clear();
    }
}
