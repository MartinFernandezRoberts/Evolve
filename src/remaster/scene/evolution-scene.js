import { loc } from '../../locale.js';
import { isRemasterPhaseSnapshot } from '../adapters/phase-scene-contracts.js';

const mapWidth = 1600;
const mapHeight = 900;
const minimumZoom = 0.58;
const maximumZoom = 1.65;
const zoomStep = 0.14;

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function actionStage(action) {
    return Number.isFinite(action.stage) ? action.stage : 0;
}

function actionStructureKey(action) {
    const requirements = action.requirements.map((requirement) => `${requirement.id}:${requirement.level}`).join(',');
    const grant = action.grant ? `${action.grant.id}:${action.grant.level}` : '';
    return `${action.id}:${action.label}:${actionStage(action)}:${requirements}:${grant}`;
}

/**
 * EvoluciÃ³n es una vista puramente de presentaciÃ³n. Recibe las acciones y
 * costes ya resueltos por el snapshot, y emite intenciones al bridge sin
 * importar estado de juego ni definiciones de acciones.
 */
export class EvolutionScene {
    /** @param {{ commands?: { executeEvolutionAction?: Function }, transition?: boolean }} [options] */
    constructor(options = {}) {
        this.commands = options.commands || null;
        this.transition = options.transition === true;
        this.host = null;
        this.snapshot = null;
        this.nodeById = new Map();
        this.positions = new Map();
        this.resourceNodes = new Map();
        this.selectedId = '';
        this.structureKey = '';
        this.panelKey = '';
        this.zoom = 1;
        this.pan = { x: 0, y: 0 };
        this.drag = null;
        this.skipTransition = false;
        this.reducedMotion = false;
        this.reducedMotionQuery = null;
        this.boundClick = this.handleClick.bind(this);
        this.boundFocusIn = this.handleFocusIn.bind(this);
        this.boundPointerOver = this.handlePointerOver.bind(this);
        this.boundPointerOut = this.handlePointerOut.bind(this);
        this.boundWheel = this.handleWheel.bind(this);
        this.boundPointerDown = this.handlePointerDown.bind(this);
        this.boundPointerMove = this.handlePointerMove.bind(this);
        this.boundPointerUp = this.handlePointerUp.bind(this);
        this.boundKeyDown = this.handleKeyDown.bind(this);
        this.boundMotionChange = this.handleMotionChange.bind(this);
    }

    /** @param {HTMLElement} host @param {import('../adapters/phase-scene-contracts.js').RemasterPhaseSnapshot} snapshot */
    mount(host, snapshot) {
        this.host = host;
        this.host.innerHTML = `
            <section class="evolution-scene" aria-labelledby="evolution-scene-title">
                <header class="evolution-scene__header">
                    <div>
                        <p class="evolution-scene__eyebrow"></p>
                        <h1 id="evolution-scene-title"></h1>
                        <p class="evolution-scene__subtitle"></p>
                    </div>
                    <div class="evolution-scene__resources"></div>
                </header>
                <div class="evolution-scene__layout">
                    <div class="evolution-scene__map-frame">
                        <div class="evolution-scene__toolbar" role="group">
                            <button type="button" data-evolution-control="zoom-out">âˆ’</button>
                            <button type="button" data-evolution-control="center"></button>
                            <button type="button" data-evolution-control="zoom-in">+</button>
                            <span class="evolution-scene__zoom" aria-live="polite"></span>
                        </div>
                        <p class="evolution-scene__hint"></p>
                        <div class="evolution-scene__viewport" tabindex="0">
                            <div class="evolution-scene__world"></div>
                        </div>
                        <output class="evolution-scene__tooltip" role="tooltip" aria-live="polite" hidden></output>
                    </div>
                    <aside class="evolution-scene__panel" aria-live="polite"></aside>
                </div>
            </section>
        `;
        this.sceneElement = this.host.querySelector('.evolution-scene');
        this.resourcesElement = this.host.querySelector('.evolution-scene__resources');
        this.viewport = this.host.querySelector('.evolution-scene__viewport');
        this.world = this.host.querySelector('.evolution-scene__world');
        this.panel = this.host.querySelector('.evolution-scene__panel');
        this.tooltip = this.host.querySelector('.evolution-scene__tooltip');
        this.zoomLabel = this.host.querySelector('.evolution-scene__zoom');
        this.host.addEventListener('click', this.boundClick);
        this.host.addEventListener('focusin', this.boundFocusIn);
        this.host.addEventListener('pointerover', this.boundPointerOver);
        this.host.addEventListener('pointerout', this.boundPointerOut);
        this.viewport.addEventListener('wheel', this.boundWheel, { passive: false });
        this.viewport.addEventListener('pointerdown', this.boundPointerDown);
        this.viewport.addEventListener('pointermove', this.boundPointerMove);
        this.viewport.addEventListener('pointerup', this.boundPointerUp);
        this.viewport.addEventListener('pointercancel', this.boundPointerUp);
        this.viewport.addEventListener('keydown', this.boundKeyDown);
        this.bindMotionPreference();
        this.setSnapshot(snapshot, true);
        this.refreshLocalization();
    }

