import { createMockTownSnapshot } from './config/town-map.js';
import { loc } from '../locale.js';
import { TownScene } from './scene/town-scene.js';

const root = document.querySelector('#town-demo-root');
const scenario = new URLSearchParams(window.location.search).get('scenario') || 'intermediate';

document.title = `Evolve — ${loc('remaster_demo_data')}`;
document.querySelector('meta[name="description"]')?.setAttribute('content', loc('remaster_demo_notice'));
document.querySelector('[data-remaster-demo-title]')?.replaceChildren(loc('remaster_visual_title'));
document.querySelector('[data-remaster-demo-description]')?.replaceChildren(loc('remaster_demo_notice'));
document.querySelector('[data-remaster-demo-classic]')?.replaceChildren(loc('remaster_classic_view'));

if (root) {
    const scene = new TownScene(root, {
        snapshot: createMockTownSnapshot(scenario),
        onSelectionChange(district) {
            document.querySelector('#town-demo-selection').textContent = loc('remaster_selected_district', [district.label]);
        }
    });

    scene.mount();
    const destroyDemoScene = () => {
        window.removeEventListener('pagehide', destroyDemoScene);
        scene.destroy();
    };
    window.addEventListener('pagehide', destroyDemoScene);
}
