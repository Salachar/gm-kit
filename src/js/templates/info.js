class InfoTemplate {
    constructor (data = {}) {
        this.__data = data;
    }

    generate () {
        return `
            <div class="container_header">
                <div id="clear_results_all" class="button">Clear All Results</div>
                <div id="clear_results" class="button">Clear Unsaved Results</div>
                <div class="button selected" data-amount="1">1 Per Click</div>
                <div class="button" data-amount="3">3 Per Click</div>
                <div class="button" data-amount="5">5 Per Click</div>
                <div class="button" data-amount="10">10 Per Click</div>
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