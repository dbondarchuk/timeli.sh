import type { TextMark } from "../lib/rich-text-types";
import { backgroundColorPlugin } from "./backgroundColor/plugin";
import { boldPlugin } from "./bold/plugin";
import { colorPlugin } from "./color/plugin";
import { fontFamilyPlugin } from "./fontFamily/plugin";
import { fontSizePlugin } from "./fontSize/plugin";
import { fontWeightPlugin } from "./fontWeight/plugin";
import { italicPlugin } from "./italic/plugin";
import { letterSpacingPlugin } from "./letterSpacing/plugin";
import { lineHeightPlugin } from "./lineHeight/plugin";
import { strikethroughPlugin } from "./strikethrough/plugin";
import { subscriptPlugin } from "./subscript/plugin";
import { superscriptPlugin } from "./superscript/plugin";
import { textTransformPlugin } from "./textTransform/plugin";
import type { MarkPlugin, PluginRegistry } from "./types";
import { underlinePlugin } from "./underline/plugin";

// Default plugins
const defaultPlugins: MarkPlugin[] = [
  boldPlugin,
  italicPlugin,
  underlinePlugin,
  strikethroughPlugin,
  superscriptPlugin,
  subscriptPlugin,
  colorPlugin,
  backgroundColorPlugin,
  fontSizePlugin,
  fontFamilyPlugin,
  fontWeightPlugin,
  letterSpacingPlugin,
  textTransformPlugin,
  lineHeightPlugin,
];

class PluginRegistryImpl implements PluginRegistry {
  plugins: Map<keyof TextMark, MarkPlugin>;

  constructor() {
    this.plugins = new Map();
    // Register default plugins
    defaultPlugins.forEach((plugin) => this.register(plugin));
  }

  register(plugin: MarkPlugin): void {
    this.plugins.set(plugin.name, plugin);
  }

  get(name: keyof TextMark): MarkPlugin | undefined {
    return this.plugins.get(name);
  }

  getAll(): MarkPlugin[] {
    return Array.from(this.plugins.values());
  }
}

export const pluginRegistry = new PluginRegistryImpl();

// Export all plugins
export {
  backgroundColorPlugin,
  boldPlugin,
  colorPlugin,
  fontFamilyPlugin,
  fontSizePlugin,
  fontWeightPlugin,
  italicPlugin,
  letterSpacingPlugin,
  lineHeightPlugin,
  strikethroughPlugin,
  subscriptPlugin,
  superscriptPlugin,
  textTransformPlugin,
  underlinePlugin,
};

export type { MarkPlugin, PluginRegistry };
