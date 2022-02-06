const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

function randomID(length = 16) {
    const rnd = () => Math.random().toString(36).slice(2);
    let id = "";
    while (id.length < length)
        id += rnd();
    return id.slice(0, length);
}


function writeFiles(compiler) {

    function parseEquipment(equipment, group_id = "core") {
        return Object.values(equipment).map(data => {
            return {
                _id: randomID(),
                name: data.name,
                type: "equipment",
                data: {
                    type: data.type,
                    die_size: data.dice,
                    group: data.group_id || group_id,
                    children: Object.assign({}, ...(data.tags || []).map(x => cloneTag(x)).map(x => ({ [x._id]: x }))),
                }
            }
        });
    }

    function parseTags(data) {
        return Object.values(data).map(({name, description}) => {
            return {
                _id: randomID(),
                name: name,
                type: "tag",
                data: {
                    description: description
                }
            }
        })
    }

    function cloneTag(name) {
        if (stored.tags[`tag.${name}.name`] === undefined) throw `invalid tag ${name}`
        return Object.assign({}, stored.tags[`tag.${name}.name`], { _id: randomID(), name });
    }

    function parseAbilities(abilities, type = 'minor') {
        return Object.values(abilities).map((data) => {
            return {
                _id: randomID(),
                name: data.name,
                type: "ability",
                data: {
                    active: type === "core",
                    description: data.description,
                    type: data.type || type,
                    children: Object.assign({}, ...parseAbilities(data.nested_abilities || [], 'minor').map(x => ({ [x._id]: x }))),
                }
            }
        });
    }

    function parseResource(resources) {
        return Object.values(resources).map(data => {
            return {
                _id: randomID(),
                type: "resource",
                name: data.name,
                data: {
                    active: true,
                    die_size: data.dice,
                    domain: data.domain,
                }
            };
        });
    }

    function parseClasses(classes) {
        return Object.values(classes).map((data) => {
            const class_data = {
                _id: randomID(),
                name: data.name,
                type: "class",
                data: {
                    description: data.description,
                    core_domain: data.traits.domain,
                    core_skill: data.traits.skill,
                    equipment_groups: [],
                    children: Object.assign({},
                        ...[...parseResource(data.traits.resource),
                        ...parseAbilities(data.abilities.core, "core"),
                        ...parseAbilities(data.abilities.minor, "minor"),
                        ...parseAbilities(data.abilities.major, "major"),
                        ...parseAbilities(data.abilities.zenith, "zenith")
                        ].map(x => ({ [x._id]: x }))
                    )
                },
            }

            for (const [group_id, equipment_group] of Object.entries(data.traits.equipment)) {
                class_data.data.equipment_groups.push(group_id);
                const equipment = parseEquipment(equipment_group, group_id);
                equipment.forEach(equip => {
                    class_data.data.children[equip._id] = equip;
                });
            }

            return class_data;
        });
    }

    function parseCallings(callings) {
        return Object.values(callings).map(data => {
            return {
                _id: randomID(),
                name: data.name,
                type: "calling",
                data: {
                    description: data.description,
                    questions: Object.assign({}, ...data.questions.map(x => ({ [randomID()]: { question: x } }))),
                    children: Object.assign({}, ...parseAbilities(data["core_ability"] || {}, 'core').map(x => ({ [x._id]: x })),
                        ...parseBeats(data.beats.minor, 'minor').map(x => ({ [x._id]: x })),
                        ...parseBeats(data.beats.major, 'major').map(x => ({ [x._id]: x })),
                        ...parseBeats(data.beats.zenith, 'zenith').map(x => ({ [x._id]: x })),
                    ),
                }
            }
        });
    }

    function parseBeats(beats, type = "minor") {
        return beats.map(name => {
            return {
                _id: randomID(),
                name: name,
                type: "beat",
                data: {
                    description: name,
                    type: type
                }
            }
        });
    }

    const parsers = {
        'classes': parseClasses,
        'tags': parseTags,
        'callings': parseCallings,
    }
    const stored = {
        'tags': {},
        'classes': {},
        'callings': {},
    }

    return function (compilation) {
        for (const type of ['callings', 'tags', 'classes']) {
            const fullpath = path.join(this.packDataPath, type, type + ".yaml")
            const file = fs.readFileSync(fullpath, 'utf8');
            const data = yaml.parse(file);
            const type_items = parsers[type](data);

            Object.assign(stored[type], ...type_items.map(x => ({ [x.name]: x })));
            const content = type_items.map(x => JSON.stringify(x)).join('\n');
            this.external_packs.push(
                {
                    "name": type,
                    "label": type.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); }),
                    "system": "heart",
                    "path": `./packs/${type}.db`,
                    "entity": "Item"
                }
            )
            compilation.emitAsset(
                path.join('packs', type + '.db'),
                new (compiler.webpack.sources.RawSource)(content)
            )
        }
    }
}


module.exports = class FoundryVTTPacker {
    constructor(distPath, packDataPath, external_packs) {
        this.distPath = distPath;
        this.packDataPath = packDataPath;
        this.external_packs = external_packs;
    }

    apply(compiler) {
        compiler.hooks.thisCompilation.tap('FoundryVTT-Packer', writeFiles(compiler).bind(this));
    }
}