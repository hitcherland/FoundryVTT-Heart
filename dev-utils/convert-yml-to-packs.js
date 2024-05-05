const fs = require('fs');
const path = require('path');
const yaml = require('yaml');
const glob = require('glob');
const fvtt = import("@foundryvtt/foundryvtt-cli");

function randomID(length = 16) {
    const rnd = () => Math.random().toString(36).slice(2);
    let id = "";
    while (id.length < length)
        id += rnd();
    return id.slice(0, length);
}


function parseEquipment(equipment, group_id = "core", class_="") {
    return Object.entries(equipment).map(([key, data]) => {
        data = data || {};
        if(data.name === undefined) {
            data.name = `class.${class_}.traits.equipment.${group_id}.${key}.name`;
        }
        return {
            _id: randomID(),
            name: data.name,
            type: "equipment",
            system: {
                type: data.type,
                die_size: data.dice,
                group: data.group_id || group_id,
                resistances: data.resistances,
                children: Object.assign({}, ...(data.tags || []).map(x => cloneTag(x)).map(x => ({ [x._id]: x }))),
            }
        }
    });
}

function parseTags(data) {
    return Object.values(data).map(({ name, description }) => {
        return {
            _id: randomID(),
            name: `${name}`,
            type: "tag",
            system: {
                description: description
            }
        }
    })
}

function cloneTag(name) {
    const new_name = `tag.${name}.name`;
    if (stored.tags[new_name] === undefined) throw `invalid tag ${name}`
    return Object.assign({}, stored.tags[new_name], { _id: randomID(), name: new_name });
}

function parseAbilities(abilities, type = 'minor', keyable) {
    return Object.entries(abilities).map(([key, data]) => {
        data = data || {};
        return {
            _id: randomID(),
            name: data.name || `${keyable}.${key}.name`,
            type: "ability",
            system: {
                active: type === "core",
                description: data.description || `${keyable}.${key}.description`,
                type: data.type || type,
                children: Object.assign({}, ...parseAbilities(data.nested_abilities || [], 'minor', `${keyable}.${key}.nested_abilities`).map(x => ({ [x._id]: x }))),
            }
        }
    });
}

function parseResource(resources, class_) {
    return Object.entries(resources).map(([key, data]) => {
        data = data || {};
        if(data.name === undefined) {
            data.name = `class.${class_}.traits.resource.${key}.name`
        }
        return {
            _id: randomID(),
            type: "resource",
            name: data.name,
            system: {
                active: true,
                die_size: data.dice,
                domain: data.domain,
                children: Object.assign({}, ...(data.tags || []).map(x => cloneTag(x)).map(x => ({ [x._id]: x }))),
            }
        };
    });
}

function parseClasses(classes) {
    return Object.entries(classes).map(([key, data]) => {
        if(data.name === undefined) {
            data.name = `class.${key}.name`;
        }
        if(data.description === undefined) {
            data.description = `class.${key}.description`;
        }

        const class_data = {
            _id: randomID(),
            name: data.name,
            type: "class",
            system: {
                description: data.description,
                core_domain: data.traits.domain,
                core_skill: data.traits.skill,
                equipment_groups: [],
                children: Object.assign({},
                    ...[...parseResource(data.traits.resource, key),
                    ...parseAbilities(data.abilities.core, "core", `class.${key}.abilities.core`),
                    ...parseAbilities(data.abilities.minor, "minor", `class.${key}.abilities.minor`),
                    ...parseAbilities(data.abilities.major, "major", `class.${key}.abilities.major`),
                    ...parseAbilities(data.abilities.zenith, "zenith", `class.${key}.abilities.zenith`)
                    ].map(x => ({ [x._id]: x }))
                )
            },
        }

        for (const [group_id, equipment_group] of Object.entries(data.traits.equipment)) {
            class_data.system.equipment_groups.push(group_id);
            const equipment = parseEquipment(equipment_group, group_id, key);
            equipment.forEach(equip => {
                class_data.system.children[equip._id] = equip;
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
            system: {
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
            system: {
                description: name,
                type: type
            }
        }
    });
}

function parseFallouts(fallouts) {
    return Object.entries(fallouts).reduce((output, [type, type_fallouts]) => {
        const fallouts = Object.entries(type_fallouts).reduce((output, [resistance, resistance_fallouts]) => {
            const fallouts = Object.entries(resistance_fallouts).map(([key, data]) => {
                data = data || {};
                return {
                    _id: randomID(),
                    name: data.name || `fallout.${type}.${resistance}.${key}.name`,
                    type: "fallout",
                    system: {
                        description: data.description || `fallout.${type}.${resistance}.${key}.description`,
                        resistance,
                        type,
                    }
                }
            });
            output.push(...fallouts);
            return output;
        }, []);
        output.push(...fallouts);
        return output;
    }, []);
}

function parseAncestries(ancestries) {
    return Object.entries(ancestries).map(([key, data]) => {
        data = data || {};
        return {
            _id: randomID(),
            name: `ancestry.${key}.group_name`,
            type: "ancestry",
            system: {
                description: `ancestry.${key}.description`,
                singular: `ancestry.${key}.singular`,
                questions: Object.assign({}, Object.entries(data.questions || {}).map(([id, data]) => ({ [id]: `ancestry.${key}.questions.${id}` }))),
            }
        }
    });
}

const parsers = {
    'classes': parseClasses,
    'tags': parseTags,
    'callings': parseCallings,
    'fallouts': parseFallouts,
    'ancestries': parseAncestries,
};

const stored = {
    'tags': {},
    'classes': {},
    'callings': {},
    'fallouts': {},
    'ancestries': {},
};
const external_packs = [];

const target = './dist/packs';
if (fs.existsSync(target)) {
    console.log(`Cleaning up old ${target}`)
    fs.rmSync(target, {recursive: true});
};
fs.mkdirSync(target);

const tmp = './tmp-packs';
if (fs.existsSync(tmp)) {
    console.log(`Cleaning up old ${tmp}`)
    fs.rmSync(tmp, {recursive: true});
};
fs.mkdirSync(tmp);

const paths = glob.globSync('./pack-data/**/*.yaml');

const manifest = fs.readFileSync('./dist/system.json');
const json = JSON.parse(manifest);

Promise.all(paths.map((filename) => {
    const type = path.basename(filename).replace(/\.yaml$/, '');
    const content = fs.readFileSync(filename, 'utf8');
    const data = yaml.parse(content);
    const type_items = parsers[type](data);

    fs.mkdirSync(`./${tmp}/${type}`);
    fs.mkdirSync(`./${target}/${type}`);

    Object.assign(stored[type], ...type_items.map(x => ({ [x.name]: x })));
    type_items.forEach(data => {
        data._key = `!items!${data._id}`;
        const string = JSON.stringify(data, null, 4);
        fs.writeFileSync(`./${tmp}/${type}/${data.name}_${data._id}.json`, string);
    });
    const promise = fvtt.then(f => {
        return f.compilePack(`${tmp}/${type}/`, `./${target}/${type}`)
    });

    if(json.packs.find((e) => e.name === type) === undefined) {
        console.warn(`Adding ${type}.db to system.json`);
        json.packs.push(
            {
                "name": type,
                "label": type.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); }),
                "system": "heart",
                "path": `./packs/${type}.db`,
                "type": "Item",
                "entity": "Item",
            });
    }

    return promise;
})).then(() => {
    fs.rmSync(tmp, {recursive: true});
});

fs.writeFileSync('./dist/system.json', JSON.stringify(json, null, 4));