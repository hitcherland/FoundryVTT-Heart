export default class HeartApplication extends FormApplication {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["form", "heart", this.formType],
        });
    }

    static get formType() {
        return 'base'
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