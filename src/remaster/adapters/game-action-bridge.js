/**
 * Frontera de intenciones de la escena. Este módulo no conoce el motor ni
 * importa el estado de juego: recibe únicamente las rutas originales que el
 * integrador autoriza y entrega un objeto inmutable a los componentes.
 *
 * @param {{ build?: Function, setPower?: Function, setWorkers?: Function, openClassicPanel?: Function }} operations
 */
export function createGameActionBridge(operations = {}) {
    const invoke = (name, ...args) => {
        if (typeof operations[name] !== 'function') {
            return { success: false, reason: 'unsupported' };
        }
        return operations[name](...args);
    };

    return Object.freeze({
        build: (id, quantity) => invoke('build', id, quantity),
        setPower: (id, enabled) => invoke('setPower', id, enabled),
        setWorkers: (id, job, amount) => invoke('setWorkers', id, job, amount),
        openClassicPanel: (panel) => invoke('openClassicPanel', panel)
    });
}
