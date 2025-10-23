import { createDefaultEsmPreset } from 'ts-jest';


/** @type {import("jest").Config} **/
export default {
  ...createDefaultEsmPreset(),
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  extensionsToTreatAsEsm: ['.ts'],
};