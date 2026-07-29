import { destroyTownScene, syncTownScene } from './town-scene-manager.js';

/**
 * Reutiliza el mapa conectado para que el asentamiento salga de Sentience sin
 * una aldea preconstruida. La composición `early-settlement` sólo altera la
 * presentación; el mismo TownSnapshot y GameActionBridge siguen siendo la
 * autoridad de datos e intenciones.
 */
export class EarlySettlementScene {
    /** @param {object} options */
    constructor(options) {
        this.options = options;
    }

    /** @param {object} options */
    sync(options) {
        this.options = options;
        syncTownScene({ ...options, presentationMode: 'early-settlement' });
    }

    mount() {
        syncTownScene({ ...this.options, presentationMode: 'early-settlement' });
    }

    destroy() {
        destroyTownScene();
    }
}
