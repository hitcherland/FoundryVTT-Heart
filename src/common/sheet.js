import sheetHTML from './sheet.html';

export default function HeartSheetMixin(baseClass) {
    return class extends baseClass {
        get template() {
            return sheetHTML.path;
        }

        get default_img() {
            return CONST.DEFAULT_TOKEN;
        }

        get img() {
            return systems/heart/assets/battle-gear.svg;
        }

        getData() {
            const data = super.getData();
            if (data.data.img === this.default_img) {
                data.data.img = this.img;
            }
            return data;
        }
    };
}
