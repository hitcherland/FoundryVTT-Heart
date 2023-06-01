import './chat-message.sass';

class HeartChatMessage extends ChatMessage {
    get isRollRequest() {
        return this.getFlag('heart', 'roll-request') !== undefined;
    }

    get stressRoll() {
        if(this.rolls[0] instanceof game.heart.rolls.StressRoll) {
            return this.rolls[0];
        }

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
        if(this.stressRoll !== undefined) {
            if (showTakeStressButton === undefined) {
                return true
            } else {
                return Boolean(showTakeStressButton);
            }
        } else {
            return false;
        }
    }

    set showTakeStressButton(value) {
        return this.setFlag('heart', 'show-take-stress-button', value);
    }

    get falloutRoll() {
        if(this.rolls[0] instanceof game.heart.rolls.FalloutRoll) {
            return this.rolls[0];
        }

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

    async setFalloutRoll(roll) {
        const json = roll.toJSON()
        await this.setFlag('heart', 'fallout-roll', json);
    }

    get showFalloutRollButton() {
        const showFalloutRollButton = this.getFlag('heart', 'show-fallout-roll-button')
        if (this.falloutRoll !== undefined) {
            return false;
        }
        if (showFalloutRollButton === undefined) {
            return true;
        } else {
            return Boolean(showFalloutRollButton);
        }
    }

    set showFalloutRollButton(value) {
        return this.setFlag('heart', 'show-fallout-roll-button', value);
    }

    get showClearStressButton() {
      const showClearStressButton = this.getFlag('heart', 'show-clear-stress-button')
      if (this.falloutRoll !== undefined) {
        if (showClearStressButton === undefined) {
          return this.falloutRoll.result == 'no-fallout' ? false : true;
        } else {
            return Boolean(showClearStressButton);
        }
      }
      return false;
      
    }

    set showClearStressButton(value) {
      return this.setFlag('heart', 'show-clear-stress-button', value);
    }

    async getHTML() {
        const html = await super.getHTML();

        if (this.isRoll && this.isContentVisible) {
            const content = await this.rolls[0].render({
                isPrivate: false,
                showStressRollButton: this.showStressRollButton,
                showTakeStressButton: this.showTakeStressButton,
                showFalloutRollButton: this.showFalloutRollButton,
                showClearStressButton: this.showClearStressButton,
            });
            html.find('.message-content').find('.dice-roll').html(
                $(content).children()
            );

            if (this.stressRoll && this.stressRoll !== this.rolls[0]) {
                const stressContent = await this.stressRoll.render({
                  isPrivate: false,
                  showTakeStressButton: this.showTakeStressButton,
                  showFalloutRollButton: this.showFalloutRollButton,
                  showClearStressButton: this.showClearStressButton,
                });
                html.append(
                    $('<div class="message-content"></div>').append(stressContent)
                );
            }

            if (this.falloutRoll && this.falloutRoll !== this.rolls[0]) {
                const falloutContent = await this.falloutRoll.render({
                  isPrivate: false,
                  showClearStressButton: this.showClearStressButton,
                });
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

    html.on('click', 'form.roll-request [data-action=roll][data-character]', async (ev) => {
        const button = $(ev.currentTarget);
        const {
            character
        } = button.data();

        const form = button.closest('form.roll-request');
        const data = new FormData(form.get(0));

        const roll = await game.heart.rolls.HeartRoll.build({
            character: character,
            difficulty: data.get('difficulty'),
            skill: data.get('skill'),
            domain: data.get('domain'),
            mastery: data.get('mastery') === "on",
            helpers: data.getAll('helper'),
        });

        roll.toMessage({speaker: { actor: character }});
    });
}

export function initialise() {
    console.log('heart | Registering ChatMessage');
    CONFIG.ChatMessage.documentClass = HeartChatMessage;

    Hooks.once('renderChatLog', (app, html, data) => activateListeners(html));
    Hooks.once('renderChatPopout', (app, html, data) => activateListeners(html));
}