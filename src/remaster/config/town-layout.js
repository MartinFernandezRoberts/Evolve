/**
 * Disposición puramente visual del pueblo. Las posiciones y la agrupación de
 * ids no desbloquean, compran ni calculan edificios; sólo dan una ubicación
 * consistente a estructuras que ya existen en el estado del motor.
 */
export const TOWN_DISTRICT_LAYOUT = Object.freeze([
    { id: 'center', accent: '#f0ba55', position: { x: 790, y: 425 }, art: 'hall', buildingIds: ['gift', 'food', 'stone'] },
    { id: 'housing', accent: '#e98b71', position: { x: 545, y: 285 }, art: 'homes', buildingIds: ['basic_housing', 'cottage', 'apartment', 'lodge', 'slave_pen'] },
    { id: 'agriculture', accent: '#badb56', position: { x: 355, y: 535 }, art: 'farm', buildingIds: ['farm', 'compost', 'mill', 'windmill', 'silo', 'smokehouse'] },
    { id: 'forest', accent: '#55b775', position: { x: 335, y: 245 }, art: 'lumber', buildingIds: ['lumber', 'lumber_yard', 'sawmill'] },
    { id: 'quarry', accent: '#9eb1c4', position: { x: 1180, y: 230 }, art: 'quarry', buildingIds: ['rock_quarry', 'mine', 'coal_mine', 'oil_well', 'oil_depot'] },
    { id: 'science', accent: '#75d7e0', position: { x: 1050, y: 505 }, art: 'observatory', buildingIds: ['university', 'library', 'wardenclyffe', 'biolab'] },
    { id: 'religion', accent: '#c68de8', position: { x: 865, y: 660 }, art: 'shrine', buildingIds: ['temple', 'wonder_lighthouse', 'wonder_pyramid', 'banquet'] },
    { id: 'industry', accent: '#e37c4f', position: { x: 1180, y: 625 }, art: 'workshop', buildingIds: ['cement_plant', 'foundry', 'factory', 'smelter', 'metal_refinery'] },
    { id: 'government', accent: '#f1bf57', position: { x: 755, y: 190 }, art: 'council', buildingIds: ['trade', 'wharf', 'tourist_center', 'bank', 'casino'] },
    { id: 'military', accent: '#df6d62', position: { x: 605, y: 705 }, art: 'fort', buildingIds: ['garrison', 'hospital', 'boot_camp', 'mass_driver'] }
]);
