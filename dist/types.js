"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_BRIGHTNESS = 100;
var State;
(function (State) {
    State["Sleeping"] = "Sleeping";
    State["Adjusted"] = "Adjusted";
    State["Adjusting"] = "Adjusting";
})(State = exports.State || (exports.State = {}));
var PixelColor;
(function (PixelColor) {
    PixelColor[PixelColor["Off"] = 0] = "Off";
    PixelColor[PixelColor["LightBlue"] = 65535] = "LightBlue";
    PixelColor[PixelColor["DarkBlue"] = 255] = "DarkBlue";
    PixelColor[PixelColor["White"] = 16777215] = "White";
    PixelColor[PixelColor["Green"] = 65280] = "Green";
    PixelColor[PixelColor["Yellow"] = 16776960] = "Yellow";
    PixelColor[PixelColor["Red"] = 16711680] = "Red";
})(PixelColor = exports.PixelColor || (exports.PixelColor = {}));
//# sourceMappingURL=types.js.map