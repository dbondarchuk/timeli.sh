import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import { themes as prismThemes } from "prism-react-renderer";

const config: Config = {
  title: "Timeli.sh Docs",
  tagline: "Timeli.sh: all-in-one appointment booking platform.",
  favicon: "img/favicon.ico",

  url: "https://docs.timelish.com",
  baseUrl: "/",

  onBrokenLinks: "throw",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          path: "docs",
          sidebarPath: "./sidebars.ts",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    /** Default OG / Twitter image; swap for a dedicated 1200×630 graphic when ready. */
    image: "img/logo.png",
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "",
      logo: {
        alt: "Timelish",
        src: "img/navbar-logo.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "docsSidebar",
          position: "left",
          label: "Docs",
        },
        {
          href: "https://timelish.com",
          label: "Website",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Introduction",
              to: "/docs/getting-started/introduction",
            },
            {
              label: "First steps after setup",
              to: "/docs/daily-use/first-steps-after-setup",
            },
            {
              label: "Settings",
              to: "/docs/daily-use/settings",
            },
            {
              label: "Your web address",
              to: "/docs/daily-use/connect-domain",
            },
            {
              label: "Apps",
              to: "/docs/apps/overview",
            },
          ],
        },
        {
          title: "Product",
          items: [
            {
              label: "Timeli.sh",
              href: "https://timeli.sh",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Timelish.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,

  themes: [
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
      {
        // ... Your options.
        // `hashed` is recommended as long-term-cache of index file is possible.
        hashed: true,

        // For Docs using Chinese, it is recomended to set:
        // language: ["en", "zh"],

        // Customize the keyboard shortcut to focus search bar (default is "mod+k"):
        // searchBarShortcutKeymap: "s", // Use 'S' key
        // searchBarShortcutKeymap: "ctrl+shift+f", // Use Ctrl+Shift+F

        // If you're using `noIndex: true`, set `forceIgnoreNoIndex` to enable local index:
        // forceIgnoreNoIndex: true,

        // Enable Ask AI integration:
        // askAi: {
        //   project: "your-project-name",
        //   apiUrl: "https://your-api-url.com/api/stream",
        //   hotkey: "cmd+I", // Optional: keyboard shortcut to trigger Ask AI
        // },
      },
    ],
  ],
};

export default config;
