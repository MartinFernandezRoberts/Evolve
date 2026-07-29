import { LOCALE_CHANGE_EVENT, loc } from '../../locale.js';
import { isRemasterPhaseSnapshot } from '../adapters/phase-scene-contracts.js';
import { CivilizationTownScene } from './civilization-town-scene.js';
import { EarlySettlementScene } from './early-settlement-scene.js';
import { EvolutionScene } from './evolution-scene.js';
import { SentienceTransitionScene } from './sentience-transition-scene.js';
import { UnsupportedPhaseScene } from './unsupported-phase-scene.js';

const sceneConstructors = Object.freeze({
    evolution: EvolutionScene,
    'sentience-transition': SentienceTransitionScene,
    'early-settlement': EarlySettlementScene,
    civilization: CivilizationTownScene,
    unsupported: UnsupportedPhaseScene
});

/**
 * @param {import('../adapters/phase-scene-contracts.js').RemasterPhaseSnapshot} snapshot
 * @returns {'evolution'|'sentience-transition'|'early-settlement'|'civilization'|'unsupported'}
 */
export function resolveRemasterPhaseScene(snapshot) {
    if (!isRemasterPhaseSnapshot(snapshot) || snapshot.phase.supported !== true) {
        return 'unsupported';
    }
    return Object.hasOwn(sceneConstructors, snapshot.phase.kind) ? snapshot.phase.kind : 'unsupported';
}

/**
 * @typedef {Object} RemasterPhaseSceneOptions
 * @property {HTMLElement|null} host Contenedor clásico de la fase activa.
 * @property {boolean} enabled Feature flag externo al save.
 * @property {'scene'|'classic'} view Modo visual solicitado.
 * @property {() => import('../adapters/phase-scene-contracts.js').RemasterPhaseSnapshot} readSnapshot Adaptador de sólo lectura.
 * @property {object} [commands] Puente de acciones original para Civilización.
 * @property {(view: 'scene'|'classic') => void} onViewChange Persistencia de interfaz, nunca de partida.
 */

class StaticPhaseSceneManager {
    /** @param {RemasterPhaseSceneOptions} options @param {'evolution'|'sentience-transition'|'early-settlement'} kind @param {import('../adapters/phase-scene-contracts.js').RemasterPhaseSnapshot} snapshot */
    constructor(options, kind, snapshot) {
        this.host = options.host;
        this.kind = kind;
        this.root = null;
        this.sceneHost = null;
        this.scene = null;
        this.view = 'classic';
        this.destroyed = false;
        this.boundClick = this.handleClick.bind(this);
        this.boundLocaleChange = this.handleLocaleChange.bind(this);
        this.mount(options, snapshot);
    }

    /** @param {RemasterPhaseSceneOptions} options @param {import('../adapters/phase-scene-contracts.js').RemasterPhaseSnapshot} snapshot */
    mount(options, snapshot) {
        this.root = document.createElement('section');
        this.root.className = 'visual-remaster-root visual-remaster-phase-root';
        this.root.innerHTML = `
            <div class="visual-remaster__switcher" role="group">
                <span class="visual-remaster__title"></span>
                <button type="button" data-remaster-view="scene"></button>
                <button type="button" data-remaster-view="classic"></button>
            </div>
            <div class="visual-remaster__scene-host"></div>
        `;
        this.sceneHost = this.root.querySelector('.visual-remaster__scene-host');
        this.root.addEventListener('click', this.boundClick);
        document.addEventListener(LOCALE_CHANGE_EVENT, this.boundLocaleChange);
        this.host.prepend(this.root);
        this.scene = new sceneConstructors[this.kind]();
        this.scene.mount(this.sceneHost, snapshot);
        this.refreshLocalizedChrome();
        this.update(options, snapshot);
    }

    /** @param {RemasterPhaseSceneOptions} options @param {import('../adapters/phase-scene-contracts.js').RemasterPhaseSnapshot} snapshot */
    update(options, snapshot) {
        this.onViewChange = options.onViewChange;
        this.scene?.setSnapshot(snapshot);
        this.setView(options.view);
    }

