const esbuild = require("esbuild");
const { spawn } = require("child_process");
const path = require("path");

const buildConfig = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  target: "node21",
  format: "cjs",
  outdir: "dist",
  sourcemap: true,
  logLevel: "info",
  // Exclude CSS files entirely from the bundle
  loader: {
    ".css": "empty",
    ".scss": "empty",
    ".sass": "empty",
    ".less": "empty",
    ".styl": "empty",
  },
  absWorkingDir: process.cwd(),
  external: ["lucide-react/dynamic"],
};

// Build function
async function build() {
  try {
    await esbuild.build(buildConfig);
    console.log("✅ Build completed successfully");
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
}

// Watch function for development
async function watch() {
  try {
    const context = await esbuild.context(buildConfig);
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
    await esbuild.build(buildConfig);
    console.log("✅ Initial build completed");

    // Start the app
    startApp();

    // Watch for changes
    const context = await esbuild.context(buildConfig);
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
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes("--dev")) {
    dev();
  } else if (args.includes("--watch")) {
    watch();
  } else {
    build();
  }
}

module.exports = { buildConfig, build, watch, dev };
