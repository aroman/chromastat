export const MAX_BRIGHTNESS = 50 // actual max is 255

export enum State {
    Sleeping = 'Sleeping',
    Adjusted = 'Adjusted',
    Adjusting = 'Adjusting',
}

export type Action = {
    keyName: string,
    name: string,
    description: string,
}

export enum PixelColor {
    Off = 0,
    LightBlue = 0x00FFFF,
    DarkBlue = 0x0000FF,
    White = 0xFFFFFF,
    Green = 0x00FF00,
    Yellow = 0xFFFF00,
    Red = 0xFF0000,
}
