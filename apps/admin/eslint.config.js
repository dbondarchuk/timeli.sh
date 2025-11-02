const nextConfig = require("@next/eslint-plugin-next");
const config = require("@vivid/eslint-config");

module.exports = [nextConfig.flatConfig.recommended, ...config];
