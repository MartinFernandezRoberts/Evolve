import { destroyTownScene, syncTownScene } from './town-scene-manager.js';

/**
 * Adaptador de la escena de Civilización existente para que el router de fases
 * no tenga que conocer su implementación concreta.
 */
export class CivilizationTownScene {
    /** @param {object} options */
    constructor(options) {
        this.options = options;
    }

    /** @param {object} options */
    sync(options) {
        this.options = options;
        syncTownScene({ ...options, presentationMode: 'civilization' });
    }

    mount() {
        syncTownScene({ ...this.options, presentationMode: 'civilization' });
    }

    destroy() {
        destroyTownScene();
    }
}
