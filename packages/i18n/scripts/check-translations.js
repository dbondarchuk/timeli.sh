#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Configuration
const LOCALES_DIR = path.join(__dirname, "../src/locales");
const APPS_DIR = path.join(__dirname, "../../app-store/src/apps");
const BASE_LOCALE = "en"; // Use English as the base locale to compare against
const CONFIG_FILE = path.join(__dirname, "../.i18n-check.json");

// Load configuration file if it exists
let config = {
  failOnMissing: true,
  failOnExtra: false,
  failOnErrors: true,
  checkApps: true, // New option to enable/disable app translation checking
  ignoreExtraKeys: [],
  ignoreMissingKeys: [],
};

try {
  if (fs.existsSync(CONFIG_FILE)) {
    const configContent = fs.readFileSync(CONFIG_FILE, "utf8");
    config = { ...config, ...JSON.parse(configContent) };
  }
} catch (error) {
  console.warn(
    "Warning: Could not load .i18n-check.json config file:",
    error.message,
  );
}

/**
 * Recursively get all keys from a nested object
 * @param {Object} obj - The object to extract keys from
 * @param {string} prefix - The current key prefix
 * @returns {Set<string>} - Set of all keys
 */
function getAllKeys(obj, prefix = "") {
  const keys = new Set();

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === "object" && !Array.isArray(value)) {
      // Recursively get keys from nested objects
      const nestedKeys = getAllKeys(value, fullKey);
      nestedKeys.forEach((k) => keys.add(k));
    } else {
      keys.add(fullKey);
    }
  }

  return keys;
}

/**
 * Check if a key exists in a nested object
 * @param {Object} obj - The object to check
 * @param {string} keyPath - The dot-separated key path
 * @returns {boolean} - Whether the key exists
 */
function hasKey(obj, keyPath) {
  const keys = keyPath.split(".");
  let current = obj;

  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = current[key];
    } else {
      return false;
    }
  }

  return true;
}

/**
 * Get all locale directories
 * @returns {string[]} - Array of locale codes
 */
function getLocales() {
  if (!fs.existsSync(LOCALES_DIR)) {
    throw new Error(`Locales directory not found: ${LOCALES_DIR}`);
  }

  return fs
    .readdirSync(LOCALES_DIR, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
}

/**
 * Get all translation files for a locale
 * @param {string} locale - The locale code
 * @returns {string[]} - Array of translation file names
 */
function getTranslationFiles(locale) {
  const localeDir = path.join(LOCALES_DIR, locale);
  return fs
    .readdirSync(localeDir)
    .filter((file) => file.endsWith(".json"))
    .sort();
}

/**
 * Load and parse a translation file
 * @param {string} locale - The locale code
 * @param {string} filename - The translation file name
 * @returns {Object} - Parsed JSON content
 */
function loadTranslationFile(locale, filename) {
  const filePath = path.join(LOCALES_DIR, locale, filename);
  try {
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to load ${filePath}: ${error.message}`);
  }
}

/**
 * Get all app directories
 * @returns {string[]} - Array of app names
 */
function getApps() {
  if (!fs.existsSync(APPS_DIR)) {
    throw new Error(`Apps directory not found: ${APPS_DIR}`);
  }

  return fs
    .readdirSync(APPS_DIR, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
}

/**
 * Get all translation files for an app
 * @param {string} appName - The app name
 * @returns {Object} - Object with locale as key and array of files as value
 */
function getAppTranslationFiles(appName) {
  const appDir = path.join(APPS_DIR, appName, "translations");
  const result = {};

  if (!fs.existsSync(appDir)) {
    return result;
  }

  const locales = fs
    .readdirSync(appDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const locale of locales) {
    const localeDir = path.join(appDir, locale);
    result[locale] = fs
      .readdirSync(localeDir)
      .filter((file) => file.endsWith(".json"))
      .sort();
  }

  return result;
}

/**
 * Load and parse an app translation file
 * @param {string} appName - The app name
 * @param {string} locale - The locale code
 * @param {string} filename - The translation file name
 * @returns {Object} - Parsed JSON content
 */
function loadAppTranslationFile(appName, locale, filename) {
  const filePath = path.join(
    APPS_DIR,
    appName,
    "translations",
    locale,
    filename,
  );
  try {
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to load ${filePath}: ${error.message}`);
  }
}

