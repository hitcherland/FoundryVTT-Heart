import {PrepareRollApplication} from '../applications/prepare-roll.js';
import {PrepareStressRollApplication} from '../applications/prepare-stress-roll.js';
import {PrepareFalloutRollApplication} from '../applications/prepare-fallout-roll.js';

export function activateRollListeners(html) {
    html.on('click', 'button[data-action=roll]', ev => {
        ev.preventDefault();
        const target = $(ev.currentTarget);
        const form = target.closest("form");
        const data = {
            actor_id: form.find('[name=actor_id]').data('value') || CONFIG.ChatMessage.documentClass.getSpeaker().actor,
            difficulty: form.find('[name=difficulty]').val(),
            domain:  form.find('[name=domain]:checked').data('value'),
            domains: form.find('[name=domain]').map(function() { return $(this).data('value'); }).get(),
            skill:  form.find('[name=skill]:checked').data('value'),
            skills: form.find('[name=skill]').map(function() { return $(this).data('value'); }).get()
        };

        if(!data.actor_id) {
            ui.notifications.warn(game.i18n.localize("heart.warning:no_actor_selected"));
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
        const data = {
            actor_id: form.find('[name=actor_id]').val() || CONFIG.ChatMessage.documentClass.getSpeaker().actor,
            result: form.find('[name=result]').val(),
            multiplier: parseInt(form.find('[name=multiplier]').val())
        };

        if(!data.actor_id) {
            ui.notifications.warn(game.i18n.localize("heart.warning:no_actor_selected"));
            return;
        }

        new PrepareStressRollApplication(data).render(true);
    });

    html.on('click', 'button[data-action=roll-fallout]', ev => {
        ev.preventDefault();
        const target = $(ev.currentTarget);
        const form = target.closest("form");

        const data = {
            actor_id: form.find('[name=actor_id]').val() || CONFIG.ChatMessage.documentClass.getSpeaker().actor,
            resistance: form.find('[name=resistance]').val(),
        };

        if(!data.actor_id) {
            ui.notifications.warn(game.i18n.localize("heart.warning:no_actor_selected"));
            return;
        }

        new PrepareFalloutRollApplication(data).render(true);
    }); 

    html.on('click', 'button[data-action=take-stress]', ev => {
        ev.preventDefault();
        const target = $(ev.currentTarget);
        const form = target.closest("form");

        const stress_gain = parseInt(form.find('[name=stress_gain]').val());
        const resistance = form.find('[name=resistance]').val();

        const actor_id = CONFIG.ChatMessage.documentClass.getSpeaker().actor;
        const actor = game.actors.get(actor_id);
        if(!actor?.data.data?.resistances) {
            ui.notifications.warn(game.i18n.localize("heart.warning:no_actor_selected"));
            return;
        }

        console.log(actor.data.data.resistances, resistance);
        let res = actor.data.data.resistances[resistance].value
        res += stress_gain;

        const updateData = {};
        updateData[`data.resistances.${resistance}.value`] = res;
        actor.update(updateData).then(_ => {
            ui.notifications.notify(game.i18n.format('heart.notifications:added_stress(value,name)', {
                value: stress_gain,
                name: actor.name
            }));
        });
    }); 
}