import React from "react";

export const useAttributeObserver = <T extends HTMLElement>(
  current: T | null,
  targetAttribute: string,
) => {
  // const [current, setCurrent] = React.useState<T | null>(targetRef?.current || null);

  const [value, setValue] = React.useState<string | null>(
    current?.getAttribute(targetAttribute) || null,
  );

  React.useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === targetAttribute
        ) {
          setValue(
            (mutation.target as HTMLElement).getAttribute(targetAttribute),
          );
        }
      });
    });

    if (current) {
      setValue(current.getAttribute(targetAttribute) || null);
      observer.observe(current, { attributes: true });
    }

    return () => observer.disconnect();
  }, [targetAttribute, current]);

  return value;
};
