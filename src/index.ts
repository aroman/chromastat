import * as _ from 'lodash';
import * as readline from 'readline';
import { bold, rainbow, underline } from 'colors/safe';
import { Action, State } from './types';
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
        keyName: 'd',
        name: 'dim',
        description: 'dim display to 30%',
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
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(`unknown keypress: ${key.name}`)
    }
});

thermostat.on('change', () => {
    console.log(String(thermostat));
});

console.log(underline(rainbow('Chromastat 1.0')))
actions.forEach(({ keyName, description }) => {
    console.log(`Press ${bold(keyName)} to ${bold(description)}`);
})
console.log(String(thermostat));