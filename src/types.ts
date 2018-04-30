// Normal brightness values
export enum Brightness {
    OFF = 0,
    LOW = 12,
    NORMAL = 25,
    HIGH = 38,
    MAX = 255,
}

// Brightness values suitable for camera recording
// export enum Brightness {
//     OFF = 0,
//     LOW = 3,
//     NORMAL = 5,
//     HIGH = 38,
//     MAX = 255,
// }

export enum State {
    Sleeping = 'Sleeping',
    Awake = 'Awake',
    Adjusting = 'Adjusting',
}

export type Action = {
    keyName: string,
    name: string,
    description: string,
}

export enum PixelColor {
    Off = 0,
    Blue = 0x009ffe,
    White = 0xFFFFFF,
    Green = 0x00FF00,
    Orange = 0xFF9F00,
    Yellow = 0xffd304,
    Red = 0xff0000,
}
