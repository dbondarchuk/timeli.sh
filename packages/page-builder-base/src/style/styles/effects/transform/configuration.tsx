"use client";

import { useI18n } from "@vivid/i18n";
import { Button, Combobox } from "@vivid/ui";
import { Move, Plus, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { z } from "zod";
import { RawNumberInput } from "../../../../style-inputs/base/raw-number-input";
import {
  TransformSchema,
  TransformStyleConfiguration,
  TransformValue,
  transformFunctionKeyMap,
  transformFunctionKeys,
  transformKeyMap,
  transformKeys,
} from "./schema";

export const TransformConfiguration = ({
  value,
  onChange,
}: {
  value: TransformStyleConfiguration;
  onChange: (value: TransformStyleConfiguration) => void;
}) => {
  const t = useI18n("builder");
  const [isCustom, setIsCustom] = useState(() => {
    return typeof value === "object" && "functions" in value;
  });

  const handleTransformChange = useCallback(
    (transform: string) => {
      if (transform === "custom") {
        setIsCustom(true);
        onChange({
          functions: [
            {
              function: "scale",
              values: [1],
            },
          ],
        });
      } else {
        setIsCustom(false);
        onChange(transform as z.infer<typeof TransformSchema>);
      }
    },
    [setIsCustom, onChange],
  );

  const addTransformFunction = useCallback(() => {
    if (typeof value === "object" && "functions" in value) {
      onChange({
        ...value,
        functions: [
          ...value.functions,
          {
            function: "scale",
            values: [1],
          },
        ],
      });
    }
  }, [value, onChange]);

  const removeTransformFunction = useCallback(
    (index: number) => {
      if (typeof value === "object" && "functions" in value) {
        const newFunctions = value.functions.filter((_, i) => i !== index);
        if (newFunctions.length === 0) {
          onChange("none");
          setIsCustom(false);
        } else {
          onChange({
            ...value,
            functions: newFunctions,
          });
        }
      }
    },
    [value, onChange],
  );

  const updateTransformFunction = useCallback(
    (index: number, func: TransformValue) => {
      if (typeof value === "object" && "functions" in value) {
        const newFunctions = [...value.functions];
        newFunctions[index] = func;
        onChange({
          ...value,
          functions: newFunctions,
        });
      }
    },
    [value, onChange],
  );

  const getFunctionValueCount = (func: string) => {
    switch (func) {
      case "scale":
      case "scaleX":
      case "scaleY":
        return 1;
      case "rotate":
        return 1;
      case "translateX":
      case "translateY":
        return 1;
      case "translate":
        return 2;
      case "skewX":
      case "skewY":
        return 1;
      case "skew":
        return 2;
      default:
        return 1;
    }
  };

  const getFunctionUnits = (func: string) => {
    switch (func) {
      case "scale":
      case "scaleX":
      case "scaleY":
        return "";
      case "rotate":
        return "deg";
      case "translateX":
      case "translateY":
      case "translate":
        return "px";
      case "skewX":
      case "skewY":
      case "skew":
        return "deg";
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Predefined Transforms */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">
          {t("pageBuilder.styles.properties.transform")}
        </label>
        <Combobox
          values={transformKeys.map((transform) => ({
            value: transform,
            label: t(
              `pageBuilder.styles.transform.${transformKeyMap[transform]}`,
            ),
          }))}
          value={
            isCustom ? "custom" : typeof value === "string" ? value : "none"
          }
          onItemSelect={handleTransformChange}
          className="w-full"
          size="sm"
        />
      </div>

      {/* Custom Controls */}
      {isCustom && (
        <div className="flex flex-col gap-3">
          {typeof value === "object" &&
            "functions" in value &&
            value.functions.map((func, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 p-3 border rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">
                    {t("pageBuilder.styles.transform.function", {
                      index: index + 1,
                    })}
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTransformFunction(index)}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                {/* Function Type */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    {t("pageBuilder.styles.transform.functionType")}
                  </label>
                  <Combobox
                    values={transformFunctionKeys.map((funcType) => ({
                      value: funcType,
                      label: t(
                        `pageBuilder.styles.transform.transformFunctions.${transformFunctionKeyMap[funcType]}`,
                      ),
                    }))}
                    value={func.function}
                    onItemSelect={(newFunc) =>
                      updateTransformFunction(index, {
                        function: newFunc as any,
                        values: Array(getFunctionValueCount(newFunc)).fill(0),
                      })
                    }
                    className="w-full"
                    size="sm"
                  />
                </div>

                {/* Function Values */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    {t("pageBuilder.styles.transform.values")}
                  </label>
                  <div className="flex gap-2">
                    {Array(getFunctionValueCount(func.function))
                      .fill(0)
                      .map((_, valueIndex) => (
                        <RawNumberInput
                          key={valueIndex}
                          iconLabel={<Move className="w-4 h-4" />}
                          value={func.values[valueIndex] || 0}
                          setValue={(newValue) => {
                            const newValues = [...func.values];
                            newValues[valueIndex] = newValue;
                            updateTransformFunction(index, {
                              ...func,
                              values: newValues,
                            });
                          }}
                          step={func.function.includes("scale") ? 0.1 : 1}
                          min={func.function.includes("scale") ? 0 : undefined}
                          max={func.function.includes("scale") ? 5 : undefined}
                          options={
                            func.function.includes("scale")
                              ? [0.5, 0.75, 1, 1.25, 1.5, 2]
                              : func.function.includes("rotate") ||
                                  func.function.includes("skew")
                                ? [-180, -90, -45, 0, 45, 90, 180]
                                : [-50, -20, -10, 0, 10, 20, 50]
                          }
                          float={func.function.includes("scale")}
                          nullable={false}
                          suffix={getFunctionUnits(func.function)}
                        />
                      ))}
                  </div>
                </div>
              </div>
            ))}

          {/* Add Function Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={addTransformFunction}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("pageBuilder.styles.transform.addFunction")}
          </Button>
        </div>
      )}
    </div>
  );
};
