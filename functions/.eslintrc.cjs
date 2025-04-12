module.exports = {
  parser: "@babel/eslint-parser",
  env: {
    es2021: true,
    node: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
    requireConfigFile: false,
  },
  rules: {
    "indent": ["error", 2],
    "object-curly-spacing": ["error", "never"],
    "quote-props": ["error", "consistent-as-needed"],
    "comma-dangle": ["error", "only-multiline"],
  },
};
