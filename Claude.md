# CLAUDE.md — Foundry Virtual Tabletop Development

## Target Platform

- **Foundry VTT V13** (stable) unless explicitly stated otherwise
- V14 awareness is useful but do not use V14-only APIs without confirmation
- Hosting target: **Forge-VTT** (forge-vtt.com)

## Key References

- V13 API docs: https://foundryvtt.com/api/v13/
- V14 API docs (forward reference): https://foundryvtt.com/api/
- Community wiki: https://foundryvtt.wiki/en/development/api
- ApplicationV2 guide: https://foundryvtt.wiki/en/development/api/applicationv2
- AppV2 conversion guide: https://foundryvtt.wiki/en/development/guides/applicationV2-conversion-guide
- Module development: https://foundryvtt.com/article/module-development/
- System development: https://foundryvtt.com/article/system-development/
- API migration guides: https://foundryvtt.com/article/migration/
- Package best practices: https://foundryvtt.wiki/en/development/guides/package-best-practices
- Source code (bundled): `{installPath}/resources/app/public/scripts/foundry.js`
- Source code (unbundled): `{installPath}/resources/app/client-esm/` (V13 moved client code to ES modules)

## Project Conventions

### Package Structure — Modules

```
my-module/
├── module.json            # Manifest (required)
├── scripts/               # JS files (listed in "scripts" array)
├── esmodules/             # ES modules (listed in "esmodules" array, preferred)
├── templates/             # Handlebars templates (.hbs)
├── styles/                # CSS stylesheets
├── languages/             # Localization JSON files
├── packs/                 # Compendium packs (LevelDB format in V13)
└── README.md
```

### Package Structure — Systems

```
my-system/
├── system.json            # Manifest (required)
├── template.json          # DEPRECATED — use DataModel instead
├── module/                # ES module source (common convention)
│   ├── documents/         # Actor, Item subclasses
│   ├── sheets/            # ApplicationV2 sheet classes
│   ├── data-models/       # TypeDataModel definitions
│   └── helpers/           # Utility functions
├── templates/             # Handlebars templates (.hbs)
├── styles/                # CSS stylesheets
├── languages/             # Localization JSON
├── packs/                 # Compendium packs (LevelDB)
└── README.md
```

### Manifest (module.json / system.json)

Required fields for V13:

```json
{
  "id": "my-module",
  "title": "My Module",
  "version": "1.0.0",
  "compatibility": {
    "minimum": "13",
    "verified": "13",
    "maximum": "13"
  },
  "authors": [{ "name": "Author Name" }],
  "esmodules": ["esmodules/main.mjs"],
  "styles": ["styles/main.css"],
  "manifest": "https://github.com/user/repo/releases/latest/download/module.json",
  "download": "https://github.com/user/repo/releases/download/v1.0.0/module.zip"
}
```

Key rules:

- `id` must be lowercase, hyphen-separated (not underscores), and match the folder name exactly
- System IDs must also match exactly — e.g. `mythicbastionland` not `mythic-bastionland`
- Use `esmodules` (not `scripts`) for new code — these load as proper ES modules
- `manifest` URL should be stable (points to `/releases/latest/download/module.json`)
- `download` URL should point to the specific version’s zip
- Deprecated fields removed in V13: `name` (use `id`), `minimumCoreVersion`/`compatibleCoreVersion` (use `compatibility`)

### Compendium Packs (LevelDB)

V13 uses LevelDB for compendium packs. Build workflow:

1. Author source data as JSON files
1. Compile with `@foundryvtt/foundryvtt-cli` using `compilePack`
1. Remove the `LOCK` file from compiled LevelDB directories before packaging

**Critical**: Every document MUST have a `_key` field or `compilePack` silently skips it:

- Actors: `"_key": "!actors!{_id}"`
- Items: `"_key": "!items!{_id}"`
- Folders: `"_key": "!folders!{_id}"`
- Embedded items on actors: `"_key": "!actors.items!{actorId}.{itemId}"`

Verify compilation by round-tripping through `extractPack` before final packaging.

Pack declaration in manifest:

```json
"packs": [
  {
    "name": "my-actors",
    "label": "My Actors",
    "path": "packs/my-actors",
    "type": "Actor"
  }
]
```

Valid `type` values: `Actor`, `Item`, `JournalEntry`, `RollTable`, `Scene`, `Macro`, `Cards`, `Playlist`, `Adventure`

### Release Packaging

Zip structure must contain files inside a folder named after the package ID:

```
module.zip
└── my-module/
    ├── module.json
    ├── esmodules/
    ├── templates/
    ├── styles/
    ├── packs/
    └── ...
```

GitHub release workflow pattern:

```yaml
on:
  release:
    types: [published]
```

