"use client";

import React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Embed from "@/components/tiptap/embed";

interface StanceContentRendererProps {
  content_json: string | object;
}

const StanceContentRenderer: React.FC<StanceContentRendererProps> = ({ content_json }) => {
  const content = typeof content_json === "string" ? JSON.parse(content_json) : content_json;
  const editor = useEditor({
    extensions: [StarterKit, Image, Embed],
    content,
    editable: false,
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <div className="tiptap">
      <EditorContent editor={editor} />
    </div>
  );
};

export default StanceContentRenderer;
