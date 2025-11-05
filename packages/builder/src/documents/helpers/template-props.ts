import { templateSafeWithError } from "@timelish/utils";

const recursiveLoop = (data: any, modifier: (value: string) => string): any => {
  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      recursiveLoop(data[i], modifier);
    }
  } else if (typeof data === "object" && data !== null) {
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        if (typeof data[key] === "string") {
          data[key] = modifier(data[key]);
        } else {
          recursiveLoop(data[key], modifier); // Recursive call for nested objects/arrays
        }
      }
    }
  }
};

export const templateProps = (props: any, args: Record<string, any>) => {
  const newProps = JSON.parse(JSON.stringify(props));
  recursiveLoop(newProps, (value) => templateSafeWithError(value, args, true));

  return newProps;
};
