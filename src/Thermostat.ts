import { EventEmitter } from 'events';
import { State, Action, STARTING_TEMP } from './types';

export default class Thermostat extends EventEmitter {
    private currentTemperature: number
    private desiredTemperature: number
    private state: State

    constructor() {
        super();
        this.reset();
    }

    get isAdjusted() {
        return this.currentTemperature === this.desiredTemperature;
    }

    public toString(): string {
        return `Thermostat<${this.state}, temp = ${this.currentTemperature}, desiredTemp = ${this.desiredTemperature}>`
    }

    public performAction(action: Action) {
        console.log(`performing action: ${action.description}`)

        if (action.name === 'wake') {
            this.state = this.isAdjusted ? State.Adjusted : State.Adjusting;
        } else if (action.name === 'sleep') {
            this.state = State.Sleeping;
        } else if (action.name === 'increase-desired') {
            this.desiredTemperature += 1;
            this.state = this.isAdjusted ? State.Adjusted : State.Adjusting;
        } else if (action.name === 'decrease-desired') {
            this.desiredTemperature -= 1;
            this.state = this.isAdjusted ? State.Adjusted : State.Adjusting;
        } else if (action.name === 'increase-current') {
            this.currentTemperature += 1;
            this.state = this.isAdjusted ? State.Adjusted : State.Adjusting;
        } else if (action.name === 'decrease-current') {
            this.currentTemperature -= 1;
            this.state = this.isAdjusted ? State.Adjusted : State.Adjusting;
        }

        this.emit('change')
    }

    private reset() {
        this.currentTemperature = STARTING_TEMP;
        this.desiredTemperature = this.currentTemperature;
        this.state = State.Sleeping;
    }

}