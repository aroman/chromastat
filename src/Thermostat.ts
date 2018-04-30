import { State, Action, PixelColor, Brightness } from './types';
import Lightstrip from './Lightstrip';
import _ from 'lodash';
import { EventEmitter } from 'events';

export default class Thermostat extends EventEmitter {
    public readonly minTemperature = 50
    public readonly maxTemperature = 90

    public currentTemperature: number
    public desiredTemperature: number
    private _state: State

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

    get state() {
        return this._state
    }

    set state(state: State) {
        this._state = state
        this.animationPixelOffset = 0
        this.updateLights()
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
            this.state = State.Sleeping
            this.lightstrip.pixels = []
            // this.lightstrip.brightness = Brightness.OFF
            return
        }

        if (action.name !== 'wake' && this.state === State.Sleeping) {
            console.log('thermostat is sleeping, you need to wake it up first!')
            return
        }

        if (action.name === 'wake') {
            // this.lightstrip.brightness = Brightness.NORMAL
            this.state = State.Awake
        }
        else if (action.name === 'increase-desired') {
            this.desiredTemperature = Math.min(this.maxTemperature, this.desiredTemperature + 1);
            this.state = State.Adjusting
        } else if (action.name === 'decrease-desired') {
            this.desiredTemperature = Math.max(this.minTemperature, this.desiredTemperature - 1);
            this.state = State.Adjusting
        } else if (action.name === 'increase-current') {
            this.currentTemperature = Math.min(this.maxTemperature, this.currentTemperature + 1);
        } else if (action.name === 'decrease-current') {
            this.currentTemperature = Math.max(this.minTemperature, this.currentTemperature - 1);
        } else if (action.name === 'increase-brightness') {
            this.lightstrip.brightness += .01 * Brightness.MAX
        } else if (action.name === 'decrease-brightness') {
            this.lightstrip.brightness -= .01 * Brightness.MAX
        } else if (action.name === 'dim') {
            this.lightstrip.brightness = Brightness.LOW
        } else if (action.name === 'confirm') {
            this.lightstrip.brightness = Brightness.LOW
            setTimeout(() => {
                this.lightstrip.brightness = Brightness.NORMAL
            }, 500)
            setTimeout(() => {
                this.lightstrip.brightness = Brightness.LOW
            }, 1000)
            setTimeout(() => {
                this.lightstrip.brightness = Brightness.NORMAL
                this.state = State.Awake
            }, 1500)
        }

        this.updateLights()
    }

    private adjustingAnimationFrame() {
        // Only animate if we're awake (but not adjusting) and the current temperature
        // is different from the desired temperature
        if (this.state !== State.Awake && this.currentTemperature !== this.desiredTemperature) {
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

        // Redraw all erased pixels after the animation resets
        if (this.animationPixelOffset === 0) {
            this.updateLights()
        }

        _.times(this.animationPixelOffset + 1, offset => {
            const indexToAnimate = this.currentTemperature + Math.sign(delta) * offset - this.minTemperature
            // Erase if delta < 0, draw if delta > 0
            this.lightstrip.setPixelColorAt(indexToAnimate, delta < 0 ? PixelColor.Off : this.chartColorForIndex(indexToAnimate))
            // console.log(`delta: ${delta}, indexToAnimate: ${indexToAnimate}`)
        })
    }

    private chartColorForIndex(index: number): PixelColor {
        // if (index + this.minTemperature === this.desiredTemperature) {
        //     return PixelColor.Green
        // }
        if (index < this.lightstrip.numLights * 1 / 4) {
            return PixelColor.Blue;
        }
        else if (index < this.lightstrip.numLights * 2 / 4) {
            return PixelColor.Yellow;
        }
        else if (index < this.lightstrip.numLights * 3 / 4) {
            return PixelColor.Orange;
        }
        else if (index < this.lightstrip.numLights) {
            return PixelColor.Red;
        }
    }

    private updateLights(): void {
        this.lightstrip.pixels = _.times(this.lightstrip.numLights, index => {
            const indexTemperature = this.minTemperature + index

            if (this.state === State.Adjusting) {
                // Increasing towards the desired temperature
                if (this.desiredTemperature > this.currentTemperature) {
                    // Adjustment zone
                    if (indexTemperature > this.currentTemperature && indexTemperature <= this.desiredTemperature) {
                        return PixelColor.Green
                    } else if (indexTemperature > this.desiredTemperature) {
                        return PixelColor.Off
                    } else {
                        return this.chartColorForIndex(index)
                    }
                    // Decreasing towards the desired temperature
                } else if (this.desiredTemperature < this.currentTemperature) {
                    if (indexTemperature < this.currentTemperature && indexTemperature >= this.desiredTemperature) {
                        return PixelColor.Green
                    } else if (indexTemperature < this.desiredTemperature) {
                        return this.chartColorForIndex(index)
                    } else {
                        return PixelColor.Off
                    }
                }
                // Still adjusting, but current == desired
                else {
                    if (indexTemperature <= this.currentTemperature) {
                        return this.chartColorForIndex(index)
                    } else {
                        return PixelColor.Off
                    }
                }
            }

            else if (this.state === State.Awake) {
                if (indexTemperature <= this.currentTemperature) {
                    return this.chartColorForIndex(index)
                } else {
                    return PixelColor.Off
                }

            } else if (this.state === State.Sleeping) {
                return PixelColor.Off
            }
        })
    }

    private reset() {
        this.currentTemperature = this.minTemperature + (this.maxTemperature - this.minTemperature) / 2;
        // this.currentTemperature = this.maxTemperature;
        this.desiredTemperature = this.currentTemperature;
        this.state = State.Sleeping;
        this.lightstrip.pixels = [];
        this.lightstrip.brightness = Brightness.NORMAL
        clearTimeout(this.animationTimer)
        this.animationTimer = setInterval(this.adjustingAnimationFrame.bind(this), this.animationDelay)
        this.emit('change')

    }

}