## V13 Application Framework (ApplicationV2)

### Class Hierarchy

```
ApplicationV2 (Base)
├── DocumentSheetV2 (Document-specific)
│   ├── ActorSheetV2 (Actor-specific, has built-in drag/drop)
│   └── ItemSheetV2
└── DialogV2 (Modal dialogs)
```

ApplicationV1 is deprecated and will be removed in V16. Always use ApplicationV2 for new code.

### Accessing Classes

```javascript
// V13 uses nested module paths — destructure for convenience
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;
const { DialogV2 } = foundry.applications.api;
```

### Basic ApplicationV2 Pattern

```javascript
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

class MyApp extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "my-app",
    classes: ["my-module"],
    tag: "div",
    window: {
      title: "MY_MODULE.Title",
      icon: "fa-solid fa-dice",
      resizable: true
    },
    position: { width: 500, height: 400 },
    actions: {
      myAction: MyApp.#onMyAction
    }
  };

  static PARTS = {
    main: { template: "modules/my-module/templates/app.hbs" }
  };

  async _prepareContext(options) {
    return {
      // Data passed to the Handlebars template
    };
  }

  static async #onMyAction(event, target) {
    // Handle click on elements with [data-action="myAction"]
  }
}
```

### Actor/Item Sheet Pattern

```javascript
const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

class MyActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["my-system", "actor-sheet"],
    position: { width: 600, height: 700 },
    actions: {
      rollCheck: MyActorSheet.#onRollCheck
    },
    form: {
      submitOnChange: true
    }
  };

  static PARTS = {
    header: { template: "systems/my-system/templates/actor/header.hbs" },
    tabs: { template: "systems/my-system/templates/actor/tabs.hbs" },
    stats: { template: "systems/my-system/templates/actor/stats.hbs" },
    inventory: { template: "systems/my-system/templates/actor/inventory.hbs" }
  };

  async _prepareContext(options) {
    const context = {
      actor: this.actor,
      system: this.actor.system,
      items: this.actor.items,
      editable: this.isEditable
    };
    // Enrich HTML fields
    context.enrichedBio = await TextEditor.enrichHTML(
      this.actor.system.biography,
      { secrets: this.actor.isOwner, rollData: this.actor.getRollData() }
    );
    return context;
  }

  // ActorSheetV2 provides automatic drag/drop for .draggable elements
}
```

### Important ApplicationV2 Rules

- **No nested `<form>` tags** — AppV2 wraps content in a form automatically
- **Actions replace listeners** — use `data-action="name"` attributes instead of `activateListeners`
- **`_prepareContext`** replaces `getData` — must return an object for the template
- **`_onRender`** is the place for non-click event listeners if needed
- **Partial rendering** — only changed PARTS re-render, preserving scroll position
- **ProseMirror in V13** — use `<prose-mirror>` element, not `{{editor}}` helper:

```handlebars
{{#if editable}}
  <prose-mirror name="system.biography" value="{{system.biography}}">
    {{{enrichedBio}}}
  </prose-mirror>
{{else}}
  {{{enrichedBio}}}
{{/if}}
```

### CSS Layers (V13)

V13 introduces CSS layers. System/module CSS may break if it relied on specificity against core styles. Use CSS custom properties and layers:

```css
@layer my-system {
  .my-system .stat-block {
    /* styles */
  }
}
```

Checkboxes now use FontAwesome icons — style `::before` and `::after` pseudo-elements.

## Data Model & Document Patterns

### TypeDataModel (replaces template.json)

```javascript
class CharacterData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      health: new fields.SchemaField({
        value: new fields.NumberField({ initial: 10, integer: true, min: 0 }),
        max: new fields.NumberField({ initial: 10, integer: true, min: 0 })
      }),
      biography: new fields.HTMLField({ initial: "" }),
      level: new fields.NumberField({ initial: 1, integer: true, min: 1, max: 20 })
    };
  }
}
```

Register in the system’s init hook:

```javascript
Hooks.once("init", () => {
  CONFIG.Actor.dataModels.character = CharacterData;
  CONFIG.Item.dataModels.weapon = WeaponData;
});
```

### Document CRUD

```javascript
// Create
const actor = await Actor.create({ name: "Test", type: "character" });

// Read
const actor = game.actors.get(id);
const item = actor.items.get(itemId);

// Update
await actor.update({ "system.health.value": 5 });

// Delete
await actor.delete();

// Embedded documents
await actor.createEmbeddedDocuments("Item", [itemData]);
await actor.updateEmbeddedDocuments("Item", [{ _id: itemId, "system.quantity": 3 }]);
await actor.deleteEmbeddedDocuments("Item", [itemId]);
```

