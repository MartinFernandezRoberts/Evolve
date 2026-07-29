import { TownScene } from './town-scene.js';

const snapshotIntervalMs = 1000;

/**
 * @typedef {Object} TownSceneManagerOptions
 * @property {HTMLElement|null} host Contenedor #city original.
 * @property {boolean} enabled Feature flag persistido por el juego.
 * @property {'scene'|'classic'} view Vista solicitada por la persona jugadora.
 * @property {() => import('../adapters/town-scene-contracts.js').TownSnapshot} readSnapshot Lector de sólo lectura del motor.
 * @property {{ build?: Function, setPower?: Function, setWorkers?: Function }} [commands] Commands injected by the game integrator.
 * @property {(view: 'scene'|'classic') => void} onViewChange Solicita el cambio al integrador; no escribe estado directamente.
 */

class TownSceneManager {
    /** @param {TownSceneManagerOptions} options */
    constructor(options) {
        this.host = options.host;
        this.updateOptions(options);
        this.root = null;
        this.sceneHost = null;
        this.scene = null;
        this.interval = null;
        this.destroyed = false;
        this.boundClick = this.handleClick.bind(this);
        this.boundVisibilityChange = this.handleVisibilityChange.bind(this);
    }

    /** @param {TownSceneManagerOptions} options */
    updateOptions(options) {
        this.readSnapshot = options.readSnapshot;
        this.onViewChange = options.onViewChange;
        this.commands = options.commands || null;
    }

    mount(view) {
        this.root = document.createElement('section');
        this.root.className = 'visual-remaster-root';
        this.root.innerHTML = `
            <div class="visual-remaster__switcher" role="group" aria-label="Vista de Civilización">
                <span class="visual-remaster__title">Visual Remaster</span>
                <button type="button" data-remaster-view="scene">Vista gráfica</button>
                <button type="button" data-remaster-view="classic">Vista clásica</button>
            </div>
            <div class="visual-remaster__scene-host"></div>
        `;
        this.sceneHost = this.root.querySelector('.visual-remaster__scene-host');
        this.root.addEventListener('click', this.boundClick);
        document.addEventListener('visibilitychange', this.boundVisibilityChange);
        this.host.append(this.root);
        this.setView(view);
    }

    /** @param {'scene'|'classic'} view */
    setView(view) {
        if (this.destroyed || !this.root) {
            return;
        }
        this.view = view === 'classic' ? 'classic' : 'scene';
        this.host.classList.toggle('visual-remaster-scene', this.view === 'scene');
        this.host.classList.toggle('visual-remaster-classic', this.view === 'classic');
        this.root.querySelectorAll('[data-remaster-view]').forEach((button) => {
            button.setAttribute('aria-pressed', String(button.dataset.remasterView === this.view));
        });

        if (this.view === 'scene') {
            this.sceneHost.hidden = false;
            if (!this.scene) {
                this.scene = new TownScene(this.sceneHost, {
                    snapshot: this.readSnapshot(),
                    commands: this.commands,
                    onAction: (event) => this.handleSceneAction(event)
                });
                this.scene.mount();
            }
            else {
                this.scene.setCommands(this.commands, (event) => this.handleSceneAction(event));
            }
            this.startUpdates();
        }
        else {
            this.sceneHost.hidden = true;
            this.stopUpdates();
            this.destroyScene();
        }
    }

    startUpdates() {
        if (this.interval !== null) {
            return;
        }
        this.interval = window.setInterval(() => this.refreshSnapshot(), snapshotIntervalMs);
    }

    stopUpdates() {
        if (this.interval !== null) {
            window.clearInterval(this.interval);
            this.interval = null;
        }
    }

    refreshSnapshot() {
        if (this.destroyed || !this.root?.isConnected) {
            this.destroy();
            return;
        }
        if (document.hidden || !this.scene) {
            return;
        }
        this.scene.setSnapshot(this.readSnapshot());
    }

    handleVisibilityChange() {
        if (!document.hidden && this.view === 'scene') {
            this.refreshSnapshot();
        }
    }

    /** Reflects a command immediately instead of waiting for the one-second sample. */
    handleSceneAction() {
        this.refreshSnapshot();
    }

    handleClick(event) {
        if (!(event.target instanceof Element)) {
            return;
        }
        const button = event.target.closest('[data-remaster-view]');
        if (!button || !this.root.contains(button)) {
            return;
        }
        const nextView = button.dataset.remasterView === 'classic' ? 'classic' : 'scene';
        if (nextView !== this.view) {
            this.onViewChange(nextView);
        }
    }

    destroyScene() {
        if (this.scene) {
            this.scene.destroy();
            this.scene = null;
        }
    }

    isMounted() {
        return !this.destroyed && Boolean(this.root?.isConnected);
    }

    destroy() {
        if (this.destroyed) {
            return;
        }
        this.destroyed = true;
        this.stopUpdates();
        this.destroyScene();
        document.removeEventListener('visibilitychange', this.boundVisibilityChange);
        this.root?.removeEventListener('click', this.boundClick);
        this.host?.classList.remove('visual-remaster-scene', 'visual-remaster-classic');
        this.root?.remove();
        this.root = null;
        this.sceneHost = null;
    }
}

let activeTownScene = null;

/**
 * Monta o actualiza la frontera visual sin acoplarla al game loop. Con el flag
 * apagado no queda DOM, listener ni temporizador del remaster.
 *
 * @param {TownSceneManagerOptions} options
 */
export function syncTownScene(options) {
    if (!options.enabled || !options.host) {
        destroyTownScene();
        return;
    }

    if (!activeTownScene || activeTownScene.host !== options.host || !activeTownScene.isMounted()) {
        activeTownScene?.destroy();
        activeTownScene = new TownSceneManager(options);
        activeTownScene.mount(options.view);
        return;
    }

    activeTownScene.updateOptions(options);
    activeTownScene.setView(options.view);
}

/** Limpieza explícita para cambios de pestaña, importación y apagado del flag. */
export function destroyTownScene() {
    activeTownScene?.destroy();
    activeTownScene = null;
}
