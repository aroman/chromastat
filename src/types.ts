export const MIN_TEMP = 60
export const MAX_TEMP = 90
export const STARTING_TEMP = 70

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
