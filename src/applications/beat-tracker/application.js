import applicationHTML from './application.html'; 

export default class BeatTrackerApplication extends FormApplication {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: applicationHTML.path, 
            classes: ["form", "heart", this.formType],
        });
    }

    static get formType() {
        return 'beat-tracker';
    }

    getData() {
        const data = super.getData();
    
        const charactersWithBeats = game.actors
            .filter(actor => actor.type === 'character')
            .reduce((map, char) => {
                const activeBeats = char.items.filter(item => 
                    item.type === 'beat' && item.system.active
                ).map(item => ({
                    text: item.name,
                    type: item.system.type
                }));

                map[char.id] = {
                    name: char.name,
                    activeBeats: activeBeats
                };
                return map;
            }, {});
    
        return foundry.utils.mergeObject(data, {
            'characters': charactersWithBeats,
        });
    }

    activateListeners(html) {
        super.activateListeners(html); 
        
        html.find('[data-action=close]').click(() => {
            this.close();
        });
    }
}
