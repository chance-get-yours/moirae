/* eslint-disable */
const fs = require("fs");

const config = JSON.parse(fs.readFileSync(`${__dirname}/.swcrc`, "utf-8"));

module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: `moirae${
    process.env.JEST_ROOT_DIR ? "/" + process.env.JEST_ROOT_DIR : ""
  }`,
  testRegex: "\\.*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": ["@swc/jest", { ...config }],
  },
  collectCoverageFrom: ["**/*.(t|j)s"],
  coverageDirectory: "../coverage",
  testEnvironment: "node",
  setupFilesAfterEnv: ["../../jest.setup.js"],
};
