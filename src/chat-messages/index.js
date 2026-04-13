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

    async renderHTML() {
        const el = await super.renderHTML();

        if (this.isRoll && this.isContentVisible) {
            const content = await this.rolls[0].render({
                isPrivate: false,
                showStressRollButton: this.showStressRollButton,
                showTakeStressButton: this.showTakeStressButton,
                showFalloutRollButton: this.showFalloutRollButton,
                showClearStressButton: this.showClearStressButton,
            });
            const diceRoll = el.querySelector('.message-content .dice-roll');
            if (diceRoll) {
                const temp = document.createElement('div');
                temp.innerHTML = content;
                diceRoll.replaceChildren(...temp.children);
            }

            if (this.stressRoll && this.stressRoll !== this.rolls[0]) {
                const stressContent = await this.stressRoll.render({
                    isPrivate: false,
                    showTakeStressButton: this.showTakeStressButton,
                    showFalloutRollButton: this.showFalloutRollButton,
                    showClearStressButton: this.showClearStressButton,
                });
                const stressDiv = document.createElement('div');
                stressDiv.classList.add('message-content');
                stressDiv.innerHTML = stressContent;
                el.appendChild(stressDiv);
            }

            if (this.falloutRoll && this.falloutRoll !== this.rolls[0]) {
                const falloutContent = await this.falloutRoll.render({
                    isPrivate: false,
                    showClearStressButton: this.showClearStressButton,
                });
                const falloutDiv = document.createElement('div');
                falloutDiv.classList.add('message-content');
                falloutDiv.innerHTML = falloutContent;
                el.appendChild(falloutDiv);
            }
        }

        if(this.isRollRequest) {
            const data = this.getFlag('heart', 'roll-request');
            const content = await foundry.applications.handlebars.renderTemplate('heart:applications/prepare-roll-request/chat-message.html', data);
            const temp = document.createElement('div');
            temp.innerHTML = content;
            while (temp.firstChild) {
                el.appendChild(temp.firstChild);
            }
        }

        return el;
    }
}

// applied to chat messages to allow dragging of previewed items
const dragDrop = new (foundry.applications.ux.DragDrop.implementation)({
    dragSelector: ".item",
    dropSelector: null,
    permissions: { dragstart: true, drop: false },
    callbacks: { dragstart: _onDragStart }
  });

// workaround for nested-children uuids not dragging properly
async function _onDragStart(event) {
    const target = event.currentTarget;
    const uuid = target.dataset.itemId;
    const document = await fromUuid(uuid);
    const dragData = document.toDragData();
    event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
}

function activateListeners(html) {
    // Handle both jQuery and HTMLElement (V13 compatibility)
    const el = html instanceof HTMLElement ? html : html[0] || html;

    el.addEventListener('click', (ev) => {
        // Prevent default on form buttons
        if (ev.target.closest('form button')) {
            ev.preventDefault();
        }
    });

    // Toggle dice tooltip when clicking the dice formula in heart roll cards
    el.addEventListener('click', (ev) => {
        const formula = ev.target.closest('.heart .dice-formula');
        if (!formula) return;
        const tooltip = formula.closest('.dice-result')?.querySelector('.dice-tooltip');
        if (!tooltip) return;
        tooltip.style.display = tooltip.style.display === 'none' ? '' : 'none';
    });

    el.addEventListener('click', async (ev) => {
        const rollButton = ev.target.closest('form.roll-request [data-action=roll][data-character]');
        if (rollButton) {
            ev.preventDefault();
            const character = rollButton.dataset.character;
            const form = rollButton.closest('form.roll-request');
            const data = new FormData(form);

            const roll = await game.heart.rolls.HeartRoll.build({
                character: character,
                difficulty: data.get('difficulty'),
                skill: data.get('skill'),
                domain: data.get('domain'),
                mastery: data.get('mastery') === "on",
                helpers: data.getAll('helper'),
            });

            roll.toMessage({speaker: { actor: character }});
        }

        const viewButton = ev.target.closest('[data-item-id] [data-action=view]');
        if (viewButton) {
            ev.preventDefault();
            const uuid = viewButton.closest('[data-item-id]').dataset.itemId;
            const item = await fromUuid(uuid);
            item.sheet.render(true);
        }
    });

    dragDrop.bind(el);
}

// Custom enricher to replace Item content links with rich previews
async function _enrichItemPreview(match, options) {
    const uuid = match[1];
    const doc = await fromUuid(uuid);
    if (doc && doc.documentName === "Item") {
        const context = await doc.sheet._prepareContext({});
        const partialName = `heart:items/${doc.type}/preview.html`;
        if (Handlebars.partials[partialName]) {
            const innerHTML = Handlebars.partials[partialName](context, {
                allowedProtoProperties: {
                    uuid: true,
                    childrenTypes: true,
                    isOwner: true
                }
            });
            const div = document.createElement('div');
            div.innerHTML = innerHTML;
            div.classList.add('heart', 'sheet');
            return div;
        }
    }
    return null;
}

export function initialise() {
    console.log('heart | Registering ChatMessage');
    CONFIG.ChatMessage.documentClass = HeartChatMessage;

    // Register custom enricher for Item content links (V13-compatible replacement
    // for the old TextEditor.implementation override)
    CONFIG.TextEditor.enrichers.push({
        pattern: /@UUID\[([^\]]+)\]/g,
        enricher: _enrichItemPreview,
    });

    Hooks.once('renderChatLog', (app, html, data) => activateListeners(html));
    Hooks.once('renderChatPopout', (app, html, data) => activateListeners(html));
}