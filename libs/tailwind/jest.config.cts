module.exports = {
  displayName: 'tailwind',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  // The preset barrels also export Angular icon providers, which a node-environment suite can't
  // load. This package only ever needs the preset objects themselves -- it has no Angular
  // dependency and shouldn't gain one just to be tested.
  moduleNameMapper: {
    '^@semiui/presets-semi$': '<rootDir>/../presets/semi/src/lib/semi.ts',
    '^@semiui/presets-carbon$': '<rootDir>/../presets/carbon/src/lib/carbon.ts',
  },
  coverageDirectory: '../../coverage/libs/tailwind',
};
