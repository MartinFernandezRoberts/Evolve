import { createMockTownSnapshot } from './config/town-map.js';
import { TownScene } from './scene/town-scene.js';

const root = document.querySelector('#town-demo-root');
const scenario = new URLSearchParams(window.location.search).get('scenario') || 'intermediate';

if (root) {
    const scene = new TownScene(root, {
        snapshot: createMockTownSnapshot(scenario),
        onSelectionChange(district) {
            document.querySelector('#town-demo-selection').textContent = `Distrito seleccionado: ${district.label}`;
        }
    });

    scene.mount();
    const destroyDemoScene = () => {
        window.removeEventListener('pagehide', destroyDemoScene);
        scene.destroy();
    };
    window.addEventListener('pagehide', destroyDemoScene);
}
