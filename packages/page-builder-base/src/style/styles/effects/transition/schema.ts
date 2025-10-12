import { z } from "zod";

// Predefined transition options
export const transitionKeys = [
  "none",
  "all 0.2s ease",
  "all 0.3s ease",
  "all 0.5s ease",
  "all 0.2s ease-in",
  "all 0.2s ease-out",
  "all 0.2s ease-in-out",
  "opacity 0.2s ease",
  "transform 0.2s ease",
  "background-color 0.2s ease",
  "color 0.2s ease",
  "border-color 0.2s ease",
  "filter 0.2s ease",
  "filter 0.5s ease",
  "custom",
] as const;

export const transitionKeyMap = {
  none: "none",
  "all 0.2s ease": "all_0_2s_ease",
  "all 0.3s ease": "all_0_3s_ease",
  "all 0.5s ease": "all_0_5s_ease",
  "all 0.2s ease-in": "all_0_2s_ease_in",
  "all 0.2s ease-out": "all_0_2s_ease_out",
  "all 0.2s ease-in-out": "all_0_2s_ease_in_out",
  "opacity 0.2s ease": "opacity_0_2s_ease",
  "transform 0.2s ease": "transform_0_2s_ease",
  "background-color 0.2s ease": "background_color_0_2s_ease",
  "color 0.2s ease": "color_0_2s_ease",
  "border-color 0.2s ease": "border_color_0_2s_ease",
  "filter 0.2s ease": "filter_0_2s_ease",
  "filter 0.5s ease": "filter_0_5s_ease",
  custom: "custom",
} as const;

// Transition property options (for custom mode)
export const transitionPropertyKeys = [
  "all",
  "none",
  "opacity",
  "transform",
  "background-color",
  "color",
  "border-color",
  "filter",
  "width",
  "height",
  "padding",
  "margin",
  "border-width",
  "border-radius",
  "box-shadow",
  "font-size",
  "font-weight",
  "letter-spacing",
  "line-height",
  "inset",
] as const;

export const transitionPropertyKeyMap = {
  all: "all",
  none: "none",
  opacity: "opacity",
  transform: "transform",
  "background-color": "background_color",
  color: "color",
  "border-color": "border_color",
  filter: "filter",
  width: "width",
  height: "height",
  padding: "padding",
  margin: "margin",
  "border-width": "border_width",
  "border-radius": "border_radius",
  "box-shadow": "box_shadow",
  "font-size": "font_size",
  "font-weight": "font_weight",
  "letter-spacing": "letter_spacing",
  "line-height": "line_height",
  inset: "inset",
} as const;

// Transition timing function options
export const transitionTimingFunctionKeys = [
  "ease",
  "linear",
  "ease-in",
  "ease-out",
  "ease-in-out",
  "step-start",
  "step-end",
] as const;

export const transitionTimingFunctionKeyMap = {
  ease: "ease",
  linear: "linear",
  "ease-in": "ease_in",
  "ease-out": "ease_out",
  "ease-in-out": "ease_in_out",
  "step-start": "step_start",
  "step-end": "step_end",
} as const;

// Transition duration schema
export const TransitionDurationSchema = z.number().min(0).max(10).step(0.1);

// Combined transition schema
export const TransitionSchema = z.union([
  z.enum(transitionKeys),
  z.object({
    properties: z.array(z.enum(transitionPropertyKeys)),
    duration: TransitionDurationSchema,
    timingFunction: z.enum(transitionTimingFunctionKeys),
  }),
]);

export type TransitionStyleConfiguration = z.infer<typeof TransitionSchema>;
