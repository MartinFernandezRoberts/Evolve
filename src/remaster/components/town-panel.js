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
    const eyebrow = createElement('p', 'town-scene__panel-eyebrow', source === 'mock' ? 'Datos de muestra' : 'Vista de Civilización');
    const heading = createElement('h2', '', district.label);
    const status = createElement('p', 'town-scene__status', district.status);
    status.style.setProperty('--district-accent', district.accent);
    const summary = createElement('p', 'town-scene__panel-summary', district.summary);
    const detail = createElement('p', 'town-scene__panel-detail', district.detail);
    const listHeading = createElement('h3', 'town-scene__subheading', 'Edificios del distrito');
    const buildingList = createElement('ul', 'town-scene__building-picker');

    buildings.forEach((building) => {
        const item = document.createElement('li');
        const state = building.count > 0 ? `×${building.count}` : (building.affordable === false ? 'Sin recursos' : 'Disponible');
        const button = createButton(`${building.label} — ${state}`, `select-${building.id}`, false, () => onSelectBuilding(building.id), 'town-scene__building-choice');
        item.append(button);
        buildingList.append(item);
    });

    if (buildings.length === 0) {
        buildingList.append(createElement('li', '', 'No hay edificios disponibles en este distrito.'));
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
    const eyebrow = createElement('p', 'town-scene__panel-eyebrow', source === 'mock' ? 'Datos de muestra' : 'Acción original de Civilización');
    const back = createButton('← Distrito', 'back-to-district', false, onBack, 'town-scene__back');
    const heading = createElement('h2', '', building.label);
    const count = createElement('p', 'town-scene__building-count', `Cantidad: ${building.count}`);
    const description = createElement('p', 'town-scene__panel-detail', detail?.description || 'Los detalles de esta estructura se cargarán desde el motor al abrir una partida.');

    panel.append(eyebrow, back, heading, count, description);

    if (!detail) {
        panel.append(createElement('div', 'town-scene__mock-notice', 'La demostración conserva este mapa aislado y no ejecuta acciones de partida.'));
        return;
    }

    if (detail.effect) {
        panel.append(createElement('p', 'town-scene__building-effect', detail.effect));
    }

    const costHeading = createElement('h3', 'town-scene__subheading', detail.affordable ? 'Coste actual — recursos suficientes' : 'Coste actual — recursos insuficientes');
    const costList = createElement('ul', `town-scene__cost-list ${detail.affordable ? 'is-affordable' : 'is-insufficient'}`);
    detail.costs.forEach((cost) => {
        costList.append(createElement('li', `is-${cost.status}`, cost.text));
    });
    if (detail.costs.length === 0) {
        costList.append(createElement('li', '', 'Sin coste de recursos.'));
    }
    panel.append(costHeading, costList);

    const actionGroup = createElement('div', 'town-scene__action-group');
    actionGroup.setAttribute('role', 'group');
    actionGroup.setAttribute('aria-label', `Construir ${building.label}`);
    detail.buildAmounts.forEach((amount) => {
        actionGroup.append(createButton(`Construir ${amount}`, `build-${building.id}-${amount}`, !detail.affordable || !commands?.build, () => {
            renderActionResult(commands.build(building.id, amount), onAction, 'build', building.id);
        }, 'town-scene__action--build'));
    });
    if (detail.maxBuild) {
        actionGroup.append(createButton('Construir máximo', `build-${building.id}-max`, !detail.affordable || !commands?.buildMax, () => {
            renderActionResult(commands.buildMax(building.id), onAction, 'build', building.id);
        }, 'town-scene__action--build'));
    }
    panel.append(actionGroup);

    if (detail.energy) {
        const energy = createElement('p', 'town-scene__building-energy', `${detail.energy.direction === 'produced' ? 'Energía producida' : 'Energía usada'}: ${detail.energy.value}`);
        panel.append(energy);
    }

    if (detail.enabled) {
        const powerHeading = createElement('h3', 'town-scene__subheading', `Estado: ${detail.enabled.on} encendido · ${detail.enabled.off} apagado`);
        const powerGroup = createElement('div', 'town-scene__action-group');
        powerGroup.setAttribute('role', 'group');
        powerGroup.setAttribute('aria-label', `Estado de ${building.label}`);
        powerGroup.append(
            createButton('Encender', `power-${building.id}-on`, detail.enabled.off <= 0 || !commands?.setPower, () => {
                renderActionResult(commands.setPower(building.id, true), onAction, 'power', building.id);
            }, 'town-scene__action--power'),
            createButton('Apagar', `power-${building.id}-off`, detail.enabled.on <= 0 || !commands?.setPower, () => {
                renderActionResult(commands.setPower(building.id, false), onAction, 'power', building.id);
            }, 'town-scene__action--power')
        );
        panel.append(powerHeading, powerGroup);
    }

    if (detail.workers.length > 0) {
        panel.append(createElement('h3', 'town-scene__subheading', 'Trabajadores asociados'));
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
        ? `Cola: ${detail.queue.amount} en ${detail.queue.count} entrada${detail.queue.count === 1 ? '' : 's'}.`
        : 'Sin cola para esta estructura.');
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
