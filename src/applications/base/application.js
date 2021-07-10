export default class HeartApplication extends FormApplication {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["form", "heart", this.formType],
        });
    }

    static get formType() {
        return 'base'
    }
    
    static async build(data, msg) {
        try {
            const valueData = Object.entries(data).reduce((map, [key, build]) => {
                map[key] = build.value[0];
                return map;
            }, {});

            await this._roll(valueData, msg);
        } catch(err) {
            return (new this({}, {
                heart: data,
                msg
            })).render(true);
        }
    }

    static async _roll(data) {
        ui.notifications.error(`_roll has not been defined for ${this.formType}`);
    }
    
    get title() {
        if(this.constructor.formType !== 'base') {
            return game.i18n.localize(`heart.applications.${this.constructor.formType}.title`);
        } else {
            return super.title
        }
    }


    activateListeners(html) {
        html.find('button').click(ev => {
            ev.preventDefault();
        });

        html.find('[data-action=cancel]').click(ev => {
            this.close();
        });
    }
}