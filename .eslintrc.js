module.exports = {
  parserOptions: { project: "./tsconfig.json" },
  extends: ["@sondr3/typescript"],
  rules: {
    "unicorn/filename-case": "off",
  },
};
