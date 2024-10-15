"use client";

import React from "react";
import MDEditor, { type ContextStore } from "@uiw/react-md-editor";
import type { ChangeEvent } from "react";
import rehypeSanitize from "rehype-sanitize";

type Props = {
  value: string;
  setValue: (
    value?: string | undefined,
    event?: ChangeEvent<HTMLTextAreaElement> | undefined,
    state?: ContextStore | undefined,
  ) => void;
};

function ReactMdEditor({ setValue, value }: Props) {
  return (
    <div data-color-mode="light">
      <MDEditor
        value={value}
        onChange={setValue}
        preview="edit"
        previewOptions={{
          rehypePlugins: [[rehypeSanitize]],
        }}
      />
    </div>
  );
}

export default ReactMdEditor;
