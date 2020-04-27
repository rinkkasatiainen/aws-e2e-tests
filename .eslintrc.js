module.exports = {
  root: true,
  env: {
    node: true,
    mocha: true
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'prettier:@typescript-eslint',
    'prettier:prettier/recommended'
  ],
  plugins: ['@typescript-eslint'],
  settings: {
    polyfills: [
      'Promise',
      'Object.entries'
    ]
  },
  rules: {
    "no-console": "warn",
    "prettier/prettier": ['error', { semi: false, singleQuote, true, printWidth: 120 }],
    "no-var": "error"
  },
  parserOptions: {
    parser: '@typescript-eslint/parser'
  }
}