    /** @param {object|null|undefined} commands */
    setCommands(commands) {
        this.commands = commands || null;
        this.panelKey = '';
        this.renderPanel();
    }

    /** @param {import('../adapters/phase-scene-contracts.js').RemasterPhaseSnapshot} snapshot @param {boolean} [force] */
    setSnapshot(snapshot, force = false) {
        if (!isRemasterPhaseSnapshot(snapshot)) {
            throw new Error('EvolutionScene recibiÃ³ un snapshot incompatible.');
        }
        this.snapshot = snapshot;
        const actions = snapshot.evolution.actions;
        if (!actions.some((action) => action.id === this.selectedId)) {
            this.selectedId = actions[0]?.id || '';
        }
        const focusedId = document.activeElement instanceof HTMLElement ? document.activeElement.dataset.evolutionNode : '';
        const nextStructureKey = actions.map(actionStructureKey).join('|');
        if (force || nextStructureKey !== this.structureKey) {
            this.structureKey = nextStructureKey;
            this.rebuildGraph();
        }
        this.syncActionState();
        this.syncResources();
        this.renderOrganism();
        this.renderPanel();
        this.renderTransform();
        if (focusedId && this.nodeById.has(focusedId)) {
            this.nodeById.get(focusedId).focus({ preventScroll: true });
        }
    }

    refreshLocalization() {
        if (!this.host || !this.snapshot) {
            return;
        }
        this.host.querySelector('.evolution-scene__eyebrow').textContent = loc('remaster_visual_title');
        this.host.querySelector('#evolution-scene-title').textContent = loc(this.transition ? 'evo_sentience_title' : 'tab_evolve');
        this.host.querySelector('.evolution-scene__subtitle').textContent = loc('remaster_scene_subtitle', [loc(this.transition ? 'evo_sentience_title' : 'tab_evolve')]);
        const toolbar = this.host.querySelector('.evolution-scene__toolbar');
        toolbar?.setAttribute('aria-label', loc('remaster_map_controls'));
        const zoomOut = this.host.querySelector('[data-evolution-control="zoom-out"]');
        const zoomIn = this.host.querySelector('[data-evolution-control="zoom-in"]');
        const center = this.host.querySelector('[data-evolution-control="center"]');
        zoomOut?.setAttribute('aria-label', loc('remaster_zoom_out'));
        zoomIn?.setAttribute('aria-label', loc('remaster_zoom_in'));
        if (center) {
            center.textContent = loc('remaster_reset_view');
            center.setAttribute('aria-label', loc('remaster_reset_view'));
        }
        const hint = this.host.querySelector('.evolution-scene__hint');
        if (hint) {
            hint.textContent = loc('remaster_pan_hint');
        }
        this.viewport?.setAttribute('aria-label', loc('remaster_map_label'));
        this.panelKey = '';
        this.renderPanel();
    }

