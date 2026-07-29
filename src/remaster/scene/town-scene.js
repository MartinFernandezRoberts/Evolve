import { isTownSceneSnapshot } from '../adapters/town-scene-contracts.js';
import { createTownBackdrop } from '../assets/town-art.js';
import { createTownNode, updateTownNodeSelection } from '../components/town-node.js';
import { renderTownPanel } from '../components/town-panel.js';

const minimumZoom = 0.65;
const maximumZoom = 1.8;
const zoomStep = 0.15;
const mapWidth = 1600;

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Escena SVG independiente del motor. Recibe un contrato de snapshot para que
 * el futuro adaptador pueda sustituir los datos mock sin reescribir la UI.
 */
export class TownScene {
    /**
     * @param {HTMLElement} root Elemento donde se monta la escena.
     * @param {{ snapshot: import('../adapters/town-scene-contracts.js').TownSceneSnapshot, onSelectionChange?: (district: import('../adapters/town-scene-contracts.js').TownDistrict) => void }} options
     */
    constructor(root, options) {
        if (!root) {
            throw new Error('TownScene requiere un elemento raíz.');
        }
        if (!isTownSceneSnapshot(options.snapshot)) {
            throw new Error('TownScene recibió un snapshot incompatible.');
        }

        this.root = root;
        this.snapshot = options.snapshot;
        this.onSelectionChange = options.onSelectionChange || (() => {});
        this.nodes = [];
        this.zoom = 1;
        this.pan = { x: 0, y: 0 };
        this.selectedId = this.snapshot.districts[0]?.id || '';
        this.drag = null;
        this.boundWheel = this.handleWheel.bind(this);
        this.boundPointerDown = this.handlePointerDown.bind(this);
        this.boundPointerMove = this.handlePointerMove.bind(this);
        this.boundPointerUp = this.handlePointerUp.bind(this);
        this.boundKeyDown = this.handleMapKeyDown.bind(this);
    }

    mount() {
        this.root.innerHTML = `
            <section class="town-scene" aria-labelledby="town-scene-title">
                <header class="town-scene__header">
                    <div>
                        <p class="town-scene__eyebrow">Prototipo visual aislado</p>
                        <h1 id="town-scene-title"></h1>
                        <p class="town-scene__subtitle"></p>
                    </div>
                    <div class="town-scene__resources" aria-label="Recursos de demostración"></div>
                </header>
                <div class="town-scene__layout">
                    <div class="town-scene__map-frame">
                        <div class="town-scene__toolbar" role="group" aria-label="Controles del mapa">
                            <button type="button" data-town-control="zoom-out" aria-label="Alejar mapa">−</button>
                            <button type="button" data-town-control="reset" aria-label="Restablecer vista">Vista</button>
                            <button type="button" data-town-control="zoom-in" aria-label="Acercar mapa">+</button>
                            <span class="town-scene__zoom-label" aria-live="polite"></span>
                        </div>
                        <p class="town-scene__map-hint">Arrastra el terreno para desplazarte. Rueda o botones para zoom.</p>
                        <svg class="town-scene__map" viewBox="0 0 1600 900" role="group" aria-label="Mapa interactivo del pueblo" tabindex="0">
                            <g class="town-scene__world"></g>
                        </svg>
                        <div id="town-scene-tooltip" class="town-scene__tooltip" role="tooltip" hidden></div>
                    </div>
                    <aside class="town-scene__panel" aria-live="polite"></aside>
                </div>
            </section>
        `;

        this.title = this.root.querySelector('#town-scene-title');
        this.subtitle = this.root.querySelector('.town-scene__subtitle');
        this.resources = this.root.querySelector('.town-scene__resources');
        this.svg = this.root.querySelector('.town-scene__map');
        this.world = this.root.querySelector('.town-scene__world');
        this.panel = this.root.querySelector('.town-scene__panel');
        this.tooltip = this.root.querySelector('.town-scene__tooltip');
        this.zoomLabel = this.root.querySelector('.town-scene__zoom-label');

        this.renderSnapshot();
        this.bindInteractions();
        this.selectDistrict(this.selectedId);
    }

    /**
     * Sustituye la presentación sin asumir de dónde proviene el snapshot.
     * @param {import('../adapters/town-scene-contracts.js').TownSceneSnapshot} snapshot
     */
    setSnapshot(snapshot) {
        if (!isTownSceneSnapshot(snapshot)) {
            throw new Error('TownScene recibió un snapshot incompatible.');
        }
        this.snapshot = snapshot;
        if (!snapshot.districts.some((district) => district.id === this.selectedId)) {
            this.selectedId = snapshot.districts[0]?.id || '';
        }
        this.renderSnapshot();
        this.selectDistrict(this.selectedId);
    }

    renderSnapshot() {
        this.title.textContent = this.snapshot.title;
        this.subtitle.textContent = this.snapshot.subtitle;
        this.resources.replaceChildren(...this.snapshot.resources.map((resource) => {
            const item = document.createElement('div');
            item.className = 'town-scene__resource';
            item.style.setProperty('--resource-accent', resource.accent);

            const value = document.createElement('strong');
            value.textContent = resource.value;
            const label = document.createElement('span');
            label.textContent = resource.label;
            item.append(value, label);
            return item;
        }));

        this.world.innerHTML = createTownBackdrop();
        this.nodes = this.snapshot.districts.map((district) => {
            const node = createTownNode(district, {
                onSelect: (selectedDistrict, element) => {
                    this.selectDistrict(selectedDistrict.id);
                    this.showTooltip(selectedDistrict, element);
                },
                onInspect: (inspectedDistrict, element) => this.showTooltip(inspectedDistrict, element),
                onLeave: () => this.hideTooltip()
            });
            this.world.append(node);
            return node;
        });
        this.renderTransform();
    }

