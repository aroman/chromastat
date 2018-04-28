"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const Lightstrip_1 = __importDefault(require("./Lightstrip"));
const lodash_1 = __importDefault(require("lodash"));
const events_1 = require("events");
class Thermostat extends events_1.EventEmitter {
    constructor() {
        super();
        this.minTemperature = 50;
        this.maxTemperature = 90;
        this.animationDelay = 750; // milliseconds
        this.animationPixelOffset = 0;
        const numLights = this.maxTemperature - this.minTemperature;
        this.lightstrip = new Lightstrip_1.default(numLights);
        this.reset();
        this.lightstrip.on('change', () => this.emit('change'));
    }
    get isAdjusted() {
        return this.currentTemperature === this.desiredTemperature;
    }
    toString() {
        return `Thermostat<${this.state}, temp = ${this.currentTemperature}, desiredTemp = ${this.desiredTemperature}>\n${this.lightstrip.toString()}`;
    }
    performAction(action) {
        // console.log(`performing action: ${action.description}`)
        if (action.name === 'reset') {
            this.reset();
            return;
        }
        if (action.name === 'sleep') {
            this.state = types_1.State.Sleeping;
            this.lightstrip.pixels = [];
            this.lightstrip.brightness = types_1.Brightness.OFF;
            return;
        }
        if (action.name !== 'wake' && this.state === types_1.State.Sleeping) {
            console.log('thermostat is sleeping, you need to wake it up first!');
            return;
        }
        if (action.name === 'wake') {
            this.lightstrip.brightness = types_1.Brightness.NORMAL;
        }
        else if (action.name === 'increase-desired') {
            this.desiredTemperature = Math.min(this.maxTemperature, this.desiredTemperature + 1);
        }
        else if (action.name === 'decrease-desired') {
            this.desiredTemperature = Math.max(this.minTemperature, this.desiredTemperature - 1);
        }
        else if (action.name === 'increase-current') {
            this.currentTemperature = Math.min(this.maxTemperature, this.currentTemperature + 1);
        }
        else if (action.name === 'decrease-current') {
            this.currentTemperature = Math.max(this.minTemperature, this.currentTemperature - 1);
        }
        else if (action.name === 'increase-brightness') {
            this.lightstrip.brightness += .01 * types_1.Brightness.MAX;
        }
        else if (action.name === 'decrease-brightness') {
            this.lightstrip.brightness -= .01 * types_1.Brightness.MAX;
        }
        else if (action.name === 'dim') {
            this.lightstrip.brightness = types_1.Brightness.LOW;
        }
        else if (action.name === 'confirm') {
            this.lightstrip.brightness = types_1.Brightness.LOW;
            setTimeout(() => {
                this.lightstrip.brightness = types_1.Brightness.NORMAL;
            }, 500);
            setTimeout(() => {
                this.lightstrip.brightness = types_1.Brightness.LOW;
            }, 1000);
            setTimeout(() => {
                this.lightstrip.brightness = types_1.Brightness.NORMAL;
            }, 1500);
        }
        this.state = this.isAdjusted ? types_1.State.Adjusted : types_1.State.Adjusting;
        this.drawAllColorPixels();
    }
    animationFrame() {
        // Don't animate if sleeping
        if (this.state === types_1.State.Sleeping) {
            return;
        }
        // Delta = how many degrees we are away from the desired temperature
        // e.g: current = 70, desired = 73 -> delta = 3
        // e.g: current = 80, desired = 75 -> delta = -5
        const delta = this.desiredTemperature - this.currentTemperature;
        // If we're already at the desired temperature, nothing to animate
        if (delta === 0)
            return;
        this.animationPixelOffset += 1;
        this.animationPixelOffset %= delta;
        this.drawAllColorPixels();
        lodash_1.default.times(this.animationPixelOffset + 1, offset => {
            const indexToAnimate = this.currentTemperature + Math.sign(delta) * offset - this.minTemperature;
            this.lightstrip.setPixelColorAt(indexToAnimate, delta < 0 ? types_1.PixelColor.Off : this.chartColorForIndex(indexToAnimate));
            console.log(`delta: ${delta}, indexToAnimate: ${indexToAnimate}`);
        });
    }
    chartColorForIndex(index) {
        // if (index + this.minTemperature === this.desiredTemperature) {
        //     return PixelColor.Green
        // }
        if (index < this.lightstrip.numLights * 1 / 4) {
            return types_1.PixelColor.Blue;
        }
        else if (index < this.lightstrip.numLights * 2 / 4) {
            return types_1.PixelColor.Yellow;
        }
        else if (index < this.lightstrip.numLights * 3 / 4) {
            return types_1.PixelColor.Orange;
        }
        else if (index < this.lightstrip.numLights) {
            return types_1.PixelColor.Red;
        }
    }
    drawAllColorPixels() {
        this.lightstrip.pixels = lodash_1.default.times(this.lightstrip.numLights, index => {
            const indexIsAboveCurrentTemperature = index + this.minTemperature > this.currentTemperature;
            // const indexIsAboveDesiredTemperature = index + this.minTemperature > this.desiredTemperature
            if (indexIsAboveCurrentTemperature) {
                return types_1.PixelColor.Off;
            }
            else {
                return this.chartColorForIndex(index);
            }
        });
    }
    reset() {
        this.currentTemperature = this.minTemperature + (this.maxTemperature - this.minTemperature) / 2;
        // this.currentTemperature = this.maxTemperature;
        this.desiredTemperature = this.currentTemperature;
        this.state = types_1.State.Sleeping;
        this.lightstrip.pixels = [];
        this.lightstrip.brightness = 0;
        clearTimeout(this.animationTimer);
        this.animationTimer = setInterval(this.animationFrame.bind(this), this.animationDelay);
        this.emit('change');
    }
}
exports.default = Thermostat;
//# sourceMappingURL=Thermostat.js.map