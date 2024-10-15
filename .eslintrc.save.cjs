// save時には除外するルールを設定

// [.vscode/settings.json]
// {
//   "editor.codeActionsOnSave": {
//     "source.fixAll.eslint": "explicit"
//   },
//   "eslint.options": {
//     "overrideConfigFile": ".eslintrc.save.cjs"
//   }
// }

/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  extends: ["./.eslintrc.cjs"],
  rules: {
    "unused-imports/no-unused-imports": "off",
  },
};
