import { loc } from '../../locale.js';

function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) {
        element.className = className;
    }
    if (typeof text === 'string') {
        element.textContent = text;
    }
    return element;
}

function formatWorkerLimit(worker) {
    return worker.max === null || worker.max === -1 ? String(worker.workers) : `${worker.workers} / ${worker.max}`;
}

function getFocusedControl(panel) {
    const active = document.activeElement;
    return active instanceof HTMLElement && panel.contains(active) ? active.dataset.townFocus || '' : '';
}

function restoreFocusedControl(panel, focusKey) {
    if (!focusKey) {
        return;
    }
    const control = panel.querySelector(`[data-town-focus="${focusKey}"]`);
    if (control instanceof HTMLElement && !control.hasAttribute('disabled')) {
        control.focus({ preventScroll: true });
    }
    else {
        panel.tabIndex = -1;
        panel.focus({ preventScroll: true });
    }
}

function createButton(label, focusKey, disabled, onClick, className = '') {
    const button = createElement('button', `town-scene__action ${className}`.trim(), label);
    button.type = 'button';
    button.dataset.townFocus = focusKey;
    button.disabled = Boolean(disabled);
    button.addEventListener('click', onClick);
    return button;
}

function renderDistrictPanel(panel, district, source, buildings, onSelectBuilding) {
    const eyebrow = createElement('p', 'town-scene__panel-eyebrow', source === 'mock' ? loc('remaster_demo_data') : loc('remaster_civilization_view'));
    const heading = createElement('h2', '', district.label);
    const status = createElement('p', 'town-scene__status', district.status);
    status.style.setProperty('--district-accent', district.accent);
    const summary = createElement('p', 'town-scene__panel-summary', district.summary);
    const detail = createElement('p', 'town-scene__panel-detail', district.detail);
    const listHeading = createElement('h3', 'town-scene__subheading', loc('remaster_district_buildings'));
    const buildingList = createElement('ul', 'town-scene__building-picker');

    buildings.forEach((building) => {
        const item = document.createElement('li');
        const state = building.count > 0 ? `×${building.count}` : (building.affordable === false ? loc('remaster_no_resources') : loc('remaster_available'));
        const button = createButton(`${building.label} — ${state}`, `select-${building.id}`, false, () => onSelectBuilding(building.id), 'town-scene__building-choice');
        item.append(button);
        buildingList.append(item);
    });

    if (buildings.length === 0) {
        buildingList.append(createElement('li', '', loc('remaster_no_buildings')));
    }

    panel.append(eyebrow, heading, status, summary, detail, listHeading, buildingList);
}

function renderActionResult(result, onAction, type, buildingId) {
    try {
        onAction({ type, buildingId, result });
    }
    catch (error) {
        // La ruta del motor informa los errores al sistema de mensajes original.
        onAction({ type, buildingId, result: { success: false }, error });
    }
}

