"use client";

import React, { forwardRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { Plate } from "@udecode/plate/react";

import { Value } from "@udecode/plate";
import { Editor, EditorContainer } from "../plate-ui/editor";
import { useCreateEditor } from "./use-create-editor";

export type PlateEditorProps = {
  onChange?: (value: Value) => void;
  value?: Value;
  style?: React.CSSProperties;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  singleLine?: boolean;
  noToolbar?: boolean;
  document?: Document;
  id?: string;
  usesAbsoluteUrl?: boolean;
};

export const PlateEditor = forwardRef<HTMLDivElement, PlateEditorProps>(
  (
    {
      value,
      onChange,
      style,
      className,
      disabled,
      placeholder,
      singleLine,
      noToolbar,
      id,
      document,
      usesAbsoluteUrl,
    },
    ref,
  ) => {
    const editor = useCreateEditor(value, { singleLine, noToolbar });

    React.useEffect(() => {
      editor.tf.focus({ edge: "endEditor" });
    }, [editor]);

    return (
      <DndProvider backend={HTML5Backend} context={document?.defaultView}>
        <Plate editor={editor} onChange={({ value }) => onChange?.(value)}>
          <EditorContainer
            context={document?.defaultView}
            usesAbsoluteUrl={usesAbsoluteUrl}
          >
            <Editor
              ref={ref}
              variant="fullWidth"
              className={className}
              style={style}
              disabled={disabled}
              placeholder={placeholder}
              id={id}
            />
          </EditorContainer>

          {/* <SettingsDialog /> */}
        </Plate>
      </DndProvider>
    );
  },
);
