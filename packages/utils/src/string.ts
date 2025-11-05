import Mustache from "mustache";

export function format(template: string, ...args: any[]) {
  return template?.replace(/{(\d+)}/g, function (match, number) {
    return typeof args[number] != "undefined" ? args[number] : match;
  });
}

export function template(
  template: string,
  args?: Record<string, any>,
  plainText = false,
) {
  const originalEscape = Mustache.escape;

  try {
    if (plainText) Mustache.escape = (val) => val;

    return Mustache.render(template, args);
  } finally {
    Mustache.escape = originalEscape;
  }
}

export function useIsTemplateSafe(
  templateString: string,
  args?: Record<string, any>,
  plainText = false,
) {
  try {
    template(templateString, args, plainText);
    return true;
  } catch (e) {
    return false;
  }
}

export function templateSafeWithError(
  templateString: string,
  args?: Record<string, any>,
  plainText = false,
) {
  try {
    return template(templateString, args, plainText);
  } catch (e) {
    return (e as Error).message;
  }
}

export function escapeRegex(str: string) {
  return str.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, "\\$&");
}

export function maskify(str: string) {
  return str
    .split("")
    .map((c, index) => (index % 2 == 0 ? c : "#"))
    .join("");
}

export function capitalize<T extends string>(s: T) {
  return (s[0].toUpperCase() + s.slice(1)) as Capitalize<typeof s>;
}
