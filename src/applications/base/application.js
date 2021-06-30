export function initialise() {
    if(game.heart.applications === undefined) {
        game.heart.applications = {};
    }

    game.heart.applications.HeartApplication = HeartApplication;
}

export default class HeartApplication extends FormApplication {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["form", "heart"],
        });
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