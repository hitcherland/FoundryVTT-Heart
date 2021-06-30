import chatMessageHTML from './chat-message.html';
import './chat-message.sass';

class HeartChatMessage extends ChatMessage {
    get stressRoll() {
        const json = this.getFlag('heart', 'stress-roll');
        if (json === undefined) {
            return
        }
        const Roll = CONFIG.Dice.rolls.find(x => x.name === json.class);
        const roll = Roll.fromData(json);
        return roll;
    }

    set stressRoll(roll) {
        const json = roll.toJSON()
        this.setFlag('heart', 'stress-roll', json);
        return
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
        return this.getFlag('heart', 'show-stress-roll-button', value);
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
        return this.getFlag('heart', 'show-fallout-roll-button', value);
    }

    async getHTML() {
        const data = this.toObject(false);
        const isWhisper = this.data.whisper.length;

        const messageData = {
            message: data,
            user: game.user,
            author: this.user,
            alias: this.alias,
            cssClass: [
                this.data.type === CONST.CHAT_MESSAGE_TYPES.IC ? "ic" : null,
                this.data.type === CONST.CHAT_MESSAGE_TYPES.EMOTE ? "emote" : null,
                isWhisper ? "whisper" : null,
                this.data.blind ? "blind" : null
            ].filterJoin(" "),
            isWhisper: this.data.whisper.some(id => id !== game.user.id),
            whisperTo: this.data.whisper.map(u => {
                let user = game.users.get(u);
                return user ? user.name : null;
            }).filterJoin(", ")
        };

        if (this.isRoll) {

            if (!this.isContentVisible) {
                data.flavor = game.i18n.format("CHAT.PrivateRollContent", { user: this.user.name });
                data.content = await this.roll.render({ isPrivate: true, showStressRollButton: this.showStressRollButton });
                if (this.stressRoll) {
                    data.stressContent = await this.stressRoll.render({ isPrivate: true });
                }
                messageData.isWhisper = false;
                messageData.alias = this.user.name;
            }

            else {
                const hasContent = data.content && (Number(data.content) !== this.roll.total);
                if (!hasContent) data.content = await this.roll.render({ isPrivate: false, showStressRollButton: this.showStressRollButton });
                if (this.stressRoll) {
                    data.stressContent = await this.stressRoll.render({ isPrivate: false });
                }
            }
        }

        if (this.data.type === CONST.CHAT_MESSAGE_TYPES.OOC) {
            messageData.borderColor = this.user.color;
        }

        let html = await renderTemplate(CONFIG.ChatMessage.template, messageData);
        html = $(html);

        Hooks.call("renderChatMessage", this, html, messageData);
        return html;
    }
}

export function initialise() {
    console.log('heart | Registering ChatMessage');
    CONFIG.ChatMessage.documentClass = HeartChatMessage;
    CONFIG.ChatMessage.template = chatMessageHTML.path;
}