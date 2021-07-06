export default function Character(actor) {
    return new Proxy(actor, {
        get(actor, name, proxy) {
            if(name === 'totalStress') {
                return Object.values(actor.data.data.resistances).reduce((sum, resistance) => {
                    return sum + resistance.value;
                }, 0);
            }
        }
    });
}