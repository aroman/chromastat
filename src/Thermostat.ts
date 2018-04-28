import { State, Action, PixelColor, MAX_BRIGHTNESS } from './types';
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

    private animationTimer: number
    private readonly animationDelay = 750 // milliseconds

    private animationPixelOffset = 0

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
        // console.log(`performing action: ${action.description}`)

        if (action.name === 'reset') {
            this.reset()
            return
        }

        if (action.name === 'sleep') {
            this.state = State.Sleeping;
            this.lightstrip.pixels = [];
            this.lightstrip.brightness = 0
            return
        }

        if (action.name !== 'wake' && this.state === State.Sleeping) {
            console.log('thermostat is sleeping, you need to wake it up first!')
            return
        }

        if (action.name === 'wake') {
            this.lightstrip.brightness = 255
        }
        else if (action.name === 'increase-desired') {
            this.desiredTemperature = Math.min(this.maxTemperature, this.desiredTemperature + 1);
        } else if (action.name === 'decrease-desired') {
            this.desiredTemperature = Math.max(this.minTemperature, this.desiredTemperature - 1);
        } else if (action.name === 'increase-current') {
            this.currentTemperature = Math.min(this.maxTemperature, this.currentTemperature + 1);
        } else if (action.name === 'decrease-current') {
            this.currentTemperature = Math.max(this.minTemperature, this.currentTemperature - 1);

        } else if (action.name === 'increase-brightness') {
            this.lightstrip.brightness += .01 * MAX_BRIGHTNESS
        } else if (action.name === 'decrease-brightness') {
            this.lightstrip.brightness -= .01 * MAX_BRIGHTNESS
        } else if (action.name === 'dim') {
            this.lightstrip.brightness = .3 * MAX_BRIGHTNESS
        } else if (action.name === 'confirm') {
            this.lightstrip.blink(3)
        }

        this.state = this.isAdjusted ? State.Adjusted : State.Adjusting;

        this.drawAllColorPixels()
    }

    private animationFrame() {
        // Don't animate if sleeping
        if (this.state === State.Sleeping) {
            return;
        }
        // Delta = how many degrees we are away from the desired temperature
        // e.g: current = 70, desired = 73 -> delta = 3
        // e.g: current = 80, desired = 75 -> delta = -5
        const delta = this.desiredTemperature - this.currentTemperature

        // If we're already at the desired temperature, nothing to animate
        if (delta === 0) return

        this.animationPixelOffset += 1
        this.animationPixelOffset %= delta

        this.drawAllColorPixels()

        _.times(this.animationPixelOffset + 1, offset => {
            const indexToAnimate = this.currentTemperature + Math.sign(delta) * offset - this.minTemperature
            this.lightstrip.setPixelColorAt(indexToAnimate, PixelColor.Green)
        })
    }

    private chartColorForIndex(index: number): PixelColor {
        if (index + this.minTemperature === this.desiredTemperature) {
            return PixelColor.Green
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
    }

    private drawAllColorPixels(): void {
        this.lightstrip.pixels = _.times(this.lightstrip.numLights, index => {
            const indexIsAboveCurrentTemperature = index + this.minTemperature > this.currentTemperature
            const indexIsDesiredTemperature = index + this.minTemperature === this.desiredTemperature
            if (indexIsAboveCurrentTemperature && !indexIsDesiredTemperature) {
                return PixelColor.Off
            } else {
                return this.chartColorForIndex(index)
            }
        })
    }

    private reset() {
        this.currentTemperature = this.minTemperature + (this.maxTemperature - this.minTemperature) / 2;
        this.desiredTemperature = this.currentTemperature;
        this.state = State.Sleeping;
        clearTimeout(this.animationTimer)
        this.animationTimer = setInterval(this.animationFrame.bind(this), this.animationDelay)
        this.emit('change')
    }

}