    refreshLocalizedChrome() {
        if (!this.root) {
            return;
        }
        this.root.querySelector('.visual-remaster__switcher')?.setAttribute('aria-label', loc('remaster_visual_title'));
        const title = this.root.querySelector('.visual-remaster__title');
        if (title) {
            title.textContent = loc('remaster_visual_title');
        }
        this.root.querySelector('[data-remaster-view="scene"]')?.replaceChildren(loc('remaster_graphical_view'));
        this.root.querySelector('[data-remaster-view="classic"]')?.replaceChildren(loc('remaster_classic_view'));
        this.scene?.refreshLocalization();
    }

    /** @param {'scene'|'classic'} view */
    setView(view) {
        this.view = view === 'classic' ? 'classic' : 'scene';
        this.host.classList.toggle('visual-remaster-scene', this.view === 'scene');
        this.host.classList.toggle('visual-remaster-classic', this.view === 'classic');
        this.sceneHost.hidden = this.view !== 'scene';
        this.root?.querySelectorAll('[data-remaster-view]').forEach((button) => {
            button.setAttribute('aria-pressed', String(button.dataset.remasterView === this.view));
        });
    }

    handleClick(event) {
        if (!(event.target instanceof Element)) {
            return;
        }
        const button = event.target.closest('[data-remaster-view]');
        if (!button || !this.root?.contains(button)) {
            return;
        }
        const nextView = button.dataset.remasterView === 'classic' ? 'classic' : 'scene';
        if (nextView !== this.view) {
            this.onViewChange?.(nextView);
        }
    }

    handleLocaleChange() {
        this.refreshLocalizedChrome();
    }

    isMounted() {
        return !this.destroyed && Boolean(this.root?.isConnected);
    }

    destroy() {
        if (this.destroyed) {
            return;
        }
        this.destroyed = true;
        this.scene?.destroy();
        document.removeEventListener(LOCALE_CHANGE_EVENT, this.boundLocaleChange);
        this.root?.removeEventListener('click', this.boundClick);
        this.host?.classList.remove('visual-remaster-scene', 'visual-remaster-classic');
        this.root?.remove();
        this.root = null;
        this.sceneHost = null;
        this.scene = null;
    }
}

let activeStaticScene = null;
let activeCivilizationScene = null;

function destroyStaticScene() {
    activeStaticScene?.destroy();
    activeStaticScene = null;
}

function destroyCivilizationScene() {
    activeCivilizationScene?.destroy();
    activeCivilizationScene = null;
}

function getCivilizationOptions(options) {
    return {
        host: options.host,
        enabled: options.enabled,
        view: options.view,
        readSnapshot() {
            const snapshot = options.readSnapshot();
            if (!isRemasterPhaseSnapshot(snapshot) || resolveRemasterPhaseScene(snapshot) !== 'civilization' || !snapshot.civilization.town) {
                throw new Error('CivilizationTownScene recibió una fase no compatible.');
            }
            return snapshot.civilization.town;
        },
        commands: options.commands,
        onViewChange: options.onViewChange
    };
}

/**
 * Monta exactamente una escena compatible con la fase real. Los estados no
 * cubiertos no dejan raíz, listeners ni timers y conservan el panel clásico.
 *
 * @param {RemasterPhaseSceneOptions} options
 */
export function syncRemasterPhaseScene(options) {
    if (!options.enabled || !options.host) {
        destroyRemasterPhaseScene();
        return;
    }

    const snapshot = options.readSnapshot();
    const kind = resolveRemasterPhaseScene(snapshot);
    if (kind === 'unsupported') {
        destroyStaticScene();
        destroyCivilizationScene();
        return;
    }

    if (kind === 'civilization') {
        destroyStaticScene();
        const civilizationOptions = getCivilizationOptions(options);
        if (!activeCivilizationScene) {
            activeCivilizationScene = new CivilizationTownScene(civilizationOptions);
            activeCivilizationScene.mount();
        }
        else {
            activeCivilizationScene.sync(civilizationOptions);
        }
        return;
    }

    destroyCivilizationScene();
    if (!activeStaticScene || activeStaticScene.host !== options.host || activeStaticScene.kind !== kind || !activeStaticScene.isMounted()) {
        destroyStaticScene();
        activeStaticScene = new StaticPhaseSceneManager(options, kind, snapshot);
        return;
    }
    activeStaticScene.update(options, snapshot);
}

/** Limpieza centralizada para cambio de pestaña, importación y flag apagado. */
export function destroyRemasterPhaseScene() {
    destroyStaticScene();
    destroyCivilizationScene();
}
