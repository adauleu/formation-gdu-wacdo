import { createDefaultEsmPreset } from 'ts-jest';


/** @type {import("jest").Config} **/
export default {
  displayName: 'ts-only',
  ...createDefaultEsmPreset(),
};