/**
 * Check app translations for missing keys
 * @returns {Object} - Object containing missing app translations report
 */
function checkAppTranslations() {
  const apps = getApps();
  const baseLocale = BASE_LOCALE;
  const locales = getLocales().filter((locale) => locale !== baseLocale);

  const report = {
    missing: {},
    extra: {},
    totalMissing: 0,
    totalExtra: 0,
    errors: [],
  };

  for (const appName of apps) {
    const appTranslationFiles = getAppTranslationFiles(appName);

    // Skip apps that don't have translations
    if (Object.keys(appTranslationFiles).length === 0) {
      continue;
    }

    // Initialize report structure for this app
    report.missing[appName] = {};
    report.extra[appName] = {};

    // Get base locale files
    const baseFiles = appTranslationFiles[baseLocale] || [];

    for (const locale of locales) {
      const localeFiles = appTranslationFiles[locale] || [];

      // Initialize locale structure
      if (!report.missing[appName][locale]) {
        report.missing[appName][locale] = {};
      }
      if (!report.extra[appName][locale]) {
        report.extra[appName][locale] = {};
      }

      // Check each file
      for (const filename of baseFiles) {
        if (!localeFiles.includes(filename)) {
          // File is missing entirely
          report.missing[appName][locale][filename] = ["FILE_MISSING"];
          report.totalMissing++;
          continue;
        }

        try {
          const baseContent = loadAppTranslationFile(
            appName,
            baseLocale,
            filename,
          );
          const localeContent = loadAppTranslationFile(
            appName,
            locale,
            filename,
          );

          const baseKeys = getAllKeys(baseContent);
          const localeKeys = getAllKeys(localeContent);

          // Check for missing keys
          for (const key of baseKeys) {
            if (
              !hasKey(localeContent, key) &&
              !config.ignoreMissingKeys.includes(key)
            ) {
              if (!report.missing[appName][locale][filename]) {
                report.missing[appName][locale][filename] = [];
              }
              report.missing[appName][locale][filename].push(key);
              report.totalMissing++;
            }
          }

          // Check for extra keys
          for (const key of localeKeys) {
            if (
              !hasKey(baseContent, key) &&
              !config.ignoreExtraKeys.includes(key)
            ) {
              if (!report.extra[appName][locale][filename]) {
                report.extra[appName][locale][filename] = [];
              }
              report.extra[appName][locale][filename].push(key);
              report.totalExtra++;
            }
          }
        } catch (error) {
          report.errors.push(
            `Error processing app ${appName}/${locale}/${filename}: ${error.message}`,
          );
        }
      }

      // Check for extra files in locale
      for (const filename of localeFiles) {
        if (!baseFiles.includes(filename)) {
          if (!report.extra[appName][locale][filename]) {
            report.extra[appName][locale][filename] = [];
          }
          report.extra[appName][locale][filename].push("EXTRA_FILE");
          report.totalExtra++;
        }
      }
    }
  }

  return report;
}

/**
 * Check translations for missing keys
 * @returns {Object} - Object containing missing translations report
 */
