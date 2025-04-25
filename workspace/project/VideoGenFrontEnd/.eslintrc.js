module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
  },
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'import',
    'prettier'
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'prettier'
  ],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
  rules: {
    // React Rules
    'react/react-in-jsx-scope': 'off', // Not needed in React 17+
    'react/prop-types': 'off', // We use TypeScript instead
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // TypeScript Rules
    '@typescript-eslint/explicit-function-return-type': 'off', // Too strict for React components
    '@typescript-eslint/no-explicit-any': 'error', // Prevent any type
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/no-floating-promises': 'error', // Catch unhandled promises
    '@typescript-eslint/await-thenable': 'error', // Ensure await is used with Promises
    '@typescript-eslint/no-misused-promises': 'error',

    // Import Rules
    'import/no-unresolved': 'error',
    'import/named': 'error',
    'import/default': 'error',
    'import/namespace': 'error',
    'import/order': ['error', {
      'groups': [
        'builtin',
        'external',
        'internal',
        ['parent', 'sibling'],
        'index',
      ],
      'newlines-between': 'always',
      'alphabetize': {
        'order': 'asc',
        'caseInsensitive': true
      }
    }],

    // General Rules
    'no-console': ['warn', { allow: ['warn', 'error'] }], // No console.log in production
    'no-debugger': 'error',
    'no-alert': 'error',
    'eqeqeq': ['error', 'always'], // Require === and !==
    
    // Deployment-related Rules
    'no-process-exit': 'error', // Prevent unexpected process exits
    'no-process-env': 'off', // Allow process.env access but with caution
    'require-atomic-updates': 'error', // Prevent race conditions
    
    // Configuration Validation Rules
    '@typescript-eslint/no-unsafe-member-access': 'error', // Catch unsafe property access
    '@typescript-eslint/no-unsafe-assignment': 'error', // Catch unsafe assignments
    '@typescript-eslint/no-unsafe-call': 'error', // Catch unsafe function calls
    '@typescript-eslint/no-unsafe-return': 'error', // Catch unsafe returns
  },
  overrides: [
    {
      // Special rules for configuration files
      files: ['*.config.ts', '*.config.js', 'vite.config.*'],
      rules: {
        'no-process-env': 'off', // Allow process.env in config files
        '@typescript-eslint/no-unsafe-member-access': 'warn', // Downgrade to warning for config files
        '@typescript-eslint/no-unsafe-assignment': 'warn', // Downgrade to warning for config files
        '@typescript-eslint/no-var-requires': 'off', // Allow requires in config files
        'import/no-extraneous-dependencies': 'off', // Allow dev dependencies in config files
      }
    }
  ]
}; 