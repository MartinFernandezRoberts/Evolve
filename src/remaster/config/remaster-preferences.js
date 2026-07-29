/**
 * Preferencias exclusivas de presentación del remaster.
 *
 * No forman parte de `evolved`: una partida exportada sigue conteniendo sólo
 * datos del juego. El nombre de la clave es versionado para permitir una
 * migración futura sin tocar el esquema de guardado de Evolve.
 */
const preferenceKey = 'evolve.visual-remaster.preferences.v1';
const defaultPreferences = Object.freeze({ version: 1, enabled: false, view: 'scene' });

function normalizePreferences(value) {
    return {
        version: defaultPreferences.version,
        enabled: value?.enabled === true,
        view: value?.view === 'classic' ? 'classic' : 'scene'
    };
}

function readStoredPreferences() {
    try {
        const raw = window.localStorage.getItem(preferenceKey);
        return raw ? normalizePreferences(JSON.parse(raw)) : null;
    }
    catch (error) {
        return null;
    }
}

function writePreferences(value) {
    const normalized = normalizePreferences(value);
    try {
        window.localStorage.setItem(preferenceKey, JSON.stringify(normalized));
    }
    catch (error) {
        // El juego sigue siendo usable si el navegador bloquea almacenamiento.
    }
    return normalized;
}

/** @returns {{ version: number, enabled: boolean, view: 'scene'|'classic' }} */
export function getRemasterPreferences() {
    return readStoredPreferences() || { ...defaultPreferences };
}

/** @param {boolean} enabled */
export function setRemasterEnabled(enabled) {
    return writePreferences({ ...getRemasterPreferences(), enabled: enabled === true });
}

/** @param {'scene'|'classic'} view */
export function setRemasterView(view) {
    return writePreferences({ ...getRemasterPreferences(), view });
}

/**
 * Conserva la elección de instalaciones previas y elimina las claves aditivas
 * del objeto que se serializa como partida. Debe ejecutarse una vez tras
 * cargar el estado de la partida y antes de la primera exportación o autosave.
 *
 * @param {object|undefined} settings
 */
export function migrateLegacyRemasterPreferences(settings) {
    if (!settings || typeof settings !== 'object') {
        return getRemasterPreferences();
    }

    const hasLegacyEnabled = Object.prototype.hasOwnProperty.call(settings, 'visualRemaster');
    const hasLegacyView = Object.prototype.hasOwnProperty.call(settings, 'visualRemasterView');
    if (hasLegacyEnabled || hasLegacyView) {
        if (!readStoredPreferences()) {
            writePreferences({ enabled: settings.visualRemaster === true, view: settings.visualRemasterView });
        }
        delete settings.visualRemaster;
        delete settings.visualRemasterView;
    }
    return getRemasterPreferences();
}
