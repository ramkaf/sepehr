module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended', // 👈 this line integrates prettier
  ],
  rules: {
    'prettier/prettier': 'error', // 👈 enforce prettier formatting
  },
};
