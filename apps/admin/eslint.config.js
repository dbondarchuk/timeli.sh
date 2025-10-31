const nextConfig = require("eslint-config-next");
const config = require("@vivid/eslint-config");

module.exports = [...nextConfig, ...config];
