export default {
    'character': function Character(actor) {
        return new Proxy(actor, {
            get(actor, name, proxy) {
                if (name === 'totalStress') {
                    return Object.values(actor.data.data.resistances).reduce((sum, resistance) => {
                        return sum + resistance.value;
                    }, 0);
                }

                if (name === 'calling') {
                    const calling = actor.items.find(x => x.type === 'calling');
                    return calling;
                }

                if (name === 'class') {
                    const class_ = actor.items.find(x => x.type === 'class');
                    return class_;
                }

                if (name === 'beats') {
                    function isActiveBeat(beat) {
                        return beat.type === "beat" && beat.data.data.active && !beat.data.data.complete
                    }
                    const beats = actor.items.filter(isActiveBeat);
                    const calling = actor.proxy.calling;
                    if (calling !== undefined) {
                        beats.push(...calling.children.filter(isActiveBeat))
                    }
                    return beats;
                }

                if (name === 'abilities') {
                    function isAbility(item) {
                        return item.type === "ability" && item.data.data.active;
                    }
                    const abilities = actor.items.filter(item => item.type === "ability");
                    const calling = actor.proxy.calling;
                    if (calling !== undefined) {
                        abilities.push(...calling.children.filter(item => item.type === "ability"));
                    }

                    const class_ = actor.proxy.class;
                    if (class_ !== undefined) {
                        abilities.push(...class_.children.filter(isAbility));
                    }

                    return abilities;
                }

                if(name === 'effects') {
                    return actor.items.reduce((o, item) => {
                        return o.concat(item.transferredEffects);
                    }, []);
                }
            }
        });
    }
}