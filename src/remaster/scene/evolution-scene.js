import { PhaseStaticScene } from './phase-static-scene.js';

/** Escena visual de lectura para la evolución; los controles llegan después por el puente original. */
export class EvolutionScene extends PhaseStaticScene {
    constructor() {
        super('evolution');
    }
}