function checkTranslations() {
  const locales = getLocales();
  const baseLocale = BASE_LOCALE;

  if (!locales.includes(baseLocale)) {
    throw new Error(
      `Base locale '${baseLocale}' not found in locales directory`,
    );
  }

  const report = {
    missing: {},
    extra: {},
    totalMissing: 0,
    totalExtra: 0,
    errors: [],
  };

  // Get all translation files from base locale
  const baseFiles = getTranslationFiles(baseLocale);

  for (const locale of locales) {
    if (locale === baseLocale) continue;

    const localeFiles = getTranslationFiles(locale);
    report.missing[locale] = {};
    report.extra[locale] = {};

    // Check each file
    for (const filename of baseFiles) {
      if (!localeFiles.includes(filename)) {
        // File is missing entirely
        if (!report.missing[locale][filename]) {
          report.missing[locale][filename] = [];
        }
        report.missing[locale][filename].push("FILE_MISSING");
        report.totalMissing++;
        continue;
      }

      try {
        const baseContent = loadTranslationFile(baseLocale, filename);
        const localeContent = loadTranslationFile(locale, filename);

        const baseKeys = getAllKeys(baseContent);
        const localeKeys = getAllKeys(localeContent);

        // Check for missing keys
        for (const key of baseKeys) {
          if (
            !hasKey(localeContent, key) &&
            !config.ignoreMissingKeys.includes(key)
          ) {
            if (!report.missing[locale][filename]) {
              report.missing[locale][filename] = [];
            }
            report.missing[locale][filename].push(key);
            report.totalMissing++;
          }
        }

        // Check for extra keys (optional, but good to know)
        for (const key of localeKeys) {
          if (
            !hasKey(baseContent, key) &&
            !config.ignoreExtraKeys.includes(key)
          ) {
            if (!report.extra[locale][filename]) {
              report.extra[locale][filename] = [];
            }
            report.extra[locale][filename].push(key);
            report.totalExtra++;
          }
        }
      } catch (error) {
        report.errors.push(
          `Error processing ${locale}/${filename}: ${error.message}`,
        );
      }
    }

    // Check for extra files in locale
    for (const filename of localeFiles) {
      if (!baseFiles.includes(filename)) {
        if (!report.extra[locale][filename]) {
          report.extra[locale][filename] = [];
        }
        report.extra[locale][filename].push("EXTRA_FILE");
        report.totalExtra++;
      }
    }
  }

  return report;
}

/**
 * Print the translation check report
 * @param {Object} report - The translation check report
 * @param {Object} appReport - The app translation check report
 */
function printReport(report, appReport = null) {
  console.log("\n🔍 Translation Check Report");
  console.log("=".repeat(50));

  // Print central translations report
  if (report.errors.length > 0) {
    console.log("\n❌ Central Translation Errors:");
    report.errors.forEach((error) => console.log(`  ${error}`));
  }

  if (report.totalMissing > 0) {
    console.log(`\n❌ Missing Central Translations: ${report.totalMissing}`);
    console.log("-".repeat(30));

    for (const [locale, files] of Object.entries(report.missing)) {
      console.log(`\n${locale.toUpperCase()}:`);
      for (const [filename, missingKeys] of Object.entries(files)) {
        console.log(`  ${filename}:`);
        missingKeys.forEach((key) => {
          if (key === "FILE_MISSING") {
            console.log(`    ❌ File missing entirely`);
          } else {
            console.log(`    ❌ Missing key: ${key}`);
          }
        });
      }
    }
  }

  if (report.totalExtra > 0) {
    console.log(`\n⚠️  Extra Central Translations: ${report.totalExtra}`);
    console.log("-".repeat(30));

    for (const [locale, files] of Object.entries(report.extra)) {
      console.log(`\n${locale.toUpperCase()}:`);
      for (const [filename, extraKeys] of Object.entries(files)) {
        console.log(`  ${filename}:`);
        extraKeys.forEach((key) => {
          if (key === "EXTRA_FILE") {
            console.log(`    ⚠️  Extra file`);
          } else {
            console.log(`    ⚠️  Extra key: ${key}`);
          }
        });
      }
    }
  }

  // Print app translations report if available
  if (appReport) {
    if (appReport.errors.length > 0) {
      console.log("\n❌ App Translation Errors:");
      appReport.errors.forEach((error) => console.log(`  ${error}`));
    }

    if (appReport.totalMissing > 0) {
      console.log(`\n❌ Missing App Translations: ${appReport.totalMissing}`);
      console.log("-".repeat(30));

      for (const [appName, locales] of Object.entries(appReport.missing)) {
        console.log(`\n📱 ${appName.toUpperCase()}:`);
        for (const [locale, files] of Object.entries(locales)) {
          console.log(`  ${locale.toUpperCase()}:`);
          for (const [filename, missingKeys] of Object.entries(files)) {
            console.log(`    ${filename}:`);
            missingKeys.forEach((key) => {
              if (key === "FILE_MISSING") {
                console.log(`      ❌ File missing entirely`);
              } else {
                console.log(`      ❌ Missing key: ${key}`);
              }
            });
          }
        }
      }
    }

    if (appReport.totalExtra > 0) {
      console.log(`\n⚠️  Extra App Translations: ${appReport.totalExtra}`);
      console.log("-".repeat(30));

      for (const [appName, locales] of Object.entries(appReport.extra)) {
        console.log(`\n📱 ${appName.toUpperCase()}:`);
        for (const [locale, files] of Object.entries(locales)) {
          console.log(`  ${locale.toUpperCase()}:`);
          for (const [filename, extraKeys] of Object.entries(files)) {
            console.log(`    ${filename}:`);
            extraKeys.forEach((key) => {
              if (key === "EXTRA_FILE") {
                console.log(`      ⚠️  Extra file`);
              } else {
                console.log(`      ⚠️  Extra key: ${key}`);
              }
            });
          }
        }
      }
    }
  }

  const totalMissing =
    report.totalMissing + (appReport ? appReport.totalMissing : 0);
  const totalExtra = report.totalExtra + (appReport ? appReport.totalExtra : 0);
  const totalErrors =
    report.errors.length + (appReport ? appReport.errors.length : 0);

  if (totalMissing === 0 && totalExtra === 0 && totalErrors === 0) {
    console.log("\n✅ All translations are complete and consistent!");
  }

  console.log("\n" + "=".repeat(50));
}

