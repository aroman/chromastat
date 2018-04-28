"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const types_1 = require("./types");
class Thermostat extends events_1.EventEmitter {
    constructor() {
        super();
        this.reset();
    }
    get isAdjusted() {
        return this.currentTemperature === this.desiredTemperature;
    }
    toString() {
        return `Thermostat<${this.state}, temp = ${this.currentTemperature}, desiredTemp = ${this.desiredTemperature}>`;
    }
    performAction(action) {
        console.log(`performing action: ${action.description}`);
        if (action.name === 'wake') {
            this.state = this.isAdjusted ? types_1.State.Adjusted : types_1.State.Adjusting;
        }
        else if (action.name === 'sleep') {
            this.state = types_1.State.Sleeping;
        }
        else if (action.name === 'increase-desired') {
            this.desiredTemperature += 1;
            this.state = this.isAdjusted ? types_1.State.Adjusted : types_1.State.Adjusting;
        }
        else if (action.name === 'decrease-desired') {
            this.desiredTemperature -= 1;
            this.state = this.isAdjusted ? types_1.State.Adjusted : types_1.State.Adjusting;
        }
        else if (action.name === 'increase-current') {
            this.currentTemperature += 1;
            this.state = this.isAdjusted ? types_1.State.Adjusted : types_1.State.Adjusting;
        }
        else if (action.name === 'decrease-current') {
            this.currentTemperature -= 1;
            this.state = this.isAdjusted ? types_1.State.Adjusted : types_1.State.Adjusting;
        }
        this.emit('change');
    }
    reset() {
        this.currentTemperature = types_1.STARTING_TEMP;
        this.desiredTemperature = this.currentTemperature;
        this.state = types_1.State.Sleeping;
    }
}
exports.default = Thermostat;
//# sourceMappingURL=Thermostat.js.map