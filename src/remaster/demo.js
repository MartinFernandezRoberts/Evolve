import { createMockTownSnapshot } from './config/town-map.js';
import { TownScene } from './scene/town-scene.js';

const root = document.querySelector('#town-demo-root');

if (root) {
    const scene = new TownScene(root, {
        snapshot: createMockTownSnapshot(),
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
