import {PrepareRollApplication} from '../applications/prepare-roll.js';
import {PrepareStressRollApplication} from '../applications/prepare-stress-roll.js';

export function activateRollListeners(html) {
    html.on('click', 'button[data-action=roll]', ev => {
        ev.preventDefault();
        const target = $(ev.currentTarget);
        const form = target.closest("form");
        const data = {};

        data.actor_id = form.find('[name=actor_id]').data('value');
        data.difficulty = form.find('[name=difficulty]').val()
        data.domain =  form.find('[name=domain]:checked').data('value');
        data.domains = form.find('[name=domain]').map(function() { return $(this).data('value'); }).get();
        data.skill =  form.find('[name=skill]:checked').data('value');
        data.skills = form.find('[name=skill]').map(function() { return $(this).data('value'); }).get()

        data.actor_id = data.actor_id || CONFIG.ChatMessage.documentClass.getSpeaker().actor;
        if(!data.actor_id) {
            ui.notifications.warn(game.i18n.localize("heart.NoActorSelected"))
            return;
        }

        const actor = game.actors.get(data.actor_id);
        data.skills = data.skills.filter( x => actor?.data.data.skills[x].value );
        data.domains = data.domains.filter( x => actor?.data.data.domains[x].value );
        if(!data.skills.includes(data.skill)) data.skill = undefined;
        if(!data.domains.includes(data.domain)) data.domain = undefined;

        new PrepareRollApplication(data).render(true);
    });

    html.on('click', 'button[data-action=roll-stress]', ev => {
        ev.preventDefault();
        const target = $(ev.currentTarget);
        const form = target.closest("form");
        const data = {};

        const actor_id = form.find('[name=actor_id]').val();
        data.multiplier = parseInt(form.find('[name=multiplier]').val());
        data.actor_id = actor_id;

        if(!data.actor_id) {
            ui.notifications.warn(game.i18n.localize("heart.NoActorSelected"))
            return;
        }

        new PrepareStressRollApplication(data).render(true);
    }); 
}