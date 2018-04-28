"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws281x = require('rpi-ws281x-native');
class Lightstrip {
    constructor(numLights = 10) {
        this.numLights = numLights;
        console.log(`[Lightstrip] created with ${numLights} lights `);
        this.pixelData = new Uint32Array(this.numLights);
        ws281x.init(this.numLights, {
            // Use BCM Pin 18 (Pin #12, PWM0)
            // See here: https://github.com/jgarff/rpi_ws281x#gpio-usage
            gpioPin: 18,
            brightness: 255,
        });
    }
    teardown() {
        ws281x.reset();
    }
    set pixels(pixels) {
        for (let i = 0; i < this.numLights; i++) {
            this.pixelData[i] = pixels[i];
        }
        ws281x.render(this.pixelData);
    }
}
exports.default = Lightstrip;
//# sourceMappingURL=Lightstrip.js.map