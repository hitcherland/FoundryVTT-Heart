export default {
    'class': function Class(item) {
        return new Proxy(item, {
            get(item, name, proxy) {
                
                if(name === 'effects') {
                    const skill = item.data.data.core_skill;
                    const skill_effect = new ActiveEffect({
                        _id: randomID(),
                        label: "Core Skill from Class",
                        changes: [{
                            key: `data.skills.${skill}.value`,
                            value: true,
                            mode:CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                            priority: 0,
                            transfer: true
                        }]
                    }, this);

                    
                    const domain = item.data.data.core_domain;
                    const domain_effect = new ActiveEffect({
                        _id: randomID(),
                        label: "Core Domain from Class",
                        changes: [{
                            key: `data.domains.${domain}.value`,
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