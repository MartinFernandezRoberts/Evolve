/**
 * Fallback explícito. No monta DOM ni listeners: el contenido clásico queda
 * intacto para pantallas especializadas de creación, resets y fases futuras.
 */
export class UnsupportedPhaseScene {
    mount() {}
    setSnapshot() {}
    refreshLocalization() {}
    destroy() {}
}
