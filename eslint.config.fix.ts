import baseConfig from "./eslint.config";

export default [
  ...baseConfig,
  {
    rules: {
      "import-x/order": "warn",
    },
  },
];
