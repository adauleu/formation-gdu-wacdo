"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_jest_1 = require("ts-jest");
/** @type {import("jest").Config} **/
exports.default = {
    ...(0, ts_jest_1.createDefaultEsmPreset)(),
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    extensionsToTreatAsEsm: ['.ts'],
};
