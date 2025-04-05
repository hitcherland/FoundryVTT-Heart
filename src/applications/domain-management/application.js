import applicationHTML from './application.html';
import HeartApplication from '../base/application';

export default class DomainsManagementApplication extends HeartApplication {
    constructor(actor, options = {}) {
        super(options);
        this.actor = actor; // Store the actor reference
        console.log("DomainsManagementApplication initialized with actor:", this.actor);

    }
    
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: applicationHTML.path,
        });
    }

    static get formType() {
        return 'domains-management'
    }

    getData() {
        const data = super.getData();
        return foundry.utils.mergeObject(data, {
            domains: this.actor.system.domains
        });
    }

    activateListeners(html) {
        super.activateListeners(html);

        // Handle skill checkbox changes
        html.find('input[type="checkbox"]').change(ev => {
            const input = ev.currentTarget;
            const path = input.name;
            const value = input.checked;
            this.actor.update({ [path]: value });
        });

        // Handle knack input changes
        html.find('input[type="text"]').change(ev => {
            const input = ev.currentTarget;
            const path = input.name;
            const value = input.value;
            this.actor.update({ [path]: value });
        });
    }
}