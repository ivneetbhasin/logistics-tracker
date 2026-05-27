import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  collectCoverage: true,

  collectCoverageFrom: [
    'src/app/**/*.ts',
    'src/validators/*.ts',
    '!**/node_modules/**',
  ],

  coverageDirectory: 'coverage',

  coverageReporters: [
    'text',
    'lcov',
    'html',
  ],
}

export default config