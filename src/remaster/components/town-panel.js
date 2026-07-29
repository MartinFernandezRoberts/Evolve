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

function textFor(texts, key, fallback) {
    return typeof texts?.[key] === 'string' ? texts[key] : fallback;
}

function renderDistrictPanel(panel, district, source, buildings, onSelectBuilding, texts) {
    const eyebrow = createElement('p', 'town-scene__panel-eyebrow', source === 'mock' ? 'Mock data' : textFor(texts, 'civilizationView', 'Civilization View'));
    const heading = createElement('h2', '', district.label);
    const status = createElement('p', 'town-scene__status', district.status);
    status.style.setProperty('--district-accent', district.accent);
    const summary = createElement('p', 'town-scene__panel-summary', district.summary);
    const detail = createElement('p', 'town-scene__panel-detail', district.detail);
    const listHeading = createElement('h3', 'town-scene__subheading', textFor(texts, 'districtBuildings', 'District Buildings'));
    const buildingList = createElement('ul', 'town-scene__building-picker');

    buildings.forEach((building) => {
        const item = document.createElement('li');
        const state = building.count > 0 ? `×${building.count}` : (building.affordable === false ? textFor(texts, 'noResources', 'Insufficient resources') : textFor(texts, 'available', 'Available'));
        const button = createButton(`${building.label} — ${state}`, `select-${building.id}`, false, () => onSelectBuilding(building.id), 'town-scene__building-choice');
        item.append(button);
        buildingList.append(item);
    });

    if (buildings.length === 0) {
        buildingList.append(createElement('li', '', textFor(texts, 'noBuildings', 'No buildings are currently available in this district.')));
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

function renderBuildingPanel(panel, building, source, commands, onAction, onBack, texts) {
    const detail = building.detail;
    const eyebrow = createElement('p', 'town-scene__panel-eyebrow', source === 'mock' ? 'Mock data' : textFor(texts, 'civilizationView', 'Civilization View'));
    const back = createButton(`← ${textFor(texts, 'backToDistrict', 'Back to district')}`, 'back-to-district', false, onBack, 'town-scene__back');
    const heading = createElement('h2', '', building.label);
    const count = createElement('p', 'town-scene__building-count', textFor(texts, 'quantity', 'Quantity: %0').replace('%0', String(building.count)));
    const description = createElement('p', 'town-scene__panel-detail', detail?.description || '');

    panel.append(eyebrow, back, heading, count, description);

    if (!detail) {
        panel.append(createElement('div', 'town-scene__mock-notice', 'This isolated demo does not execute game actions.'));
        return;
    }

    if (detail.effect) {
        panel.append(createElement('p', 'town-scene__building-effect', detail.effect));
    }

    const costState = detail.affordable ? textFor(texts, 'sufficientResources', 'Resources sufficient') : textFor(texts, 'insufficientResources', 'Resources insufficient');
    const costHeading = createElement('h3', 'town-scene__subheading', `${textFor(texts, 'currentCost', 'Current Cost')} — ${costState}`);
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
    actionGroup.setAttribute('aria-label', `${textFor(texts, 'construct', 'Construct')} ${building.label}`);
    detail.buildAmounts.forEach((amount) => {
        actionGroup.append(createButton(`${textFor(texts, 'construct', 'Construct')} ${amount}`, `build-${building.id}-${amount}`, !detail.affordable || !commands?.build, () => {
            renderActionResult(commands.build(building.id, amount), onAction, 'build', building.id);
        }, 'town-scene__action--build'));
    });
    if (detail.maxBuild) {
        actionGroup.append(createButton(textFor(texts, 'buildMaximum', 'Build maximum'), `build-${building.id}-max`, !detail.affordable || !commands?.buildMax, () => {
            renderActionResult(commands.buildMax(building.id), onAction, 'build', building.id);
        }, 'town-scene__action--build'));
    }
    panel.append(actionGroup);

    if (detail.energy) {
        const energyLabel = detail.energy.direction === 'produced' ? textFor(texts, 'energyGenerated', 'Energy generated: %0') : textFor(texts, 'energyUsed', 'Energy used: %0');
        const energy = createElement('p', 'town-scene__building-energy', energyLabel.replace('%0', String(detail.energy.value)));
        panel.append(energy);
    }

    if (detail.enabled) {
        const powerHeading = createElement('h3', 'town-scene__subheading', `${textFor(texts, 'enabled', 'Enabled')}: ${detail.enabled.on} · ${textFor(texts, 'disabled', 'Disabled')}: ${detail.enabled.off}`);
        const powerGroup = createElement('div', 'town-scene__action-group');
        powerGroup.setAttribute('role', 'group');
        powerGroup.setAttribute('aria-label', `Estado de ${building.label}`);
        powerGroup.append(
            createButton(textFor(texts, 'activate', 'Active'), `power-${building.id}-on`, detail.enabled.off <= 0 || !commands?.setPower, () => {
                renderActionResult(commands.setPower(building.id, true), onAction, 'power', building.id);
            }, 'town-scene__action--power'),
            createButton(textFor(texts, 'deactivate', 'Not Active'), `power-${building.id}-off`, detail.enabled.on <= 0 || !commands?.setPower, () => {
                renderActionResult(commands.setPower(building.id, false), onAction, 'power', building.id);
            }, 'town-scene__action--power')
        );
        panel.append(powerHeading, powerGroup);
    }

    if (detail.workers.length > 0) {
        panel.append(createElement('h3', 'town-scene__subheading', textFor(texts, 'associatedWorkers', 'Associated Workers')));
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
        ? `${textFor(texts, 'queue', 'Queue')}: ${detail.queue.amount} / ${detail.queue.count}`
        : textFor(texts, 'noQueue', 'No queue for this structure.'));
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
 * @param {{ buildings?: import('../adapters/town-scene-contracts.js').TownVisualBuilding[], selectedBuilding?: import('../adapters/town-scene-contracts.js').TownVisualBuilding|null, commands?: object, texts?: Record<string, string>, onSelectBuilding?: (id: string) => void, onAction?: (event: object) => void, onBack?: () => void }} [options]
 */
export function renderTownPanel(panel, district, source, options = {}) {
    const focusKey = getFocusedControl(panel);
    panel.replaceChildren();
    const buildings = (options.buildings || []).filter((building) => building.unlocked || building.count > 0);
    const onSelectBuilding = options.onSelectBuilding || (() => {});
    const onAction = options.onAction || (() => {});

    if (options.selectedBuilding) {
        renderBuildingPanel(panel, options.selectedBuilding, source, options.commands, onAction, options.onBack || (() => {}), options.texts);
    }
    else {
        renderDistrictPanel(panel, district, source, buildings, onSelectBuilding, options.texts);
    }
    restoreFocusedControl(panel, focusKey);
}
