import sheetHTML from './sheet.html';
import HeartSheetMixin from '../../common/sheet';

export default class HeartItemSheet extends HeartSheetMixin(ItemSheet) {
    static get type() { return 'base'; }

    get template() {
        return sheetHTML.path;
    }

    get default_img() {
        return 'icons/svg/item-bag.svg';
    }

    get img() {
        return this.default_img;
    }

    getData() {
        const data = super.getData();
        data.di_sizes = game.heart.di_sizes.reduce((map, di) => {
            map[di] = game.i18n.format('heart.di_size.d(N)', {N: di.replace(/^d/, '')})
            return map;
        }, {});

        data.domains = game.heart.domains.reduce((map, domain) => {
            map[domain] = game.i18n.localize(`heart.domain.${domain}`)
            return map;
        }, {});

        data.equipment_types = game.heart.equipment_types.reduce((map, equipment_type) => {
            map[equipment_type] = game.i18n.localize(`heart.equipment.type.${equipment_type}`)
            return map;
        }, {});

        return data;
    }
}