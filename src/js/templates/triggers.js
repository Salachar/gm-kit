class TriggersTemplate {
    constructor (data = {}) {
        this.__data = data;
    }

    generate () {
        return `
            <div class="container_header">
            </div>

            <div class="container_body">
            </div>
        `;
    }
}

module.exports = TriggersTemplate;