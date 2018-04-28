const ws281x = require('rpi-ws281x-native');

export default class Lightstrip {
    private pixelData: Uint32Array;

    constructor(private numLights = 10) {
        console.log(`[Lightstrip] created with ${numLights} lights `)
        this.pixelData = new Uint32Array(this.numLights);
        ws281x.init(this.numLights, {
            // Use BCM Pin 18 (Pin #12, PWM0)
            // See here: https://github.com/jgarff/rpi_ws281x#gpio-usage
            gpioPin: 18,
            brightness: 255,
        });
    }

    public teardown(): void {
        ws281x.reset();
    }

    set pixels(pixels: number[]) {
        for (let i = 0; i < this.numLights; i++) {
            this.pixelData[i] = pixels[i];
        }
        ws281x.render(this.pixelData);
    }
}
