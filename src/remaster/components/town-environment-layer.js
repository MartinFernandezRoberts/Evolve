import { createTownEnvironmentArt } from '../assets/town-life-art.js';
import { getSpeciesArchitectureProfile } from '../config/town-life-config.js';

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
        this.profileKey = 'other';
    }

    /** @param {SVGGElement} world */
    mount(world) {
        const staging = createSvgElement('g');
        staging.innerHTML = createTownEnvironmentArt();
        this.element = staging.firstElementChild;
        world.append(this.element);
    }

    /** @param {import('../adapters/town-scene-contracts.js').TownSnapshot} snapshot */
    sync(snapshot) {
        if (!this.element) {
            return this.profileKey;
        }
        const environment = snapshot.context.environment;
        const traits = environment?.planetTraits || [];
        const profile = getSpeciesArchitectureProfile(snapshot.context.species);

        this.profileKey = profile.key;
        const snowing = environment?.weather === 0 && environment.temperature === 0;
        this.element.classList.toggle('is-aquatic', profile.key === 'aquatic');
        this.element.classList.toggle('is-octigoran', snapshot.context.species.id === 'octigoran');
        this.element.classList.toggle('is-weather-rain', environment?.weather === 0 && !snowing);
        this.element.classList.toggle('is-weather-snow', snowing);
        this.element.classList.toggle('is-weather-overcast', environment?.weather === 1);
        this.element.classList.toggle('is-weather-clear', environment?.weather === 2);
        this.element.classList.toggle('is-windy', environment?.wind === 1);
        this.element.classList.toggle('is-season-spring', environment?.season === 0);
        this.element.classList.toggle('is-season-summer', environment?.season === 1);
        this.element.classList.toggle('is-season-autumn', environment?.season === 2);
        this.element.classList.toggle('is-season-winter', environment?.season === 3);
        this.element.classList.toggle('has-trait-toxic', traits.includes('toxic'));
        this.element.classList.toggle('has-trait-magnetic', traits.includes('magnetic'));
        this.element.classList.toggle('has-trait-permafrost', traits.includes('permafrost'));
        this.element.classList.toggle('has-trait-stormy', traits.includes('stormy'));
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
    }

    destroy() {
        this.reset();
    }
}
