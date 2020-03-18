module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    'vue/no-unused-vars': 'off',
    'vue/valid-v-else-if': 'off',
    'vue/valid-v-if': 'off'
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
