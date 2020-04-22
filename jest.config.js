module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  moduleFileExtensions: ['js', 'jsx', 'json', 'vue', 'ts', 'tsx'],
  transformIgnorePatterns: ['/node_modules/(?!(ag-grid-vue/))'],
  testMatch: ['<rootDir>/tests/**/*.spec.(ts|tsx)'],
  testURL: 'http://localhost:8080/',
};
