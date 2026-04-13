export default function HeartSheetMixin(baseClass) {
    return class extends baseClass {
        static MIN_WIDTH = 300;
        static MIN_HEIGHT = 150;

        get default_img() {
            return CONST.DEFAULT_TOKEN;
        }

        get img() {
            return 'systems/heart/assets/battle-gear.svg';
        }

        get title() {
            const key = 'heart.' + this.document.name;
            const resp = game.i18n.localize(key);
            if (resp == key) {
                return this.document.name;
            } else {
                return resp;
            }
        }

        setPosition(position = {}) {
            const minWidth = this.constructor.MIN_WIDTH;
            const minHeight = this.constructor.MIN_HEIGHT;
            if (typeof position.width === 'number')
                position = { ...position, width: Math.max(position.width, minWidth) };
            if (typeof position.height === 'number')
                position = { ...position, height: Math.max(position.height, minHeight) };
            return super.setPosition(position);
        }

        async _prepareContext(options) {
            const context = await super._prepareContext(options);
            if (context.actor && (context.actor.img === this.default_img)) {
                context.actor.img = this.img;
            }
            else if (context.item) {
                context.item.img = this.img;
            }
            else {
                context.img = this.img;
            }
            return context;
        }
    };
}
