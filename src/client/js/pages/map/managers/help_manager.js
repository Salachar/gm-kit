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
    key: 'W',
    text: 'Toggle walls on main window when lighting is on<br>This is entirely optional and only affects the GM screen'
}, {
    key: '** S',
    text: 'Create the Player Screen, if there is map open it will display it<br>If the Player Screen is already open, this will display the current map on the GM Screen'
}, {
    key: '* [',
    text: 'Decrease dimmer on the Player Screen (artifical screen brightness)'
}, {
    key: '* ]',
    text: 'Increase dimmer on the Player Screen (artifical screen brightness)'
}, {
    key: '',
    text: '* Holding ALT will cause this action on the display window'
}, {
    key: '',
    text: '** Only holding ALT will cause this action on the display window'
}];

// There is a good chance I will be adding these back in
// , {
//     key: 'LEFT *',
//     text: 'Scroll the map to the left'
// }, {
//     key: 'RIGHT *',
//     text: 'Scroll the map to the right'
// }, {
//     key: 'TOP *',
//     text: 'Scroll the map to the top'
// }, {
//     key: 'BOTTOM *',
//     text: 'Scroll the map to the bottom'
// }

const {
    c,
    createElement,
    cacheElements,
    listener
} = Lib.dom;

class HelpManager {
    constructor () {
        cacheElements(this, [
            'help_box',
            'help_table'
        ]);

        // this.populate();
        // this.setEvents();
    }

    // populate () {
    //     HELP_INFO.forEach((help_item) => {
    //         let help_item_node = createElement('tr', 'help_section', {
    //             addTo: this.el_help_table
    //         });
    //         createElement('td', 'help_key', {
    //             html: help_item.key,
    //             addTo: help_item_node
    //         });
    //         createElement('td', 'help_desc', {
    //             html: help_item.text,
    //             addTo: help_item_node
    //         });
    //     });
    // }

    setEvents () {
        listener('help', 'click', (e) => {
            this.el_help_box.classList.toggle('hide');
        });
    }

    render () {
        return ['div .help_container', [
            ['div #help .button HTML=Help', {
                click: (e) => {
                    document.getElementById('help_box').classList.toggle('hide');
                }
            }],
            ['div #help_box .hide', [
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
            ]]
        ]];

        // return ['div', '.help_container', {}, [
        //     ['div', '#help .button', {
        //         html: 'Help',
        //         events: {
        //             click: (e) => {
        //                 document.getElementById('help_box').classList.toggle('hide');
        //             }
        //         },
        //     }],
        //     ['div', '#help_box .hide', {}, [
        //         ['table', '#help_table', {}, [
        //             ['tr', '', {}, [
        //                 ['th', '.help_key', {
        //                     html: 'Key',
        //                 }],
        //                 ['th'],
        //             ]],
        //             ...HELP_INFO.map((help_item) => {
        //                 return ['tr', '.help_section', {}, [
        //                     ['td', '.help_key', {
        //                         html: help_item.key,
        //                     }],
        //                     ['td', '.help_desc', {
        //                         html: help_item.text,
        //                     }],
        //                 ]]
        //             })
        //         ]],
        //     ]]
        // ]];

        // return ['div', '#help_box .hide', {}, [
        //     ['table', '#help_table', {}, [
        //         ['tr', '', {}, [
        //             ['th', '.help_key', {
        //                 html: 'Key',
        //             }],
        //             ['th'],
        //         ]],
        //         ...HELP_INFO.map((help_item) => {
        //             return ['tr', '.help_section', {}, [
        //                 ['td', '.help_key', {
        //                     html: help_item.key,
        //                 }],
        //                 ['td', '.help_desc', {
        //                     html: help_item.text,
        //                 }],
        //             ]]
        //         })
        //     ]],
        // ]];
    }

    static getHelpInfo () {
        return HELP_INFO;
    }

    // static template () {
    //     return `
    //         <div id="help_box" class="hide">
    //             <table id="help_table">
    //                 <tr>
    //                     <th class="help_key">Key</th>
    //                     <th></th>
    //                 </tr>
    //             </table>
    //         </div>
    //     `;
    // }
}

module.exports = HelpManager;