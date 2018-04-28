import { EventEmitter } from 'events';
import _ from "lodash";
import leftPad from 'left-pad';
import { PixelColor } from "./types";
import { bgBlue, bgCyan, bgGreen, bgYellow, bgRed, bgBlack } from 'colors/safe';

const ws281x = require('rpi-ws281x-native');

const MAX_BRIGHTNESS = 255

export function pixelColorToString(pixelColor: PixelColor) {
    switch (pixelColor) {
        case PixelColor.Off: return bgBlack(' ')
        case PixelColor.DarkBlue: return bgBlue(' ')
        case PixelColor.LightBlue: return bgCyan(' ')
        case PixelColor.Green: return bgGreen(' ')
        case PixelColor.Yellow: return bgYellow(' ')
        case PixelColor.Red: return bgRed(' ')
    }
}

export default class Lightstrip extends EventEmitter {
    private pixelData: Uint32Array
    private _brightness: number

    constructor(public numLights = 10) {
        super()
        console.log(`[Lightstrip] created with ${numLights} lights `)
        this.pixelData = new Uint32Array(this.numLights);
        const initialBrightness = 0
        this._brightness = initialBrightness
        ws281x.init(this.numLights, {
            // Use BCM Pin 18 (Pin #12, PWM0)
            // See here: https://github.com/jgarff/rpi_ws281x#gpio-usage
            gpioPin: 18,
            brightness: initialBrightness,
        });
    }

    public get brightness() {
        return this._brightness
    }

    public set brightness(brightness: number) {
        this._brightness = Math.max(0, Math.min(brightness, MAX_BRIGHTNESS))
        ws281x.setBrightness(brightness)
        this.render()
    }

    public blink(times: number) {
        const previousPixelData = _.cloneDeep(this.pixelData)
        this.pixels = []
        _.times(times * 2, i => {
            console.log(i * 750)
            setTimeout(() => {
                if (i % 2 === 0) {
                    this.pixels = []
                } else {
                    this.pixelData = _.cloneDeep(previousPixelData)
                    this.render()
                }
            }, i * 750)
        })
    }

    public teardown(): void {
        ws281x.reset();
    }

    public toString(): string {
        let s = ""
        for (let i = 0; i < this.numLights; i++) {
            s += pixelColorToString(this.pixelData[i])
        }
        const scaledBrightness = Math.round((this.brightness / MAX_BRIGHTNESS) * 100)
        return `[🔆 ${leftPad(scaledBrightness, 3)}%] ${s}`
    }

    public setPixelColorAt(index: number, pixel: PixelColor) {
        if (index < 0 || index >= this.numLights) {
            console.log(`[Lightstrip] index out of bounds: ${index}`)
        }
        this.pixelData[index] = pixel;
        this.render();
    }

    set pixels(pixels: PixelColor[]) {
        for (let i = 0; i < this.numLights; i++) {
            this.pixelData[i] = i < pixels.length ? pixels[i] : PixelColor.Off;
        }
        this.render();
    }

    private render() {
        if (this.numLights !== this.pixelData.length) {
            console.error('[Lightstrip] malformed pixel data')
        }
        ws281x.render(this.pixelData);
        this.emit('change')
    }
}
