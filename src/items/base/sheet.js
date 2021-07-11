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

    get children() {
        return Object.values(this.item.data.data.children || {});
    }

    get childrenTypes() {
        return this.children.reduce((map, value) => {
            if(map[value.type] === undefined) {
                map[value.type] = [value];
            } else {
                map[value.type].push(value);
            }

            return map;
        }, {});
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find('[data-action=add-child][data-type]').click(ev => {
            const target = $(ev.currentTarget);
            const documentName = target.data('document-name') || 'Item';
            const type = target.data('type');
            let itemData = target.data('data') || {};

            const id = randomID();
            const data = new CONFIG[documentName].documentClass({_id: id, type: type, name: `New ${type}`, data: itemData}).toObject();
            data.documentName = documentName;
            
            this.item.update({[`data.children.${id}`]: data});
        });

        html.find('[data-child-id] [data-action=edit-child]').click(ev => {
            const target = $(ev.currentTarget);
            const id = target.closest('[data-child-id]').data('childId');
            const itemData = this.item.data.data.children[id];
            const documentName = itemData.documentName;
            const item = new CONFIG[documentName].documentClass(itemData, {parentItem: this.item});
            item.sheet.render(true);
        });

        html.find('[data-child-id] [data-action=delete-child]').click(async ev => {
            const target = $(ev.currentTarget);
            const id = target.closest('[data-child-id]').data('childId');
            await this.item.update({[`data.children.-=${id}`]: null});
            this.render(true);
        });
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

        data.children = this.children;
        data.childrenTypes = this.childrenTypes;

        return data;
    }
}