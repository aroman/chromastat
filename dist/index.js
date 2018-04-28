"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const readline = __importStar(require("readline"));
const safe_1 = require("colors/safe");
const Thermostat_1 = __importDefault(require("./Thermostat"));
const actions = [
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
];
const thermostat = new Thermostat_1.default();
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', (str, key) => {
    if (key.ctrl && key.name === 'c') {
        return process.exit();
    }
    const action = actions.find(({ keyName }) => keyName === key.name);
    if (action) {
        thermostat.performAction(action);
    }
    else {
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(`unknown keypress: ${key.name}`);
    }
});
thermostat.on('change', () => {
    console.log(String(thermostat));
});
console.log(safe_1.underline(safe_1.rainbow('Chromastat 1.0')));
actions.forEach(({ keyName, description }) => {
    console.log(`Press ${safe_1.bold(keyName)} to ${safe_1.bold(description)}`);
});
console.log(String(thermostat));
//# sourceMappingURL=index.js.map