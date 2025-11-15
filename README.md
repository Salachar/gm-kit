# GM Kit

## Installation
Node and NPM are needed to run the app locally:
https://docs.npmjs.com/downloading-and-installing-node-js-and-npm
Clone the repository:
`git clone repository_origin`
Navigate into the cloned project.
Once in the project folder:
`npm install`
`npm start`

## DM Keys and Map Interaction
* -: Zoom out
* +: Zoom in
* Shift (hold): Wall connects to last placed wall
* A: Add light - Affects player screen, adding a light here adds one in the same spot on the player screen
* D: Disable Light - (DM screen only, no Player screen affect)
* E: Enable Light - (DM screen only, no Player screen affect) - Cant place walls with light enabled
* O: Open/close the nearest door
* T: Toggle closest wall/door between wall/door
* Z/C (hold): Wall manipulation mode - While holding you can mouse hover over a wall and see a circle indicating the affected point - Wall ends can be grabbed and moved - Clicking in the middle splits the wall there creating two connected walls
* BACKSPACE: Delete closest wall/door/light

## File Naming Conventions
#### Variants
Variants are the same map with very subtle differences, they typically still share the same walls.

Example naming convention:
* `ANCIENT DWARVEN UNDEGROUND CITY 1 (cobwebs)`
* `ANCIENT DWARVEN UNDEGROUND CITY 1 (no cobwebs)`
Both will appear under `ANCIENT DWARVEN UNDEGROUND CITY 1` with `COBWEBS` and `NO COBWEBS` variants. If a variant doesn't have a unique JSON file for itself, it will use one for a variant if available. This way you typically don't have to create the same wall-set multiple times for day, night, evening, rain, etc verson of a map.

All accepted naming conventions:
* Using `-` like with `ANCIENT DWARVEN UNDEGROUND CITY 1 - cobwebs`
* Using `(` like with `ANCIENT DWARVEN UNDEGROUND CITY 1 (cobwebs)`
* Using `[` like with `ANCIENT DWARVEN UNDEGROUND CITY 1 [cobwebs]`

#### DM Version
If a file name matches certain conditions it will be treated as the "DM" version, and load on the DM screen only. If there no matching non-DM map file, the players will also get the DM version.

The following substrings are checked for in determining a DM version:
* `DM_` anywhere in the filename
* `_DM` anywhere in the filename
* `(DM)` anywhere in the filename
