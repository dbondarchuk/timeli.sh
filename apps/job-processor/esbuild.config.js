import { spawn } from "child_process";
import { build as _build, context as _context } from "esbuild";
import { createRequire } from "module";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);

const nextIntlServerPlugin = {
  name: "next-intl-server",
  setup(build) {
    build.onResolve({ filter: /^next-intl\/server$/ }, (args) => {
      // Resolve via the main entry instead of package.json
      const pkgMain = require.resolve("next-intl");
      const pkgDir = dirname(pkgMain);
      const target = join(pkgDir, `server.react-server.js`);

      return { path: target };
    });
  },
};

const buildConfig = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  target: "node21",
  format: "cjs",
  outdir: "dist",
  sourcemap: true,
  logLevel: "info",
  plugins: [nextIntlServerPlugin],
  // Exclude CSS files entirely from the bundle
  loader: {
    ".css": "empty",
    ".scss": "empty",
    ".sass": "empty",
    ".less": "empty",
    ".styl": "empty",
  },
  absWorkingDir: process.cwd(),
  external: [
    "lucide-react/dynamic",
    "next/navigation",
    "next/image",
    "next/link",
    "@resvg/resvg-js",
  ],
  alias: {
    "next-intl/config": "./src/i18n/config.ts",
    "next/headers": "./src/i18n/headers.ts",
  },
};

// Build function
async function build() {
  try {
    await _build(buildConfig);
    console.log("✅ Build completed successfully");
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
}

// Watch function for development
async function watch() {
  try {
    const context = await _context(buildConfig);
    await context.watch();
    console.log("👀 Watching for changes...");
  } catch (error) {
    console.error("❌ Watch failed:", error);
    process.exit(1);
  }
}

// Dev mode: watch + auto-restart
let appProcess = null;

async function dev() {
  try {
    // Initial build
    await _build(buildConfig);
    console.log("✅ Initial build completed");

    // Start the app
    startApp();

    // Watch for changes
    const context = await _context(buildConfig);
    await context.watch();

    console.log("👀 Watching for changes...");
    console.log("🔄 App will restart automatically on changes");
  } catch (error) {
    console.error("❌ Dev mode failed:", error);
    process.exit(1);
  }
}

function startApp() {
  if (appProcess) {
    appProcess.kill();
  }

  appProcess = spawn("node", ["dist/index.js"], {
    stdio: "inherit",
    cwd: process.cwd(),
  });

  appProcess.on("error", (error) => {
    console.error("❌ Failed to start app:", error);
  });

  appProcess.on("exit", (code) => {
    if (code !== 0) {
      console.log(
        `🔄 App exited with code ${code}, will restart on next change`,
      );
    }
  });
}

// Run build, watch, or dev if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.includes("--dev")) {
    dev();
  } else if (args.includes("--watch")) {
    watch();
  } else {
    build();
  }
}

export default { buildConfig, build, watch, dev };
