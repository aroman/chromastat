import * as _ from 'lodash';
import * as readline from 'readline';
import { bold, rainbow, underline } from 'colors/safe';
import { Action, State, PixelColor } from './types';
import Thermostat from './Thermostat';

const actions: Action[] = [
    {
        keyName: 'w',
        name: 'wake',
        description: 'wake',
    },
    {
        keyName: 's',
        name: 'sleep',
        description: 'sleep',
    },
    {
        keyName: 'up',
        name: 'increase-desired',
        description: 'increase desired temperature',
    },
    {
        keyName: 'down',
        name: 'decrease-desired',
        description: 'decrease desired temperature',
    },
    {
        keyName: 'right',
        name: 'increase-current',
        description: 'increase current temperature',
    },
    {
        keyName: 'left',
        name: 'decrease-current',
        description: 'decrease current temperature',
    },
    {
        keyName: 'space',
        name: 'confirm',
        description: 'confirm action',
    },
    {
        keyName: 'k',
        name: 'increase-brightness',
        description: 'increase LED strip brightness',
    },
    {
        keyName: 'j',
        name: 'decrease-brightness',
        description: 'decrease LED strip brightness',
    },
    {
        keyName: 'd',
        name: 'dim',
        description: 'dim display to 30%',
    },
    {
        keyName: 'r',
        name: 'reset',
        description: 'reset',
    },
]

const thermostat = new Thermostat();

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

process.stdin.on('keypress', (str, key) => {
    if (key.ctrl && key.name === 'c') {
        return process.exit();
    }
    const action = actions.find(({ keyName }) => keyName === key.name);

    if (action) {
        thermostat.performAction(action);
    } else {
        redraw()
        process.stdout.write(`\nUnknown keypress: ${key.name}`)
    }
});

thermostat.on('change', () => {
    redraw()
})

function redraw() {
    // clear screen
    // process.stdout.write('\x1B[2J\x1B[0f');


    // visualize thermostat state
    console.log()
    console.log(String(thermostat));
}

redraw();

// display help/instructions
console.log(underline(rainbow('Chromastat 1.0')))
actions.forEach(({ keyName, description }) => {
    console.log(`Press ${bold(keyName)} to ${bold(description)}`);
})