    bindInteractions() {
        this.root.querySelector('[data-town-control="zoom-in"]').addEventListener('click', () => this.setZoom(this.zoom + zoomStep));
        this.root.querySelector('[data-town-control="zoom-out"]').addEventListener('click', () => this.setZoom(this.zoom - zoomStep));
        this.root.querySelector('[data-town-control="reset"]').addEventListener('click', () => this.resetView());
        this.svg.addEventListener('wheel', this.boundWheel, { passive: false });
        this.svg.addEventListener('pointerdown', this.boundPointerDown);
        this.svg.addEventListener('pointermove', this.boundPointerMove);
        this.svg.addEventListener('pointerup', this.boundPointerUp);
        this.svg.addEventListener('pointercancel', this.boundPointerUp);
        this.svg.addEventListener('keydown', this.boundKeyDown);
    }

    handleWheel(event) {
        event.preventDefault();
        this.setZoom(this.zoom + (event.deltaY < 0 ? zoomStep : -zoomStep));
    }

    handlePointerDown(event) {
        if (event.button !== 0 || event.target.closest('[data-town-node]')) {
            return;
        }
        this.drag = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
        this.svg.setPointerCapture(event.pointerId);
        this.svg.classList.add('is-panning');
        this.hideTooltip();
    }

    handlePointerMove(event) {
        if (!this.drag || event.pointerId !== this.drag.pointerId) {
            return;
        }
        const bounds = this.svg.getBoundingClientRect();
        const scale = mapWidth / Math.max(bounds.width, 1) / this.zoom;
        this.pan.x += (event.clientX - this.drag.x) * scale;
        this.pan.y += (event.clientY - this.drag.y) * scale;
        this.drag.x = event.clientX;
        this.drag.y = event.clientY;
        this.renderTransform();
    }

    handlePointerUp(event) {
        if (!this.drag || event.pointerId !== this.drag.pointerId) {
            return;
        }
        this.drag = null;
        this.svg.classList.remove('is-panning');
        if (this.svg.hasPointerCapture(event.pointerId)) {
            this.svg.releasePointerCapture(event.pointerId);
        }
    }

    handleMapKeyDown(event) {
        if (event.key === '+' || event.key === '=') {
            event.preventDefault();
            this.setZoom(this.zoom + zoomStep);
        }
        else if (event.key === '-') {
            event.preventDefault();
            this.setZoom(this.zoom - zoomStep);
        }
        else if (event.key === '0') {
            event.preventDefault();
            this.resetView();
        }
    }

    setZoom(nextZoom) {
        this.zoom = clamp(nextZoom, minimumZoom, maximumZoom);
        this.renderTransform();
    }

    resetView() {
        this.zoom = 1;
        this.pan = { x: 0, y: 0 };
        this.renderTransform();
    }

    renderTransform() {
        this.world.setAttribute('transform', `translate(${this.pan.x} ${this.pan.y}) scale(${this.zoom})`);
        this.zoomLabel.textContent = `${Math.round(this.zoom * 100)}%`;
    }

    selectDistrict(id) {
        const district = this.snapshot.districts.find((candidate) => candidate.id === id);
        if (!district) {
            return;
        }
        this.selectedId = district.id;
        updateTownNodeSelection(this.nodes, district.id);
        renderTownPanel(this.panel, district, this.snapshot.source);
        this.onSelectionChange(district);
    }

    showTooltip(district, element) {
        const rootBounds = this.root.getBoundingClientRect();
        const nodeBounds = element.getBoundingClientRect();
        this.tooltip.textContent = `${district.label}: ${district.status}`;
        this.tooltip.hidden = false;
        const tooltipBounds = this.tooltip.getBoundingClientRect();
        const left = clamp(nodeBounds.left - rootBounds.left + nodeBounds.width / 2 - tooltipBounds.width / 2, 12, rootBounds.width - tooltipBounds.width - 12);
        const top = clamp(nodeBounds.top - rootBounds.top - tooltipBounds.height - 10, 12, rootBounds.height - tooltipBounds.height - 12);
        this.tooltip.style.left = `${left}px`;
        this.tooltip.style.top = `${top}px`;
    }

    hideTooltip() {
        this.tooltip.hidden = true;
    }

    destroy() {
        if (!this.svg) {
            return;
        }
        this.svg.removeEventListener('wheel', this.boundWheel);
        this.svg.removeEventListener('pointerdown', this.boundPointerDown);
        this.svg.removeEventListener('pointermove', this.boundPointerMove);
        this.svg.removeEventListener('pointerup', this.boundPointerUp);
        this.svg.removeEventListener('pointercancel', this.boundPointerUp);
        this.svg.removeEventListener('keydown', this.boundKeyDown);
        this.root.replaceChildren();
        this.nodes = [];
    }
}
