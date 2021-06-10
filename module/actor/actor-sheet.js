export class ActorSheetHeartCharacter extends ActorSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["heart", "sheet", "actor", "character"],
        });
    }

    get template() {
        return 'systems/heart/templates/actors/heart-character-sheet.html'
    }

    getData() {
        const data = super.getData();
        console.warn(data);
        if(data.data.img === CONST.DEFAULT_TOKEN) {
            data.data.img = "systems/heart/assets/heart_logo_playbook.png";
        }
        return data;
    }
    
    activateListeners(html) {
        super.activateListeners(html);

        html.find('.ordered-checkable-box:not(.checked)').click(ev => {
            ev.preventDefault();
            const element = ev.currentTarget;
            const index = parseInt(element.dataset.index);
            const parent = element.parentElement;
            const target = parent.dataset.target;

            const data = {}
            data[target] = index + 1;
            this.actor.update(data);
        });

        html.find('.ordered-checkable-box.checked').click(ev => {
            ev.preventDefault();
            const element = ev.currentTarget;
            const index = parseInt(element.dataset.index);
            const parent = element.parentElement;
            const target = parent.dataset.target;

            const data = {}
            if(index + 1 === getProperty(this.actor.data, target)) {
                data[target] = index;
            } else {
                data[target] = index + 1;
            }
            this.actor.update(data);
        });
    }
}