class InfoTemplate {
    constructor (data = {}) {
        this.__data = data;
    }

    generate () {
        return `
            <div class="container_header">
                <div id="clear_results_all" class="button">Clear All Results</div>
                <div id="clear_results" class="button">Clear Unmarked Results</div>
                <input id="generate_amount" type="text" class="text_input" placeholder="AMOUNT PER CLICK"></input>
            </div>

            <div class="container_body">
                <div id="info_buttons">

                </div>
                <div id="info_results"></div>
            </div>
        `;
    }
}

module.exports = InfoTemplate;