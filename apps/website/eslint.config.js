const nextConfig = require("@next/eslint-plugin-next");
const config = require("@timelish/eslint-config");

module.exports = [nextConfig.flatConfig.recommended, ...config];
