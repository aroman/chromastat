"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const lodash_1 = __importDefault(require("lodash"));
const left_pad_1 = __importDefault(require("left-pad"));
const types_1 = require("./types");
const safe_1 = require("colors/safe");
const ws281x = require('rpi-ws281x-native');
const MAX_BRIGHTNESS = 255;
function pixelColorToString(pixelColor) {
    switch (pixelColor) {
        case types_1.PixelColor.Off: return safe_1.bgBlack(' ');
        case types_1.PixelColor.DarkBlue: return safe_1.bgBlue(' ');
        case types_1.PixelColor.LightBlue: return safe_1.bgCyan(' ');
        case types_1.PixelColor.Green: return safe_1.bgGreen(' ');
        case types_1.PixelColor.Yellow: return safe_1.bgYellow(' ');
        case types_1.PixelColor.Red: return safe_1.bgRed(' ');
    }
}
exports.pixelColorToString = pixelColorToString;
class Lightstrip extends events_1.EventEmitter {
    constructor(numLights = 10) {
        super();
        this.numLights = numLights;
        console.log(`[Lightstrip] created with ${numLights} lights `);
        this.pixelData = new Uint32Array(this.numLights);
        const initialBrightness = 255;
        this._brightness = initialBrightness;
        ws281x.init(this.numLights, {
            // Use BCM Pin 18 (Pin #12, PWM0)
            // See here: https://github.com/jgarff/rpi_ws281x#gpio-usage
            gpioPin: 18,
            brightness: initialBrightness,
        });
    }
    get brightness() {
        return this._brightness;
    }
    set brightness(brightness) {
        this._brightness = Math.max(0, Math.min(brightness, MAX_BRIGHTNESS));
        ws281x.setBrightness(brightness);
        this.render();
    }
    blink(times) {
        const previousPixelData = lodash_1.default.cloneDeep(this.pixelData);
        this.pixels = [];
        lodash_1.default.times(times * 2, i => {
            console.log(i * 750);
            setTimeout(() => {
                if (i % 2 === 0) {
                    this.pixels = [];
                }
                else {
                    this.pixelData = lodash_1.default.cloneDeep(previousPixelData);
                    this.render();
                }
            }, i * 750);
        });
    }
    teardown() {
        ws281x.reset();
    }
    toString() {
        let s = "";
        for (let i = 0; i < this.numLights; i++) {
            s += pixelColorToString(this.pixelData[i]);
        }
        const scaledBrightness = Math.round((this.brightness / MAX_BRIGHTNESS) * 100);
        return `[🔆 ${left_pad_1.default(scaledBrightness, 3)}%] ${s}`;
    }
    setPixelColorAt(index, pixel) {
        if (index < 0 || index >= this.numLights) {
            console.log(`[Lightstrip] index out of bounds: ${index}`);
        }
        this.pixelData[index] = pixel;
        this.render();
    }
    set pixels(pixels) {
        for (let i = 0; i < this.numLights; i++) {
            this.pixelData[i] = i < pixels.length ? pixels[i] : types_1.PixelColor.Off;
        }
        this.render();
    }
    render() {
        if (this.numLights !== this.pixelData.length) {
            console.error('[Lightstrip] malformed pixel data');
        }
        ws281x.render(this.pixelData);
        this.emit('change');
    }
}
exports.default = Lightstrip;
//# sourceMappingURL=Lightstrip.js.map