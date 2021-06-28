import './actors.sass';

import AdversarySheet from './adversary/sheet';
import CharacterSheet from './character/sheet';
import DelveSheet from './delve/sheet';
import LandmarkSheet from './landmark/sheet';

export default function initialiseActors() {
    const sheets = {
        'adversary': AdversarySheet,
        'character': CharacterSheet,
        'delve': DelveSheet,
        'landmark': LandmarkSheet
    };

    Actors.unregisterSheet('core', ActorSheet);

    Object.entries(sheets).forEach(function([key, sheet]) {
        Actors.registerSheet('heart', sheet, {
            types: [key],
            makeDefault: true,
            label: `heart.${key}`
        });
    });
}