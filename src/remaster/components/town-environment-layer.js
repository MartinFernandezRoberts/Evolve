import { createTownEnvironmentArt } from '../assets/town-life-art.js';

const svgNamespace = 'http://www.w3.org/2000/svg';

function createSvgElement(name) {
    return document.createElementNS(svgNamespace, name);
}

/**
 * Capa de clima, bioma y planeta. Sólo cambia clases sobre SVG preasignado;
 * no crea una simulación ni consulta el estado del motor.
 */
export class TownEnvironmentLayer {
    constructor() {
        this.element = null;
        this.profileKey = 'adaptable';
        this.appliedClasses = [];
    }

    /** @param {SVGGElement} world */
    mount(world) {
        const staging = createSvgElement('g');
        staging.innerHTML = createTownEnvironmentArt();
        this.element = staging.firstElementChild;
        world.append(this.element);
    }

    /** @param {import('../config/town-visual-profiles.js').TownVisualProfile} visualProfile */
    sync(visualProfile) {
        if (!this.element) {
            return this.profileKey;
        }
        const nextClasses = visualProfile?.classNames || [];
        const classesChanged = nextClasses.length !== this.appliedClasses.length
            || nextClasses.some((className, index) => className !== this.appliedClasses[index]);
        if (classesChanged) {
            this.appliedClasses.forEach((className) => this.element.classList.remove(className));
            this.appliedClasses = [...nextClasses];
            this.appliedClasses.forEach((className) => this.element.classList.add(className));
        }
        this.profileKey = visualProfile?.race?.architecture || 'adaptable';
        this.element.dataset.townBiome = visualProfile?.biome?.art || 'grassland';
        this.element.dataset.townWaterways = visualProfile?.waterways || 'stream';
        this.element.dataset.townVariant = visualProfile?.race?.variant || '';
        return this.profileKey;
    }

    /** @param {{ hidden?: boolean, lowPower?: boolean, reducedMotion?: boolean }} motion */
    setMotionState(motion) {
        if (!this.element) {
            return;
        }
        this.element.classList.toggle('is-paused', Boolean(motion.hidden));
        this.element.classList.toggle('is-low-power', Boolean(motion.lowPower));
        this.element.classList.toggle('is-reduced-motion', Boolean(motion.reducedMotion));
    }

    reset() {
        this.element?.remove();
        this.element = null;
        this.appliedClasses = [];
    }

    destroy() {
        this.reset();
    }
}