/**
 * Main function
 */
function main() {
  try {
    console.log("🔍 Checking translations...");

    const report = checkTranslations();
    let appReport = null;

    if (config.checkApps) {
      console.log("📱 Checking app translations...");
      appReport = checkAppTranslations();
    }

    printReport(report, appReport);

    // Determine if we should exit with error code based on config
    let shouldFail = false;

    const totalMissing =
      report.totalMissing + (appReport ? appReport.totalMissing : 0);
    const totalExtra =
      report.totalExtra + (appReport ? appReport.totalExtra : 0);
    const totalErrors =
      report.errors.length + (appReport ? appReport.errors.length : 0);

    if (config.failOnMissing && totalMissing > 0) {
      shouldFail = true;
    }

    if (config.failOnExtra && totalExtra > 0) {
      shouldFail = true;
    }

    if (config.failOnErrors && totalErrors > 0) {
      shouldFail = true;
    }

    if (shouldFail) {
      console.log("\n❌ Translation check failed!");
      process.exit(1);
    } else {
      console.log("\n✅ Translation check passed!");
      process.exit(0);
    }
  } catch (error) {
    console.error("❌ Translation check failed with error:", error.message);
    process.exit(1);
  }
}

// Parse command line arguments for configuration overrides
process.argv.slice(2).forEach((arg) => {
  if (arg === "--no-fail-on-extra") {
    config.failOnExtra = false;
  } else if (arg === "--fail-on-extra") {
    config.failOnExtra = true;
  } else if (arg === "--no-fail-on-missing") {
    config.failOnMissing = false;
  } else if (arg === "--fail-on-missing") {
    config.failOnMissing = true;
  } else if (arg === "--skip-apps") {
    config.checkApps = false;
  } else if (arg === "--check-apps") {
    config.checkApps = true;
  } else if (arg === "--help" || arg === "-h") {
    console.log(`
Usage: yarn check-translations [options]

Options:
  --no-fail-on-extra     Don't fail the build if extra translations are found
  --fail-on-extra        Fail the build if extra translations are found
  --no-fail-on-missing   Don't fail the build if missing translations are found
  --fail-on-missing      Fail the build if missing translations are found (default)
  --skip-apps            Skip checking app translations (only check central translations)
  --check-apps           Check app translations (default)
  --help, -h             Show this help message

Examples:
  yarn check-translations                    # Default: check both central and app translations
  yarn check-translations --skip-apps        # Only check central translations
  yarn check-translations --no-fail-on-extra # Don't fail on extra translations
  yarn check-translations --fail-on-extra    # Fail on both missing and extra
`);
    process.exit(0);
  }
});

// Run the script if called directly
if (require.main === module) {
  main();
}

module.exports = { checkTranslations, checkAppTranslations, printReport };
