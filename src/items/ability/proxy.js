export default {
    'ability': function Ability(item) {
        return new Proxy(item, {
            get(item, name, proxy) {
                if (name === 'abilities') {
                    return item.children.filter(child => child.type === "ability");
                }
            }
        });
    }
}