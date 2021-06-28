import './items.sass';

import EquipmentSheet from './equipment/sheet'
import ResourceSheet from './resource/sheet'
import HauntSheet from './haunt/sheet'

const sheets = {
    'equipment': EquipmentSheet,
    'resource': ResourceSheet,
    'haunt': HauntSheet
};

export default function initialiseItems() {
    Items.unregisterSheet('core', ItemSheet);

    Object.entries(sheets).forEach(function([key, sheet]) {
        Items.registerSheet('heart', sheet, {
            types: [key],
            makeDefault: true,
            label: `heart.${key}`
        });
    });
}