import { EvolutionScene } from './evolution-scene.js';

/** Escena de transición cuando la condición original de sentiencia está disponible. */
export class SentienceTransitionScene extends EvolutionScene {
    constructor(options = {}) {
        super({ ...options, transition: true });
    }
}
