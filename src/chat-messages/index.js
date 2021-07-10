import './chat-message.sass';

class HeartChatMessage extends ChatMessage {
    get isRollRequest() {
        return this.getFlag('heart', 'roll-request') !== undefined;
    }

    get stressRoll() {
        const json = this.getFlag('heart', 'stress-roll');
        if (json === undefined) {
            return
        }
        const Roll = CONFIG.Dice.rolls.find(x => x.name === json.class);
        const roll = Roll.fromData(json);
        return roll;
    }

    async setStressRoll(roll) {
        const json = roll.toJSON()
        await this.setFlag('heart', 'stress-roll', json);
    }

    get showStressRollButton() {
        const showStressRollButton = this.getFlag('heart', 'show-stress-roll-button')
        if (this.stressRoll !== undefined) {
            return false;
        }
        if (showStressRollButton === undefined) {
            return true
        } else {
            return Boolean(showStressRollButton);
        }
    }

    set showStressRollButton(value) {
        return this.setFlag('heart', 'show-stress-roll-button', value);
    }

    get showTakeStressButton() {
        const showTakeStressButton = this.getFlag('heart', 'show-take-stress-button')
        if (this.stressRoll === undefined || this.falloutRoll !== undefined) {
            return false;
        }

        if (showTakeStressButton === undefined) {
            return true
        } else {
            return Boolean(showTakeStressButton);
        }
    }

    set showTakeStressButton(value) {
        return this.setFlag('heart', 'show-take-stress-button', value);
    }

    get falloutRoll() {
        const json = this.getFlag('heart', 'fallout-roll');
        if (json === undefined) {
            return
        }
        const Roll = CONFIG.Dice.rolls.find(x => x.name === json.class);
        const roll = Roll.fromData(json);
        return roll;
    }

    set falloutRoll(roll) {
        const json = roll.toJSON()
        this.setFlag('heart', 'fallout-roll', json);
        return
    }

    get showFalloutRollButton() {
        const showFalloutRollButton = this.getFlag('heart', 'show-fallout-roll-button')
        if (this.falloutRoll !== undefined) {
            return false;
        }
        if (showFalloutRollButton === undefined) {
            return true
        } else {
            return Boolean(showFalloutRollButton);
        }
    }

    set showFalloutRollButton(value) {
        return this.setFlag('heart', 'show-fallout-roll-button', value);
    }

    async getHTML() {
        const html = await super.getHTML();

        if (this.isRoll && this.isContentVisible) {
            html.find('.message-content').html(
                await this.roll.render({
                    isPrivate: false,
                    showStressRollButton: this.showStressRollButton
                })
            )

            if (this.stressRoll) {
                const stressContent = await this.stressRoll.render({ isPrivate: false, showTakeStressButton: this.showTakeStressButton, showFalloutRollButton: this.showFalloutRollButton });
                html.append(
                    $('<div class="message-content"></div>').append(stressContent)
                );
            }
            if (this.falloutRoll) {
                const falloutContent = await this.falloutRoll.render({ isPrivate: false });
                html.append(
                    $('<div class="message-content"></div>').append(falloutContent)
                );
            }
        }

        if(this.isRollRequest) {
            const data = this.getFlag('heart', 'roll-request');
            const content = await renderTemplate('heart:applications/prepare-roll-request/chat-message.html', data);
            html.append(content)
        }

        return html;
    }
}

function activateListeners(html) {

    html.on('click', 'form button', ev => {
        ev.preventDefault();
    });

    html.on('click', 'form.roll-request [data-action=roll][data-character]', (ev) => {
        const button = $(ev.currentTarget);
        const {
            character
        } = button.data();

        const form = button.closest('form.roll-request');
        const data = new FormData(form.get(0));
        data.set('character', character);

        const buildData = game.heart.applications.PrepareRollApplication.getBuildData({
            character: [character],
            difficulty: form.find(`[name=difficulty]`).map((_, ev) => ev.value).get(),
            skill: form.find(`[name=skill]`).map((_, ev) => ev.value).get(),
            domain: form.find(`[name=domain]`).map((_, ev) => ev.value).get(),
            helper: form.find(`[name=helper]`).map((_, ev) => ev.value).get(),
        }, data);

        return game.heart.applications.PrepareRollApplication.build(buildData);
    });
}

export function initialise() {
    console.log('heart | Registering ChatMessage');
    CONFIG.ChatMessage.documentClass = HeartChatMessage;

    Hooks.once('renderChatLog', (app, html, data) => activateListeners(html));
    Hooks.once('renderChatPopout', (app, html, data) => activateListeners(html));
}