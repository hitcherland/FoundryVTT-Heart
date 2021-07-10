export default class ItemRoll extends Roll {
    static build({item} = {}, data={}, options={}) {
        options.item = item;
        return new this(item.data.data.di_size, data, options);
    }
}