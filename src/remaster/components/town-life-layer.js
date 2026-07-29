import { createTownActivityArt, createTownResidentArt } from '../assets/town-life-art.js';
import { getPopulationVisualCount, isTownActivityActive, TOWN_ACTIVITY_SLOTS, TOWN_LIFE_BUDGET, TOWN_RESIDENT_SLOTS } from '../config/town-life-config.js';

const svgNamespace = 'http://www.w3.org/2000/svg';

function createSvgElement(name) {
    return document.createElementNS(svgNamespace, name);
}

/**
 * Habitantes y viñetas decorativas con una asignación fija de SVG. Su número
 * visible usa rangos del snapshot y nunca representa la población individual.
 */
export class TownLifeLayer {
    constructor() {
        this.element = null;
        this.residents = [];
        this.activities = [];
        this.profileKey = '';
        this.snapshot = null;
        this.visualProfile = null;
        this.motion = { hidden: false, lowPower: false, reducedMotion: false };
    }

    /** @param {SVGGElement} world */
    mount(world) {
        this.element = createSvgElement('g');
        this.element.classList.add('town-life');
        this.element.setAttribute('aria-hidden', 'true');

        TOWN_RESIDENT_SLOTS.forEach((slot) => {
            const element = createSvgElement('g');
            element.classList.add('town-life__resident');
            element.setAttribute('transform', `translate(${slot.x} ${slot.y})`);
            const walker = createSvgElement('g');
            walker.classList.add('town-life__walker', `town-life__walker--route-${slot.route}`);
            const art = createSvgElement('g');
            art.classList.add('town-life__resident-art');
            walker.append(art);
            element.append(walker);
            this.element.append(element);
            this.residents.push({ element, art });
        });

        TOWN_ACTIVITY_SLOTS.forEach((slot) => {
            const element = createSvgElement('g');
            element.classList.add('town-life__activity', `town-life__activity--${slot.id}`);
            element.setAttribute('transform', `translate(${slot.x} ${slot.y})`);
            const walker = createSvgElement('g');
            walker.classList.add('town-life__walker', `town-life__walker--route-${slot.route}`);
            const art = createSvgElement('g');
            art.classList.add('town-life__activity-art');
            art.innerHTML = createTownActivityArt(slot.id);
            walker.append(art);
            element.append(walker);
            this.element.append(element);
            this.activities.push({ id: slot.id, element });
        });
        world.append(this.element);
    }

    /**
     * @param {import('../adapters/town-scene-contracts.js').TownSnapshot} snapshot
     * @param {import('../config/town-visual-profiles.js').TownVisualProfile} visualProfile
     */
    sync(snapshot, visualProfile) {
        this.snapshot = snapshot;
        this.visualProfile = visualProfile || this.visualProfile;
        if (!this.element) {
            return;
        }
        const profileKey = this.visualProfile?.race?.residentArt || 'other';
        if (profileKey !== this.profileKey) {
            this.profileKey = profileKey;
            this.element.dataset.townLifeProfile = profileKey;
            this.element.dataset.townLifeCulture = this.visualProfile?.race?.culture || 'practical';
            this.residents.forEach((entry) => {
                entry.art.innerHTML = createTownResidentArt(profileKey);
            });
        }

        const budget = this.getBudget();
        const visibleResidents = Math.min(getPopulationVisualCount(snapshot.context.population.amount), budget.residents);
        this.residents.forEach((entry, index) => {
            entry.element.classList.toggle('is-visible', index < visibleResidents);
        });

        let visibleActivities = 0;
        this.activities.forEach((entry) => {
            const active = isTownActivityActive(entry.id, snapshot.context.workers, snapshot.visualBuildings);
            const visible = active && visibleActivities < budget.activities;
            if (visible) {
                visibleActivities += 1;
            }
            entry.element.classList.toggle('is-visible', visible);
        });
    }

    /** @param {{ hidden?: boolean, lowPower?: boolean, reducedMotion?: boolean }} motion */
    setMotionState(motion) {
        const hidden = Boolean(motion.hidden);
        const lowPower = Boolean(motion.lowPower);
        const reducedMotion = Boolean(motion.reducedMotion);
        const changed = hidden !== this.motion.hidden || lowPower !== this.motion.lowPower || reducedMotion !== this.motion.reducedMotion;
        this.motion.hidden = hidden;
        this.motion.lowPower = lowPower;
        this.motion.reducedMotion = reducedMotion;
        if (this.element) {
            this.element.classList.toggle('is-paused', this.motion.hidden);
            this.element.classList.toggle('is-low-power', this.motion.lowPower);
            this.element.classList.toggle('is-reduced-motion', this.motion.reducedMotion);
        }
        if (changed && this.snapshot) {
            this.sync(this.snapshot, this.visualProfile);
        }
    }

    getBudget() {
        if (this.motion.reducedMotion) {
            return TOWN_LIFE_BUDGET.reducedMotion;
        }
        return this.motion.lowPower ? TOWN_LIFE_BUDGET.lowPower : TOWN_LIFE_BUDGET.normal;
    }

    reset() {
        this.element?.remove();
        this.element = null;
        this.residents = [];
        this.activities = [];
        this.snapshot = null;
        this.visualProfile = null;
        this.profileKey = '';
    }

    destroy() {
        this.reset();
    }
}
