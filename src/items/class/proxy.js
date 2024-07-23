export default {
    'class': function Class(item) {
        return new Proxy(item, {
            get(item, name, proxy) {
                
                if(name === 'effects') {
                    const skill = item.system.core_skill;
                    const skill_effect = new ActiveEffect({
                        _id: foundry.utils.randomID(),
                        label: "Core Skill from Class",
                        changes: [{
                            key: `system.skills.${skill}.value`,
                            value: true,
                            mode:CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                            priority: 0,
                            transfer: true
                        }]
                    }, this);

                    
                    const domain = item.system.core_domain;
                    const domain_effect = new ActiveEffect({
                        _id: foundry.utils.randomID(),
                        label: "Core Domain from Class",
                        changes: [{
                            key: `system.domains.${domain}.value`,
                            value: true,
                            mode:CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                            priority: 0,
                            transfer: true
                        }]
                    }, this);

                    return [skill_effect, domain_effect];
                }
            }
        });
    }
}