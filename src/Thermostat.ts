import { State, Action, PixelColor } from './types';
import Lightstrip from './Lightstrip';
import _ from 'lodash';
import { EventEmitter } from 'events';

export default class Thermostat extends EventEmitter {
    public readonly minTemperature = 60
    public readonly maxTemperature = 90

    public currentTemperature: number
    public desiredTemperature: number
    public state: State

    public lightstrip: Lightstrip

    constructor() {
        super()
        const numLights = this.maxTemperature - this.minTemperature
        this.lightstrip = new Lightstrip(numLights)
        this.reset();
        this.lightstrip.on('change', () => this.emit('change'))
    }

    get isAdjusted() {
        return this.currentTemperature === this.desiredTemperature;
    }

    public toString(): string {
        return `Thermostat<${this.state}, temp = ${this.currentTemperature}, desiredTemp = ${this.desiredTemperature}>\n${this.lightstrip.toString()}`
    }

    public performAction(action: Action) {
        console.log(`performing action: ${action.description}`)

        if (action.name === 'sleep') {
            this.state = State.Sleeping;
            this.lightstrip.pixels = [];
            return
        }

        if (action.name === 'wake') {
            // pass
        } else if (action.name === 'increase-desired') {
            this.desiredTemperature = Math.min(this.maxTemperature, this.desiredTemperature + 1);
        } else if (action.name === 'decrease-desired') {
            this.desiredTemperature = Math.max(this.minTemperature, this.desiredTemperature - 1);
        } else if (action.name === 'increase-current') {
            this.currentTemperature = Math.min(this.maxTemperature, this.currentTemperature + 1);
        } else if (action.name === 'decrease-current') {
            this.currentTemperature = Math.max(this.minTemperature, this.currentTemperature - 1);
        } else if (action.name === 'reset') {
            this.reset()
        } else if (action.name === 'increase-brightness') {
            this.lightstrip.brightness += 2.55
        } else if (action.name === 'decrease-brightness') {
            this.lightstrip.brightness -= 2.55
        } else if (action.name === 'dim') {
            this.lightstrip.brightness = .3 * 255
        } else if (action.name === 'confirm') {
            this.lightstrip.blink(3)
        }

        this.state = this.isAdjusted ? State.Adjusted : State.Adjusting;

        this.drawActiveState()
    }

    private drawActiveState() {
        this.lightstrip.pixels = _.times(this.lightstrip.numLights, index => {
            if (index + this.minTemperature === this.desiredTemperature) {
                return PixelColor.Green
            }
            else if (index + this.minTemperature > this.currentTemperature) {
                return PixelColor.Off
            }
            else if (index < this.lightstrip.numLights * 1 / 4) {
                return PixelColor.DarkBlue;
            }
            else if (index < this.lightstrip.numLights * 2 / 4) {
                return PixelColor.LightBlue;
            }
            else if (index < this.lightstrip.numLights * 3 / 4) {
                return PixelColor.Yellow;
            }
            else if (index < this.lightstrip.numLights) {
                return PixelColor.Red;
            }
        })
    }

    private reset() {
        this.currentTemperature = this.minTemperature + (this.maxTemperature - this.minTemperature) / 2;
        this.desiredTemperature = this.currentTemperature;
        this.state = State.Sleeping;
    }

}