    bindMotionPreference() {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return;
        }
        this.reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        this.reducedMotion = this.reducedMotionQuery.matches;
        if (typeof this.reducedMotionQuery.addEventListener === 'function') {
            this.reducedMotionQuery.addEventListener('change', this.boundMotionChange);
        }
        else {
            this.reducedMotionQuery.addListener(this.boundMotionChange);
        }
        this.applyMotionState();
    }

    handleMotionChange(event) {
        this.reducedMotion = Boolean(event.matches);
        this.applyMotionState();
    }

    applyMotionState() {
        this.sceneElement?.classList.toggle('is-reduced-motion', this.reducedMotion);
        this.sceneElement?.classList.toggle('is-transition-skipped', this.skipTransition);
    }

    getLayout(actions) {
        const groups = new Map();
        actions.forEach((action) => {
            const stage = actionStage(action);
            if (!groups.has(stage)) {
                groups.set(stage, []);
            }
            groups.get(stage).push(action);
        });
        const stages = [...groups.keys()].sort((a, b) => a - b);
        const positions = new Map();
        stages.forEach((stage, stageIndex) => {
            const group = groups.get(stage).slice().sort((a, b) => a.label.localeCompare(b.label));
            const columns = Math.min(3, Math.max(1, Math.ceil(Math.sqrt(group.length))));
            const rows = Math.max(1, Math.ceil(group.length / columns));
            const stageX = stages.length === 1 ? mapWidth / 2 : 150 + (stageIndex * 1300 / (stages.length - 1));
            group.forEach((action, index) => {
                const column = index % columns;
                const row = Math.floor(index / columns);
                positions.set(action.id, {
                    x: stageX + ((column - (columns - 1) / 2) * 132),
                    y: 165 + ((row + .5) * 570 / rows)
                });
            });
        });
        return positions;
    }

    rebuildGraph() {
        this.positions = this.getLayout(this.snapshot.evolution.actions);
        this.nodeById.clear();
        this.world.replaceChildren();
        const backdrop = document.createElement('div');
        backdrop.className = 'evolution-scene__backdrop';
        backdrop.innerHTML = `
            <svg viewBox="0 0 ${mapWidth} ${mapHeight}" aria-hidden="true">
                <defs>
                    <radialGradient id="evolution-map-depth" cx="50%" cy="45%"><stop stop-color="#1a777a"/><stop offset=".56" stop-color="#173e62"/><stop offset="1" stop-color="#101d42"/></radialGradient>
                    <filter id="evolution-map-glow"><feGaussianBlur stdDeviation="12"/></filter>
                </defs>
                <rect width="${mapWidth}" height="${mapHeight}" fill="url(#evolution-map-depth)"/>
                <path d="M0 700C230 550 346 845 590 652S930 480 1190 635 1450 700 1600 510V900H0Z" fill="#0b304d" opacity=".72"/>
                <circle cx="260" cy="205" r="112" fill="#40b9a0" opacity=".12" filter="url(#evolution-map-glow)"/>
                <circle cx="1270" cy="686" r="146" fill="#a970d9" opacity=".13" filter="url(#evolution-map-glow)"/>
            </svg>
        `;
        const edgeLayer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        edgeLayer.classList.add('evolution-scene__edges');
        edgeLayer.setAttribute('viewBox', `0 0 ${mapWidth} ${mapHeight}`);
        edgeLayer.setAttribute('aria-hidden', 'true');
        const actionByGrant = new Map();
        this.snapshot.evolution.actions.forEach((action) => {
            if (!action.grant) {
                return;
            }
            const key = action.grant.id;
            const known = actionByGrant.get(key) || [];
            known.push(action);
            actionByGrant.set(key, known);
        });
        this.snapshot.evolution.actions.forEach((target) => {
            target.requirements.forEach((requirement) => {
                const sources = (actionByGrant.get(requirement.id) || [])
                    .filter((candidate) => candidate.grant.level === null || candidate.grant.level >= requirement.level)
                    .filter((candidate) => this.positions.has(candidate.id));
                const source = sources.sort((a, b) => actionStage(b) - actionStage(a))[0];
                const start = source && this.positions.get(source.id);
                const end = this.positions.get(target.id);
                if (!start || !end || source.id === target.id) {
                    return;
                }
                const curve = Math.max(46, Math.abs(end.x - start.x) * .36);
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', `M ${start.x} ${start.y} C ${start.x + curve} ${start.y}, ${end.x - curve} ${end.y}, ${end.x} ${end.y}`);
                edgeLayer.append(path);
            });
        });
        const organism = document.createElement('div');
        organism.className = 'evolution-scene__organism';
        organism.setAttribute('aria-hidden', 'true');
        organism.innerHTML = `
            <svg viewBox="0 0 260 260">
                <defs><radialGradient id="evolution-organism-core"><stop stop-color="#fff2ad"/><stop offset=".42" stop-color="#ffad59"/><stop offset="1" stop-color="#783866"/></radialGradient></defs>
                <ellipse class="evolution-scene__organism-shadow" cx="130" cy="200" rx="76" ry="18"/>
                <path class="evolution-scene__organism-tail" d="M74 145C10 128 28 72 73 102"/>
                <circle class="evolution-scene__organism-shell" cx="130" cy="126" r="68"/>
                <circle class="evolution-scene__organism-core" cx="130" cy="126" r="39" fill="url(#evolution-organism-core)"/>
                <circle class="evolution-scene__organism-nucleus" cx="130" cy="126" r="15"/>
                <g class="evolution-scene__organism-limbs"><path d="M83 158 50 183M177 158l33 25M90 93 60 70M170 93l30-23"/></g>
            </svg>
        `;
        const nodeLayer = document.createElement('div');
        nodeLayer.className = 'evolution-scene__nodes';
        this.snapshot.evolution.actions.forEach((action) => {
            const position = this.positions.get(action.id);
            const node = document.createElement('button');
            node.type = 'button';
            node.className = 'evolution-scene__node';
            node.dataset.evolutionNode = action.id;
            node.style.left = `${position.x}px`;
            node.style.top = `${position.y}px`;
            const emblem = document.createElement('span');
            emblem.className = 'evolution-scene__node-emblem';
            emblem.setAttribute('aria-hidden', 'true');
            if (action.emblem) {
                emblem.innerHTML = action.emblem;
            }
            else {
                emblem.textContent = 'â—‡';
            }
            const title = document.createElement('span');
            title.className = 'evolution-scene__node-title';
            title.textContent = action.label;
            const count = document.createElement('span');
            count.className = 'evolution-scene__node-count';
            node.append(emblem, title, count);
            nodeLayer.append(node);
            this.nodeById.set(action.id, node);
        });
        this.world.append(backdrop, edgeLayer, organism, nodeLayer);
        this.applyMotionState();
    }

    syncActionState() {
        this.snapshot.evolution.actions.forEach((action) => {
            const node = this.nodeById.get(action.id);
            if (!node) {
                return;
            }
            const selected = action.id === this.selectedId;
            node.classList.toggle('is-selected', selected);
            node.classList.toggle('is-active', action.active);
            node.classList.toggle('is-unaffordable', !action.affordable);
            node.classList.toggle('is-locked', action.locked);
            node.disabled = false;
            node.setAttribute('aria-disabled', String(!action.available));
            node.setAttribute('aria-pressed', String(selected));
            node.setAttribute('aria-controls', 'evolution-scene-panel');
            node.setAttribute('aria-label', [action.label, action.description, action.effect].filter(Boolean).join('. '));
            node.title = [action.label, action.description, action.effect].filter(Boolean).join('\n');
            const count = node.querySelector('.evolution-scene__node-count');
            count.textContent = action.count === null ? '' : String(action.count);
            count.hidden = action.count === null || action.count <= 0;
        });
    }

    syncResources() {
        const resources = this.snapshot.evolution.resources;
        const ids = new Set(resources.map((resource) => resource.id));
        this.resourceNodes.forEach((node, id) => {
            if (!ids.has(id)) {
                node.remove();
                this.resourceNodes.delete(id);
            }
        });
        resources.forEach((resource) => {
            let node = this.resourceNodes.get(resource.id);
            if (!node) {
                node = document.createElement('div');
                node.className = 'evolution-scene__resource';
                const label = document.createElement('span');
                const value = document.createElement('strong');
                const diff = document.createElement('small');
                node.append(label, value, diff);
                this.resourceNodes.set(resource.id, node);
                this.resourcesElement.append(node);
            }
            node.classList.toggle('is-producing', resource.diff > 0);
            node.classList.toggle('is-consuming', resource.diff < 0);
            node.title = `${resource.label}: ${resource.value} (${resource.diff})`;
            node.setAttribute('aria-label', node.title);
            const [label, value, diff] = node.children;
            label.textContent = resource.label;
            value.textContent = resource.value;
            diff.textContent = resource.diff === 0 ? '' : `${resource.diff > 0 ? '+' : ''}${resource.diff}`;
        });
    }

    renderOrganism() {
        const organism = this.world?.querySelector('.evolution-scene__organism');
        if (!organism) {
            return;
        }
        const level = this.snapshot.evolution.technologies
            .filter((technology) => technology.id === 'evo')
            .reduce((highest, technology) => Math.max(highest, technology.level), 0);
        organism.dataset.stage = String(level);
        organism.classList.toggle('is-sentient-ready', this.snapshot.evolution.sentienceReady);
    }

    renderPanel() {
        if (!this.panel || !this.snapshot) {
            return;
        }
        const action = this.snapshot.evolution.actions.find((candidate) => candidate.id === this.selectedId) || null;
        const panelKey = JSON.stringify({ action, progress: this.snapshot.evolution.progress, transition: this.transition, skipped: this.skipTransition });
        if (panelKey === this.panelKey) {
            return;
        }
        this.panelKey = panelKey;
        this.panel.replaceChildren();
        this.panel.id = 'evolution-scene-panel';
        if (!action) {
            return;
        }
        const heading = document.createElement('h2');
        heading.textContent = action.label;
        const description = document.createElement('p');
        description.textContent = action.description;
        this.panel.append(heading, description);
        if (action.effect) {
            const effect = document.createElement('p');
            effect.className = 'evolution-scene__effect';
            effect.textContent = action.effect;
            this.panel.append(effect);
        }
        const costs = document.createElement('ul');
        costs.className = 'evolution-scene__costs';
        action.costs.forEach((cost) => {
            const item = document.createElement('li');
            item.classList.add(`is-${cost.status}`);
            item.textContent = cost.text;
            costs.append(item);
        });
        if (action.costs.length) {
            this.panel.append(costs);
        }
        if (Number.isFinite(this.snapshot.evolution.progress.final)) {
            const progress = document.createElement('progress');
            progress.className = 'evolution-scene__progress';
            progress.value = this.snapshot.evolution.progress.final;
            progress.max = 100;
            progress.textContent = `${this.snapshot.evolution.progress.final}%`;
            this.panel.append(progress);
        }
        const execute = document.createElement('button');
        execute.type = 'button';
        execute.dataset.evolutionExecute = action.id;
        execute.className = 'evolution-scene__execute';
        execute.textContent = loc('evo_evolve');
        execute.disabled = !action.available || typeof this.commands?.executeEvolutionAction !== 'function';
        execute.setAttribute('aria-disabled', String(execute.disabled));
        this.panel.append(execute);
        if (this.transition && !this.skipTransition) {
            const skip = document.createElement('button');
            skip.type = 'button';
            skip.dataset.evolutionSkip = 'true';
            skip.className = 'evolution-scene__skip';
            skip.textContent = loc('remaster_skip_animation');
            this.panel.append(skip);
        }
    }

    selectAction(id, focus = false) {
        if (!this.snapshot.evolution.actions.some((action) => action.id === id)) {
            return;
        }
        this.selectedId = id;
        this.panelKey = '';
        this.syncActionState();
        this.renderPanel();
        const node = this.nodeById.get(id);
        if (node) {
            this.showTooltip(node.title, node);
            if (focus) {
                node.focus({ preventScroll: true });
            }
        }
    }

    executeAction(id) {
        const result = this.commands?.executeEvolutionAction?.(id);
        if (result?.success) {
            this.nodeById.get(id)?.classList.add('is-confirmed');
        }
    }

    handleClick(event) {
        if (!(event.target instanceof Element)) {
            return;
        }
        const control = event.target.closest('[data-evolution-control]');
        if (control && this.host.contains(control)) {
            switch (control.dataset.evolutionControl) {
                case 'zoom-in': this.setZoom(this.zoom + zoomStep); break;
                case 'zoom-out': this.setZoom(this.zoom - zoomStep); break;
                default: this.resetView(); break;
            }
            return;
        }
        const node = event.target.closest('[data-evolution-node]');
        if (node && this.host.contains(node)) {
            this.selectAction(node.dataset.evolutionNode);
            return;
        }
        const execute = event.target.closest('[data-evolution-execute]');
        if (execute && this.host.contains(execute)) {
            this.executeAction(execute.dataset.evolutionExecute);
            return;
        }
        if (event.target.closest('[data-evolution-skip]')) {
            this.skipTransition = true;
            this.panelKey = '';
            this.applyMotionState();
            this.renderPanel();
        }
    }

    handleFocusIn(event) {
        const node = event.target instanceof Element ? event.target.closest('[data-evolution-node]') : null;
        if (node && this.host.contains(node)) {
            this.selectAction(node.dataset.evolutionNode);
        }
    }

    handlePointerOver(event) {
        const node = event.target instanceof Element ? event.target.closest('[data-evolution-node]') : null;
        if (node && this.host.contains(node)) {
            this.showTooltip(node.title, node);
        }
    }

    handlePointerOut(event) {
        const node = event.target instanceof Element ? event.target.closest('[data-evolution-node]') : null;
        if (node && this.host.contains(node) && !node.contains(event.relatedTarget)) {
            this.hideTooltip();
        }
    }

    handleWheel(event) {
        event.preventDefault();
        this.setZoom(this.zoom + (event.deltaY < 0 ? zoomStep : -zoomStep));
    }

    handlePointerDown(event) {
        if (event.button !== 0 || event.target.closest('button')) {
            return;
        }
        this.drag = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
        this.viewport.setPointerCapture(event.pointerId);
        this.viewport.classList.add('is-panning');
        this.hideTooltip();
    }

    handlePointerMove(event) {
        if (!this.drag || event.pointerId !== this.drag.pointerId) {
            return;
        }
        this.pan.x += event.clientX - this.drag.x;
        this.pan.y += event.clientY - this.drag.y;
        this.drag.x = event.clientX;
        this.drag.y = event.clientY;
        this.renderTransform();
    }

    handlePointerUp(event) {
        if (!this.drag || event.pointerId !== this.drag.pointerId) {
            return;
        }
        this.drag = null;
        this.viewport.classList.remove('is-panning');
        if (this.viewport.hasPointerCapture(event.pointerId)) {
            this.viewport.releasePointerCapture(event.pointerId);
        }
    }

    handleKeyDown(event) {
        if (event.key === '+' || event.key === '=') {
            event.preventDefault();
            this.setZoom(this.zoom + zoomStep);
        }
        else if (event.key === '-') {
            event.preventDefault();
            this.setZoom(this.zoom - zoomStep);
        }
        else if (event.key === '0' || event.key === 'Home') {
            event.preventDefault();
            this.resetView();
        }
        else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            event.preventDefault();
            const amount = 42;
            if (event.key === 'ArrowUp') { this.pan.y += amount; }
            if (event.key === 'ArrowDown') { this.pan.y -= amount; }
            if (event.key === 'ArrowLeft') { this.pan.x += amount; }
            if (event.key === 'ArrowRight') { this.pan.x -= amount; }
            this.renderTransform();
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
        if (!this.world) {
            return;
        }
        this.world.style.transform = `translate(${this.pan.x}px, ${this.pan.y}px) scale(${this.zoom})`;
        this.zoomLabel.textContent = `${Math.round(this.zoom * 100)}%`;
    }

    showTooltip(text, element) {
        if (!this.tooltip || !element || !text) {
            return;
        }
        const rootBounds = this.host.getBoundingClientRect();
        const targetBounds = element.getBoundingClientRect();
        this.tooltip.textContent = text;
        this.tooltip.hidden = false;
        const tooltipBounds = this.tooltip.getBoundingClientRect();
        this.tooltip.style.left = `${clamp(targetBounds.left - rootBounds.left + targetBounds.width / 2 - tooltipBounds.width / 2, 12, rootBounds.width - tooltipBounds.width - 12)}px`;
        this.tooltip.style.top = `${clamp(targetBounds.top - rootBounds.top - tooltipBounds.height - 9, 12, rootBounds.height - tooltipBounds.height - 12)}px`;
    }

    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.hidden = true;
        }
    }

    destroy() {
        this.viewport?.removeEventListener('wheel', this.boundWheel);
        this.viewport?.removeEventListener('pointerdown', this.boundPointerDown);
        this.viewport?.removeEventListener('pointermove', this.boundPointerMove);
        this.viewport?.removeEventListener('pointerup', this.boundPointerUp);
        this.viewport?.removeEventListener('pointercancel', this.boundPointerUp);
        this.viewport?.removeEventListener('keydown', this.boundKeyDown);
        this.host?.removeEventListener('click', this.boundClick);
        this.host?.removeEventListener('focusin', this.boundFocusIn);
        this.host?.removeEventListener('pointerover', this.boundPointerOver);
        this.host?.removeEventListener('pointerout', this.boundPointerOut);
        if (this.reducedMotionQuery) {
            if (typeof this.reducedMotionQuery.removeEventListener === 'function') {
                this.reducedMotionQuery.removeEventListener('change', this.boundMotionChange);
            }
            else {
                this.reducedMotionQuery.removeListener(this.boundMotionChange);
            }
        }
        this.nodeById.clear();
        this.positions.clear();
        this.resourceNodes.clear();
        this.host?.replaceChildren();
        this.host = null;
        this.snapshot = null;
    }
}
