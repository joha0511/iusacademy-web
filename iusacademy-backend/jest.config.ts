import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.(test|spec).ts',
    '**/tests/**/*.(test|spec).ts'
  ],
  verbose: true,
  setupFiles: ['<rootDir>/jest.setup.ts'],
  reporters: [
    'default',
    '<rootDir>/reporters/ius-explainer-reporter.js'
  ]
};

export default config;
