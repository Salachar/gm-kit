module.exports = [{
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
    text: 'Place a light (yellow circle) on map where the mouse is'
}, {
    key: 'E',
    text: 'Enable map lighting on GM screen (optional for GM)<br>Player screen will always have lighting enabled'
}, {
    key: 'D',
    text: 'Disable map lighting on GM screen'
}, {
    key: 'O',
    text: 'Toggle door (open/closed) nearest to the mouse (within a certain distance)'
}, {
    key: 'T',
    text: 'Toggle segment closest to the mouse between wall and door (within a certain distance)'
}, {
    key: 'DELETE',
    text: 'Remove light|wall|door|text closest to mouse (within a certain distance)'
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