/**
 * Actualiza el panel lateral sin insertar HTML procedente del snapshot. Así el
 * mismo componente será seguro con textos localizados del adaptador real.
 *
 * @param {HTMLElement} panel
 * @param {import('../adapters/town-scene-contracts.js').TownDistrict} district
 * @param {'mock'|'engine'} source
 */
export function renderTownPanel(panel, district, source) {
    panel.replaceChildren();

    const eyebrow = document.createElement('p');
    eyebrow.className = 'town-scene__panel-eyebrow';
    eyebrow.textContent = source === 'mock' ? 'Datos de muestra' : 'Vista de Civilización';

    const heading = document.createElement('h2');
    heading.textContent = district.label;

    const status = document.createElement('p');
    status.className = 'town-scene__status';
    status.style.setProperty('--district-accent', district.accent);
    status.textContent = district.status;

    const summary = document.createElement('p');
    summary.className = 'town-scene__panel-summary';
    summary.textContent = district.summary;

    const detail = document.createElement('p');
    detail.className = 'town-scene__panel-detail';
    detail.textContent = district.detail;

    const notice = document.createElement('div');
    notice.className = 'town-scene__mock-notice';
    notice.textContent = source === 'mock'
        ? 'Este panel no lee ni escribe una partida. La conexión con acciones originales queda para una fase posterior.'
        : 'La conexión de acciones se habilitará mediante el adaptador del motor.';

    const buildingList = document.createElement('ul');
    buildingList.className = 'town-scene__building-list';
    if (district.buildings.length > 0) {
        district.buildings.forEach((building) => {
            const item = document.createElement('li');
            item.textContent = `${building.label}: ${building.count}`;
            buildingList.append(item);
        });
    }
    else {
        const item = document.createElement('li');
        item.textContent = 'Sin estructuras construidas.';
        buildingList.append(item);
    }

    const control = document.createElement('button');
    control.className = 'town-scene__future-action';
    control.type = 'button';
    control.disabled = true;
    control.textContent = 'Acción del motor — próxima fase';

    panel.append(eyebrow, heading, status, summary, detail, buildingList, notice, control);
}
