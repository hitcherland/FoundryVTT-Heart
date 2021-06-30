import applicationHTML from './application.html';
import HeartApplication from "../base/application";

export function initialise() {
    if(game.heart.applications === undefined) {
        game.heart.applications = {};
    }

    game.heart.applications.PrepareRollApplication = PrepareRollApplication;
}

export default class PrepareRollApplication extends HeartApplication {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: applicationHTML.path,
            classes: ["form", "heart", "prepare-roll"],
            width: 500,
            height: 400
        });
    }
}