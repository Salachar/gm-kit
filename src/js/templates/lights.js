class LightsTemplate {
    constructor (data = {}) {
        this.__data = data;
    }

    generate () {
        return `
            <div class="container_header">
                <div id="lifx_refresh" class="button">refresh</div>
                <input id="lifx_access_code_input" type="text" class="text_input" placeholder="ENTER LIFX ACCESS CODE"></input>
                <div id="lifx_access_code_save" class="button">SAVE CODE</div>
                <div id="lifx_reset" class="button">RESET LIGHTS</div>
            </div>

            <div class="container_body">
            </div>
        `;
    }
}

module.exports = LightsTemplate;