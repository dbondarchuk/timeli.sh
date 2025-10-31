import * as z from "zod";

export function zColor() {
  return z.string().regex(/^#[0-9a-fA-F]{6}$/);
}

export function zPadding() {
  return z.object({
    top: z.number(),
    bottom: z.number(),
    right: z.number(),
    left: z.number(),
  });
}
