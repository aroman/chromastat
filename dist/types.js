"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Brightness;
(function (Brightness) {
    Brightness[Brightness["OFF"] = 0] = "OFF";
    Brightness[Brightness["LOW"] = 12.75] = "LOW";
    Brightness[Brightness["NORMAL"] = 25.5] = "NORMAL";
    Brightness[Brightness["HIGH"] = 38.25] = "HIGH";
    Brightness[Brightness["MAX"] = 255] = "MAX";
})(Brightness = exports.Brightness || (exports.Brightness = {}));
var State;
(function (State) {
    State["Sleeping"] = "Sleeping";
    State["Awake"] = "Awake";
    State["Adjusting"] = "Adjusting";
})(State = exports.State || (exports.State = {}));
var PixelColor;
(function (PixelColor) {
    PixelColor[PixelColor["Off"] = 0] = "Off";
    PixelColor[PixelColor["Blue"] = 40958] = "Blue";
    PixelColor[PixelColor["White"] = 16777215] = "White";
    PixelColor[PixelColor["Green"] = 65280] = "Green";
    PixelColor[PixelColor["Orange"] = 16752384] = "Orange";
    PixelColor[PixelColor["Yellow"] = 16765700] = "Yellow";
    PixelColor[PixelColor["Red"] = 16711680] = "Red";
})(PixelColor = exports.PixelColor || (exports.PixelColor = {}));
//# sourceMappingURL=types.js.map