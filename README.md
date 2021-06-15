# Heart - The City Beneath

This is a simplistic implementation of [Heart - The City Beneath](https://rowanrookanddecard.com/product/heart-the-city-beneath-rpg/) for [FoundryVTT](https://foundryvtt.com/) . It provides a character sheet based on the one provided inside Heart. It doesn't currently do anything fancier than storing numbers and textfields.
## Features

* Saves your character information as text - wow
* Multiline inputs use FoundryVTT's inbuilt rich text editor
* Skills can be checked, as expected
* Resistances and Protections can be increased and decreased by clicking on the boxes.
* Rollable buttons (and macros for the GM) in character sheets for rolling, stress and fallout.
* Clickable chat messages to perform rolls.

## Usage

New buttons are available in the character sheet for players, or from the hotbar via macros for the GM.


![An example character sheet](https://i.imgur.com/8paJrcO.png)

![Macros](https://i.imgur.com/DsW0Xvz.png)

### Roll Requests

A roll request is a clickable chat message that allows the players to roll with specific parameters.


Rolls can be made via: 
* "Request Roll" button in a Character Sheet
* "Prepare Roll Request" Macro

Clicking on either of these will open a window like below:
![Blank Roll Request window](https://i.imgur.com/PkjB1Le.png)
 
For example, preparing a roll request like this
![Preparing a Roll Request](https://i.imgur.com/BwGaaIb.png)

will create a chat message like this
![Roll Request in Chat](https://i.imgur.com/nC3Sur9.png)

### Rolls

This is a typical "Heart" `1d10` roll.

Rolls can be made with the following: 
* "Roll" button in a Character sheet
* "Roll" button in chat message
* "Prepare Roll" Macro

As before, this will open a new window. Depending on the source, we might not need to fill in the difficulty setting. From the macro, we see
![Without a predefined difficulty value](https://i.imgur.com/g7YBPQd.png)

But from the chat message, we have
![With a predefined difficulty value](https://i.imgur.com/lFaXD5M.png)

Again, this might result in chat messages like

![Success roll](https://i.imgur.com/cGZjSqZ.png)
![Failure roll](https://i.imgur.com/dwtGFPA.png)

### Stress

We also can manage stress rolls.

Stress rolls can be made with the following: 
* "Roll Stress" button in a Character sheet
* "Roll Stress" button in chat message
* "Prepare Stress Roll" Macro

From the macro:
![Prepare stress roll](https://i.imgur.com/0NzCkBf.png)

which might result in
![Stress chat message](https://i.imgur.com/ZZ1rZhJ.png)

### Fallout

We also can manage fallout rolls

Stress rolls can be made with the following: 
* "Roll Fallout" button in a Character sheet
* "Prepare Fallout Roll" Macro

An example chat message as a result:
![Fallout Chat Message](https://i.imgur.com/DsW0Xvz.png)


## TODO

- [x] Make a basic fillable character sheet.
- [ ] Get a hold of the fonts, or something like them (main one is "The Bartender Condensed Serif Press" by Vintage Voyage Design Supply)
- [ ] Convert Equipment, Resources, Abilities and Fallout from a textfield to a list of textfields
- [ ] Make Equipment & Resources Rollable
- [x] Add a roller that lets you pick skill, domain, knacks & mastery, difficulty etc
- [x] Add a stress roller
- [x] Add a fallout roller
- [ ] Look into adding "class" and "calling" items
- [ ] Add ChatMessage buttons to clear stress when receiving fallout
- [ ] Cleanup translation file
- [ ] Cleanup CSS file