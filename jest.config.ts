import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  collectCoverage: true,

  collectCoverageFrom: [
    'app/**/*.ts',
    'validators/**/*.ts',
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