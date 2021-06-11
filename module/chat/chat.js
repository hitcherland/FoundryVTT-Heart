export async function RenderStressRoll(roll, actor, resistance, message, clearStress, {showClearStressButton=true}={}) {
    return await renderTemplate('systems/heart/templates/rolls/stress-chat-message.html', {
        actor,
        message, 
        resistance,
        clearStress,
        showClearStressButton: showClearStressButton && Boolean(clearStress),
        rollHTML: await roll.render()
    });
}

export async function RenderRoll(actor, dicepairs, result) {
    console.warn(dicepairs);
    return await renderTemplate('systems/heart/templates/rolls/roll-chat-message.html', {
        actor,
        result,
        dicepairs,
    });
}

export function ChatListeners(html) {
    html.on('click', '.clear-stress', async ev => {
        const button = $(ev.currentTarget);
        const actor_id = button.closest('[data-actor]').data('actor');
        const clear_stress = button.closest('[data-clear-stress]').data('clearStress');
        const resistance = button.closest('[data-resistance]').data('resistance');
        const message_id = button.closest('[data-message-id]').data('messageId');
        const message_content = button.closest('[data-actor]').find('.message').html()

        const actor = game.actors.get(actor_id);
        const message = ui.chat.collection.get(message_id);

        const update_data = {}
        if(clear_stress === 'total') {
            Object.keys(actor.data.data.resistances).forEach(resistance => {
                update_data[`data.resistances.${resistance}.value`] = 0;
            })
        } else {
            update_data[`data.resistances.${clear_stress}.value`] = 0;
        }
        
        actor.update(update_data);
        message.update({'content': await RenderStressRoll(message.roll, actor, resistance, message_content, clear_stress, {showClearStressButton: false})}).then(_ => {
            ui.chat.updateMessage(message);
        });

    });
}