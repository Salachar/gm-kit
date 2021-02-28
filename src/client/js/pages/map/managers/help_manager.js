const Lib = require("../../../lib");

const HELP_INFO = [{
    key: '* +',
    text: 'Zoom in on the currently selected map'
},{
    key: '* -',
    text: 'Zoom out on the currently selected map'
}, {
    key: 'SHIFT',
    text: 'Hold down to allow quick placement of walls, points are connected as you click'
}, {
    key: 'CONTROL',
    text: 'Hold down to allow movement of placed wall endpoints<br>All walls sharing an endpoint will update'
}, {
    key: 'A',
    text: 'Place a light (yellow circle) on map at current mouse position',
    common: true
}, {
    key: 'E',
    text: 'Enable map lighting on GM screen (optional for GM)<br>Player screen will always have lighting enabled'
}, {
    key: 'D',
    text: 'Disable map lighting on GM screen'
}, {
    key: 'O',
    text: 'Toggle door (open/closed) nearest to the current mouse position (within a certain distance)',
    common: true
}, {
    key: 'T',
    text: 'Toggle segment closest to the mouse between wall and door (within a certain distance)',
}, {
    key: 'DELETE',
    text: 'Remove object closest to the mouse position (within a certain distance)',
    common: true
}, {
    key: '',
    text: '* Will work on Player Screen if it is focused',
}];

class HelpManager {
    constructor () {}

    toggle () {
        this.refs.help_box.classList.toggle('hide');
    }

    render () {
        return Lib.dom.generate(['div #help_box .hide', [
            ['table #help_table', [
                ['tr', [
                    ['th .help_key HTML=Key'],
                    ['th'],
                ]],
                ...HELP_INFO.map((help_item) => {
                    return ['tr .help_section', [
                        [`td .help_key HTML=${help_item.key}`],
                        [`td .help_desc HTML=${help_item.text}`],
                    ]]
                })
            ]],
        ]], this);
    }

    static getHelpInfo () {
        return HELP_INFO;
    }
}

module.exports = HelpManager;
