import applicationHTML from './application.html';

export default class HeartApplication extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
    static DEFAULT_OPTIONS = {
        classes: ["form", "heart"],
        tag: "form",
        window: {
            resizable: true,
        },
        position: {
            height: 'auto',
        },
        actions: {
            cancel: HeartApplication._onCancel,
            submit: HeartApplication._onSubmit,
        },
    };

    static PARTS = {
        main: { template: applicationHTML.path, scrollable: [".heart.form"] },
    };

    static get formType() {
        return "base";
    }

    get title() {
        if (this.constructor.formType !== "base") {
            return game.i18n.localize(
                `heart.applications.${this.constructor.formType}.title`
            );
        } else {
            return super.title;
        }
    }

    static async build(data, msg) {
        try {
            const valueData = Object.entries(data).reduce((map, [key, build]) => {
                map[key] = build.value[0];
                return map;
            }, {});
            await this._roll(valueData, msg);
        } catch (err) {
            return new this({
                heart: data,
                msg,
            }).render(true);
        }
    }

    static async _roll(data) {
        ui.notifications.error(`_roll has not been defined for ${this.formType}`);
    }

    static _onCancel(event, target) {
        this.close();
    }

    static _onSubmit(event, target) {
        // Override in subclasses
    }
}
