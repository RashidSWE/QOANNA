/** @type {import('jest').Config} */
export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],

  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },

  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "./tsconfig.json"
      }
    ]
  },

  moduleFileExtensions: ["ts", "js", "json"],
  roots: ["<rootDir>/src/tests"]
};
