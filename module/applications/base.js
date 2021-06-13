export class HeartApplication extends Application {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["heart"],
            closeOnSubmit: true,
            submitOnChange: false,
            submitOnClose: false,
            editable: true,
            width: 440
        });
    }

    _GetSections(html) {
        return html.find('[data-notification]').map((i, el) => {
            const notification = $(el);
            const data = notification.data();
            const section = $(el).closest('.section');

            return {
                data,
                section,
                notification
            }
        }).get();
    }

    _GetSectionData({data, section}={}) {        
        let elements;
        let values = [];

        if(data.type === "radio") {
            elements = section.find(`[name=${data.target}]`);
            values = elements.map((i, el) => el.checked).get();
        } else if(data.type === "multicheckbox") {
            elements = section.find(`[name^=${data.target}-]`);
            values = elements.map((i, el) => el.checked).get();
        } else if(data.type === "input") {
            elements = section.find(`[name=${data.target}]`);
            values = elements.map((i, el) => el.value).get();
        } else {
            throw `Invalid section type: ${data.type}`;
        }

        const isReady = values.some(x => x) || values.length === 0;

        return {
            elements,
            values,
            isReady,
        }
    }

    _getResultData(html) {
        const fd = new FormDataExtended(html.get(0));
        const data = fd.toObject();

        const sections = this._GetSections(html);
        sections.map(section => {
            if(section.data.type === 'multicheckbox') {
                const array = data[`${section.data.target}s`] = [];
                Object.keys(data).forEach(key => {
                    const match = key.match(new RegExp(`^${section.data.target}-(.*)$`));
                    if(!match) return;

                    if(data[key]) {
                        array.push(match[1]);
                    }
                    delete data[key];
                });
            } 
        });

        return data;
    }

    activateListeners(html) {
        const sectionsAreReady = {};

        const rollButton = html.find('[data-action=request-roll]').get(0);

        function allSectionsAreReady() {
            return Object.values(sectionsAreReady).every(x => x);
        }

        function setClass(element, isReady) {
            element.removeClass('fa-check-circle');
            element.removeClass('fa-times-circle');

            const fa = isReady ? 'check': 'times';
            element.addClass(`fa-${fa}-circle`);
        }

        const sections = this._GetSections(html);
        sections.map(d => {
            const section_data = this._GetSectionData(d);
            const optional = d.data.notification === 'optional';
            sectionsAreReady[d.data.target] = optional || section_data.isReady;
            setClass(d.notification, section_data.isReady);

            section_data.elements?.change(ev => {
                const new_data = this._GetSectionData(d);
                setClass(d.notification, new_data.isReady);
                sectionsAreReady[d.data.target] = optional || new_data.isReady;
                rollButton.disabled = !allSectionsAreReady()
            });
        });

        rollButton.disabled = !allSectionsAreReady()
        
        html.find('button').click(ev => {
            ev.preventDefault();
        });

        html.find('[data-action=cancel]').click(ev => {
            this.close();
        });

        html.find('[data-action=request-roll]').click(ev => {
            const fd = new FormDataExtended(html.get(0));

            const data = fd.toObject();

            sections.map(section => {
                if(section.data.type === 'multicheckbox') {
                    const array = data[`${section.data.target}s`] = [];
                    Object.keys(data).forEach(key => {
                        const match = key.match(new RegExp(`^${section.data.target}-(.*)$`));
                        if(!match) return;

                        if(data[key]) {
                            array.push(match[1]);
                        }
                        delete data[key];
                    });
                } 
            });

            if(this.Submit) {
                this.Submit(data);
            }

            this.close();
        });
    }
}

