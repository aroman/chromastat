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
        this.lightstrip.on("render", () => this.emit("render"));
    }
    get state() {
        return this._state;
    }
    set state(state) {
        if (this.state === state) {
            return;
        }
        this._state = state;
        this.resetAnimationTimer();
        this.setLightPixels();
    }
    toString() {
        return `Thermostat<${this.state}, temp = ${this.currentTemperature}, desiredTemp = ${this.desiredTemperature}>\n${this.lightstrip.toString()}`;
    }
    performAction(action) {
        if (action.name === "reset") {
            this.reset();
            return;
        }
        if (action.name === "sleep") {
            this.lightstrip.brightness = 0;
            this.state = types_1.State.Sleeping;
            return;
        }
        if (action.name !== "wake" && this.state === types_1.State.Sleeping) {
            console.log("thermostat is sleeping, you need to wake it up first!");
            return;
        }
        if (action.name === "wake") {
            this.lightstrip.brightness = types_1.Brightness.NORMAL;
            this.state = types_1.State.Awake;
        }
        else if (action.name === "increase-desired") {
            this.desiredTemperature = Math.min(this.maxTemperature, this.desiredTemperature + 1);
            this.state = types_1.State.Adjusting;
        }
        else if (action.name === "decrease-desired") {
            this.desiredTemperature = Math.max(this.minTemperature, this.desiredTemperature - 1);
            this.state = types_1.State.Adjusting;
        }
        else if (action.name === "increase-current") {
            this.currentTemperature = Math.min(this.maxTemperature, this.currentTemperature + 1);
        }
        else if (action.name === "decrease-current") {
            this.currentTemperature = Math.max(this.minTemperature, this.currentTemperature - 1);
        }
        else if (action.name === "increase-brightness") {
            this.lightstrip.brightness += 1;
        }
        else if (action.name === "decrease-brightness") {
            this.lightstrip.brightness -= 1;
        }
        else if (action.name === "dim") {
            this.lightstrip.brightness = types_1.Brightness.LOW;
        }
        else if (action.name === "confirm") {
            this.lightstrip.brightness = types_1.Brightness.LOW;
            setTimeout(() => {
                this.lightstrip.brightness = types_1.Brightness.NORMAL;
            }, 500);
            setTimeout(() => {
                this.lightstrip.brightness = types_1.Brightness.LOW;
            }, 1000);
            setTimeout(() => {
                this.lightstrip.brightness = types_1.Brightness.NORMAL;
                this.state = types_1.State.Awake;
            }, 1500);
        }
        this.setLightPixels();
        this.lightstrip.render();
    }
    adjustingAnimationFrame() {
        // Only animate if we're awake (but not adjusting) and the current temperature
        // is different from the desired temperature
        if (this.state !== types_1.State.Awake &&
            this.currentTemperature !== this.desiredTemperature) {
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
        // Redraw all erased pixels after the animation resets
        if (this.animationPixelOffset === 0) {
            this.setLightPixels();
        }
        lodash_1.default.times(this.animationPixelOffset + 1, offset => {
            const indexToAnimate = this.currentTemperature +
                Math.sign(delta) * offset -
                this.minTemperature;
            // Erase if delta < 0, draw if delta > 0
            this.lightstrip.setPixelColorAt(indexToAnimate, delta < 0 ? types_1.PixelColor.Off : this.chartColorForIndex(indexToAnimate));
            // console.log(`delta: ${delta}, indexToAnimate: ${indexToAnimate}`)
        });
        this.lightstrip.render();
    }
    chartColorForIndex(index) {
        if (index + this.minTemperature === this.currentTemperature &&
            this.state === types_1.State.Adjusting) {
            return types_1.PixelColor.Green;
        }
        else if (index < this.lightstrip.numLights * 1 / 4) {
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
    setLightPixels() {
        const pixels = lodash_1.default.times(this.lightstrip.numLights + 1, index => {
            const indexTemperature = this.minTemperature + index;
            if (this.state === types_1.State.Adjusting) {
                // Increasing towards the desired temperature
                if (this.desiredTemperature > this.currentTemperature) {
                    // Adjustment zone
                    if (indexTemperature > this.currentTemperature &&
                        indexTemperature <= this.desiredTemperature) {
                        return this.chartColorForIndex(index);
                        // Out of range
                    }
                    else if (indexTemperature > this.desiredTemperature) {
                        return types_1.PixelColor.Off;
                    }
                    else {
                        return this.chartColorForIndex(index);
                    }
                    // Decreasing towards the desired temperature
                }
                else if (this.desiredTemperature <= this.currentTemperature) {
                    if (indexTemperature < this.currentTemperature &&
                        indexTemperature >= this.desiredTemperature) {
                        return types_1.PixelColor.Off;
                    }
                    else if (indexTemperature <= this.currentTemperature) {
                        return this.chartColorForIndex(index);
                    }
                    else {
                        return types_1.PixelColor.Off;
                    }
                }
            }
            else if (this.state === types_1.State.Awake) {
                if (indexTemperature <= this.currentTemperature) {
                    return this.chartColorForIndex(index);
                }
                else {
                    return types_1.PixelColor.Off;
                }
            }
            else if (this.state === types_1.State.Sleeping) {
                return types_1.PixelColor.Off;
            }
        });
        this.lightstrip.silentlySetPixels(pixels);
    }
    resetAnimationTimer() {
        clearTimeout(this.animationTimer);
        this.animationTimer = setInterval(this.adjustingAnimationFrame.bind(this), this.animationDelay);
        this.animationPixelOffset = 0;
    }
    reset() {
        this.currentTemperature = 65;
        this.desiredTemperature = this.currentTemperature;
        this.state = types_1.State.Sleeping;
        this.lightstrip.brightness = types_1.Brightness.NORMAL;
        this.resetAnimationTimer();
        this.emit("render");
    }
}
exports.default = Thermostat;
//# sourceMappingURL=Thermostat.js.map