function renderBuildingPanel(panel, building, source, commands, onAction, onBack) {
    const detail = building.detail;
    const eyebrow = createElement('p', 'town-scene__panel-eyebrow', source === 'mock' ? loc('remaster_demo_data') : loc('remaster_civilization_view'));
    const back = createButton(`← ${loc('remaster_back_to_district')}`, 'back-to-district', false, onBack, 'town-scene__back');
    const heading = createElement('h2', '', building.label);
    const count = createElement('p', 'town-scene__building-count', loc('remaster_quantity', [building.count]));
    const description = createElement('p', 'town-scene__panel-detail', detail?.description || '');

    panel.append(eyebrow, back, heading, count, description);

    if (!detail) {
        panel.append(createElement('div', 'town-scene__mock-notice', loc('remaster_demo_notice')));
        return;
    }

    if (detail.effect) {
        panel.append(createElement('p', 'town-scene__building-effect', detail.effect));
    }

    const costState = detail.affordable ? loc('remaster_sufficient_resources') : loc('remaster_insufficient_resources');
    const costHeading = createElement('h3', 'town-scene__subheading', `${loc('remaster_current_cost')} — ${costState}`);
    const costList = createElement('ul', `town-scene__cost-list ${detail.affordable ? 'is-affordable' : 'is-insufficient'}`);
    detail.costs.forEach((cost) => {
        costList.append(createElement('li', `is-${cost.status}`, cost.text));
    });
    if (detail.costs.length === 0) {
        costList.append(createElement('li', '', '—'));
    }
    panel.append(costHeading, costList);

    const actionGroup = createElement('div', 'town-scene__action-group');
    actionGroup.setAttribute('role', 'group');
    actionGroup.setAttribute('aria-label', `${loc('construct')} ${building.label}`);
    detail.buildAmounts.forEach((amount) => {
        actionGroup.append(createButton(`${loc('construct')} ${amount}`, `build-${building.id}-${amount}`, !detail.affordable || !commands?.build, () => {
            renderActionResult(commands.build(building.id, amount), onAction, 'build', building.id);
        }, 'town-scene__action--build'));
    });
    if (detail.maxBuild) {
        actionGroup.append(createButton(loc('remaster_build_maximum'), `build-${building.id}-max`, !detail.affordable || !commands?.buildMax, () => {
            renderActionResult(commands.buildMax(building.id), onAction, 'build', building.id);
        }, 'town-scene__action--build'));
    }
    panel.append(actionGroup);

    if (detail.energy) {
        const energyKey = detail.energy.direction === 'produced' ? 'remaster_energy_generated' : 'remaster_energy_used';
        const energy = createElement('p', 'town-scene__building-energy', loc(energyKey, [detail.energy.value]));
        panel.append(energy);
    }

    if (detail.enabled) {
        const powerHeading = createElement('h3', 'town-scene__subheading', `${loc('remaster_enabled')}: ${detail.enabled.on} · ${loc('remaster_disabled')}: ${detail.enabled.off}`);
        const powerGroup = createElement('div', 'town-scene__action-group');
        powerGroup.setAttribute('role', 'group');
        powerGroup.setAttribute('aria-label', loc('remaster_building_status', [building.label]));
        powerGroup.append(
            createButton(loc('active'), `power-${building.id}-on`, detail.enabled.off <= 0 || !commands?.setPower, () => {
                renderActionResult(commands.setPower(building.id, true), onAction, 'power', building.id);
            }, 'town-scene__action--power'),
            createButton(loc('not_active'), `power-${building.id}-off`, detail.enabled.on <= 0 || !commands?.setPower, () => {
                renderActionResult(commands.setPower(building.id, false), onAction, 'power', building.id);
            }, 'town-scene__action--power')
        );
        panel.append(powerHeading, powerGroup);
    }

    if (detail.workers.length > 0) {
        panel.append(createElement('h3', 'town-scene__subheading', loc('remaster_associated_workers')));
        const workers = createElement('ul', 'town-scene__worker-list');
        detail.workers.forEach((worker) => {
            const item = createElement('li', 'town-scene__worker');
            const label = createElement('span', '', `${worker.label}: ${formatWorkerLimit(worker)}`);
            const controls = createElement('span', 'town-scene__worker-controls');
            controls.append(
                createButton('−', `worker-${building.id}-${worker.id}-remove`, !worker.canRemove || !commands?.setWorkers, () => {
                    renderActionResult(commands.setWorkers(building.id, worker.id, -1), onAction, 'workers', building.id);
                }, 'town-scene__action--worker'),
                createButton('+', `worker-${building.id}-${worker.id}-add`, !worker.canAssign || !commands?.setWorkers, () => {
                    renderActionResult(commands.setWorkers(building.id, worker.id, 1), onAction, 'workers', building.id);
                }, 'town-scene__action--worker')
            );
            item.append(label, controls);
            workers.append(item);
        });
        panel.append(workers);
    }

    const queue = createElement('p', `town-scene__queue ${detail.queue.count > 0 ? 'is-queued' : ''}`, detail.queue.count > 0
        ? `${loc('queue')}: ${detail.queue.amount} / ${detail.queue.count}`
        : loc('remaster_no_queue'));
    queue.setAttribute('aria-live', 'polite');
    panel.append(queue);
}

/**
 * Actualiza el panel lateral sin exponer estado del motor. Los callbacks son
 * comandos del integrador; las interacciones nativas de button cubren ratón,
 * teclado y táctil.
 *
 * @param {HTMLElement} panel
 * @param {import('../adapters/town-scene-contracts.js').TownDistrict} district
 * @param {'mock'|'engine'} source
 * @param {{ buildings?: import('../adapters/town-scene-contracts.js').TownVisualBuilding[], selectedBuilding?: import('../adapters/town-scene-contracts.js').TownVisualBuilding|null, commands?: object, onSelectBuilding?: (id: string) => void, onAction?: (event: object) => void, onBack?: () => void }} [options]
 */
export function renderTownPanel(panel, district, source, options = {}) {
    const focusKey = getFocusedControl(panel);
    panel.replaceChildren();
    const buildings = (options.buildings || []).filter((building) => building.unlocked || building.count > 0);
    const onSelectBuilding = options.onSelectBuilding || (() => {});
    const onAction = options.onAction || (() => {});

    if (options.selectedBuilding) {
        renderBuildingPanel(panel, options.selectedBuilding, source, options.commands, onAction, options.onBack || (() => {}));
    }
    else {
        renderDistrictPanel(panel, district, source, buildings, onSelectBuilding);
    }
    restoreFocusedControl(panel, focusKey);
}
