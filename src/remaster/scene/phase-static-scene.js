import { loc } from '../../locale.js';
import { isRemasterPhaseSnapshot } from '../adapters/phase-scene-contracts.js';

const sceneCopy = Object.freeze({
    evolution: Object.freeze({ title: 'tab_evolve' }),
    'sentience-transition': Object.freeze({ title: 'evo_sentience_title' }),
    'early-settlement': Object.freeze({ title: 'tab_city1' })
});

function phaseText(kind, key) {
    const copy = sceneCopy[kind] || sceneCopy.evolution;
    if (key === 'subtitle') {
        return loc('remaster_scene_subtitle', [loc(copy.title)]);
    }
    return loc(copy[key]);
}

/**
 * Escena base para etapas que aún no exponen controles gráficos. Renderiza
 * datos del snapshot y deja las acciones originales accesibles en la vista
 * clásica, sin asumir reglas de progreso.
 */
export class PhaseStaticScene {
    /** @param {'evolution'|'sentience-transition'|'early-settlement'} kind */
    constructor(kind) {
        this.kind = kind;
        this.host = null;
        this.snapshot = null;
    }

    /** @param {HTMLElement} host @param {import('../adapters/phase-scene-contracts.js').RemasterPhaseSnapshot} snapshot */
    mount(host, snapshot) {
        this.host = host;
        this.host.innerHTML = `
            <section class="remaster-phase-scene remaster-phase-scene--${this.kind}" aria-labelledby="remaster-phase-title">
                <div class="remaster-phase-scene__art" aria-hidden="true">
                    <svg viewBox="0 0 720 260" preserveAspectRatio="xMidYMid slice">
                        <defs>
                            <linearGradient id="remaster-phase-sky" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#176473"/><stop offset="1" stop-color="#172e4d"/></linearGradient>
                            <linearGradient id="remaster-phase-ground" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#4b9c63"/><stop offset="1" stop-color="#255e4e"/></linearGradient>
                            <filter id="remaster-phase-shadow"><feGaussianBlur stdDeviation="5"/></filter>
                        </defs>
                        <rect width="720" height="260" fill="url(#remaster-phase-sky)"/>
                        <path d="M0 160C112 116 180 192 292 147S490 104 720 155V260H0Z" fill="url(#remaster-phase-ground)"/>
                        <path d="M0 202C129 163 244 219 370 177S602 150 720 194" fill="none" stroke="#d6a45d" stroke-linecap="round" stroke-width="18" opacity=".8"/>
                        <ellipse cx="350" cy="194" rx="110" ry="24" fill="#102938" opacity=".44" filter="url(#remaster-phase-shadow)"/>
                        <g class="remaster-phase-scene__landmark" transform="translate(350 164)">
                            <path d="M-50 34V-4L0-52 50-4V34Z" fill="#b86d46"/>
                            <path d="M-59-4 0-65 59-4 0 8Z" fill="#f0bb69"/>
                            <rect x="-24" y="-4" width="18" height="38" fill="#5b3c35"/>
                            <rect x="7" y="4" width="20" height="17" rx="3" fill="#9ed6cb"/>
                            <path d="M-82 35h164" stroke="#203f47" stroke-width="8" stroke-linecap="round"/>
                        </g>
                        <circle cx="129" cy="121" r="30" fill="#8ed16c"/><circle cx="159" cy="142" r="28" fill="#6dbf6c"/><circle cx="588" cy="127" r="35" fill="#8fd780"/><circle cx="628" cy="147" r="26" fill="#5aaf67"/>
                    </svg>
                </div>
                <div class="remaster-phase-scene__content">
                    <p class="remaster-phase-scene__eyebrow"></p>
                    <h1 id="remaster-phase-title"></h1>
                    <p class="remaster-phase-scene__subtitle"></p>
                    <dl class="remaster-phase-scene__facts">
                        <div data-phase-race><dt></dt><dd></dd></div>
                        <div data-phase-biome><dt></dt><dd></dd></div>
                        <div data-phase-settlement><dt></dt><dd></dd></div>
                    </dl>
                </div>
            </section>
        `;
        this.setSnapshot(snapshot);
    }

    /** @param {import('../adapters/phase-scene-contracts.js').RemasterPhaseSnapshot} snapshot */
    setSnapshot(snapshot) {
        if (!isRemasterPhaseSnapshot(snapshot)) {
            throw new Error('La escena de fase recibió un snapshot incompatible.');
        }
        this.snapshot = snapshot;
        this.refreshLocalization();
    }

    refreshLocalization() {
        if (!this.host || !this.snapshot) {
            return;
        }
        const title = this.host.querySelector('#remaster-phase-title');
        const subtitle = this.host.querySelector('.remaster-phase-scene__subtitle');
        const eyebrow = this.host.querySelector('.remaster-phase-scene__eyebrow');
        if (eyebrow) {
            eyebrow.textContent = loc('remaster_visual_title');
        }
        if (title) {
            title.textContent = phaseText(this.kind, 'title');
        }
        if (subtitle) {
            subtitle.textContent = phaseText(this.kind, 'subtitle');
        }
        this.setFact('[data-phase-race]', loc('wiki_menu_species'), this.snapshot.race.label || this.snapshot.race.id || '—');
        this.setFact('[data-phase-biome]', loc('wiki_planet_biome'), this.snapshot.environment.biome.label || this.snapshot.environment.biome.id || '—');
        this.setFact('[data-phase-settlement]', loc('wiki_menu_structures'), String(this.snapshot.settlement.buildingTypes));
    }

    setFact(selector, label, value) {
        const fact = this.host?.querySelector(selector);
        if (!fact) {
            return;
        }
        fact.querySelector('dt').textContent = label;
        fact.querySelector('dd').textContent = value;
    }

    destroy() {
        this.host?.replaceChildren();
        this.host = null;
        this.snapshot = null;
    }
}
