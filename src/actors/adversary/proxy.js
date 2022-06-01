export default {
    'adversary': function Adversary(actor) {
        return new Proxy(actor, {
            get(actor, name, proxy) {
                if (name === 'totalStress') {
                    return actor.data.data.resistance; 
                }

                if (name === 'effects') {
                    return actor.items.reduce((o, item) => {
                        return o.concat(item.transferredEffects);
                    }, []);
                }
                
                if (name === 'resources') {
                    function isActiveResource(resource) {
                        const isActive = resource.data.data.active ?? true;
                        const isComplete = resource.data.data.complete ?? false;
                        return resource.type === "resource" && isActive && !isComplete;
                    }
                    const class_ = actor.proxy.class;
                    const resources = [];
                    if (class_ !== undefined) {
                        resources.push(...class_.children.filter(isActiveResource))
                    }
                    resources.push(...actor.items.filter(isActiveResource));
                    return resources;
                }

                if (name === 'equipment') {
                    function isActiveEquipment(equipment) {
                        const isActive = equipment.data.data.active ?? true;
                        const isComplete = equipment.data.data.complete ?? false;
                        return equipment.type === "equipment" && isActive && !isComplete;
                    }
                    const equipment = [];

                    const class_ = actor.proxy.class;
                    if (class_ !== undefined) {
                        equipment.push(...class_.children.filter(isActiveEquipment))
                    }

                    equipment.push(...actor.items.filter(isActiveEquipment));
                    return equipment;
                }

            }
        });
    }
}