### Flags (module data storage)

```javascript
// Set
await document.setFlag("my-module", "myKey", value);

// Get
const value = document.getFlag("my-module", "myKey");

// Unset
await document.unsetFlag("my-module", "myKey");
```

## Hooks

```javascript
// One-time hooks (for initialization)
Hooks.once("init", () => { /* Register sheets, settings, data models */ });
Hooks.once("ready", () => { /* Access game.users, game.actors, etc. */ });

// Recurring hooks
Hooks.on("renderActorSheet", (app, html, data) => { /* Modify rendered sheets */ });
Hooks.on("preCreateActor", (document, data, options, userId) => { /* Intercept creation */ });
Hooks.on("createActor", (document, options, userId) => { /* React to creation */ });
Hooks.on("updateActor", (document, change, options, userId) => { /* React to updates */ });

// Chat hooks
Hooks.on("renderChatMessage", (message, html, data) => { /* Modify chat cards */ });
```

## Game Settings

```javascript
Hooks.once("init", () => {
  game.settings.register("my-module", "mySetting", {
    name: "MY_MODULE.Settings.MySettingName",
    hint: "MY_MODULE.Settings.MySettingHint",
    scope: "world",      // "world" (GM only) or "client" (per-user)
    config: true,         // Show in settings UI
    type: Boolean,
    default: false,
    onChange: (value) => { /* React to changes */ }
  });
});
```

## Common Patterns

### Adding Sidebar Buttons

```javascript
Hooks.on("getActorDirectoryEntryContext", (html, options) => {
  // Add context menu options
});

Hooks.on("renderActorDirectory", (app, html, data) => {
  // Add buttons to the Actors Directory header
  const button = document.createElement("button");
  button.innerHTML = '<i class="fas fa-dice"></i> Generate';
  button.addEventListener("click", () => { /* handler */ });
  html.querySelector(".header-actions").appendChild(button);
});
```

### Roll Tables

```javascript
const table = game.tables.getName("My Table");
const result = await table.roll();
// result.results[0].text — the drawn result text
```

### Chat Messages

```javascript
// Simple
ChatMessage.create({ content: "Hello world" });

// Templated card
const html = await renderTemplate("modules/my-module/templates/card.hbs", data);
ChatMessage.create({
  content: html,
  speaker: ChatMessage.getSpeaker({ actor })
});
```

### Dialogs (V2)

```javascript
const { DialogV2 } = foundry.applications.api;

const result = await DialogV2.confirm({
  window: { title: "Confirm Action" },
  content: "<p>Are you sure?</p>",
  yes: { callback: () => true },
  no: { callback: () => false }
});

// Or with custom buttons
const choice = await DialogV2.wait({
  window: { title: "Choose" },
  content: "<p>Pick one:</p>",
  buttons: [
    { label: "Option A", action: "a", callback: () => "a" },
    { label: "Option B", action: "b", callback: () => "b" }
  ]
});
```

## Forge-VTT Specifics

- Asset URL pattern: `https://assets.forge-vtt.com/bazaar/systems/{systemId}/{version}/`
- Modules installed via Forge use the standard Foundry module path structure
- Test with the Forge’s “The Bazaar” for public distribution

## Build Tooling

### foundryvtt-cli (Compendium Compilation)

```bash
npm install -g @foundryvtt/foundryvtt-cli

# Compile JSON source to LevelDB
fvtt package pack --type Module --in src/packs/my-pack-src --out packs/my-pack

# Extract LevelDB to JSON (for verification)
fvtt package unpack --type Module --in packs/my-pack --out src/packs/my-pack-src
```

The CLI uses ES modules — build scripts should use `.mjs` extension.

### Webpack (for complex modules/systems)

Common pattern with `foundryvtt.config.js`:

- Source in `src/`
- Build output to `dist/`
- Entry point typically `src/module.mjs` or `src/system.mjs`

## Common Pitfalls

1. **`compilePack` silently skips documents missing `_key`** — always include `_key` on every document
1. **System ID mismatch** — the folder name, manifest `id`, and any references must match exactly
1. **Nested `<form>` in AppV2** — AppV2 adds its own form wrapper; don’t add another
1. **`html-to-image` cannot resolve CSS custom properties** — inline computed styles before capture
1. **Forgetting to remove LevelDB `LOCK` file** before packaging compendium packs
1. **Using `getData` instead of `_prepareContext`** — that’s the AppV1 pattern
1. **Setting max values independently of current values** — for resources like health/guard, max should often equal current on creation
1. **Zip structure** — files must be inside a folder matching the package ID, not at the zip root
1. **`name` field in manifest** — deprecated since V10, use `id` and `title`
1. **`entity` in pack definitions** — deprecated, use `type`