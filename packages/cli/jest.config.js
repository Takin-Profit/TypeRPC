/** @typedef {import('ts-jest')} */
/** @type {import('@jest/types').Config.InitialOptions} */
const { pathsToModuleNameMapper } = require('ts-jest/utils')
// Load the config which holds the path aliases.
const { compilerOptions } = require('./tsconfig.json')

module.exports = {
    preset: 'ts-jest',

    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
        // This has to match the baseUrl defined in tsconfig.json.
        prefix: '<rootDir>/packages',
    }),
}
