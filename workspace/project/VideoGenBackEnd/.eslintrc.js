module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    'no-direct-auth': 'off'
  },
  env: {
    node: true,
    es6: true
  },
  overrides: [
    {
      files: ['*.ts'],
      parserOptions: {
        project: ['./tsconfig.json']
      }
    }
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '**/*.test.ts',
    'VideoGenBackEnd-BeforeRefactoring/'
  ]
}; 