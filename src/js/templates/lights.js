class LightsTemplate {
    constructor (data = {}) {
        this.__data = data;
    }

    generate () {
        return `
            <div class="container_header">
                <div id="lifx_refresh" class="button">refresh</div>
            </div>

            <div class="container_body">
            </div>
        `;
    }
}

module.exports = LightsTemplate;