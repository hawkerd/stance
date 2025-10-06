"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { FloatingMenu, BubbleMenu } from '@tiptap/react/menus'
import StarterKit from "@tiptap/starter-kit";

interface StanceCreateModalProps {
  open: boolean;
  onClose: () => void;
}

const StanceCreateModal: React.FC<StanceCreateModalProps> = ({ open, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Hello world!</p>",
    autofocus: true,
    immediatelyRender: false
  });

  if (!editor || !open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4 text-purple-700">Create Your Stance</h2>

        {/* Floating bubble menu for formatting */}
        <BubbleMenu editor={editor}>
          <div className="bg-gray-100 border rounded-md p-2 flex space-x-2">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive("bold") ? "font-bold text-purple-700" : ""}
            >
              B
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive("italic") ? "italic text-purple-700" : ""}
            >
              I
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={editor.isActive("strike") ? "line-through text-purple-700" : ""}
            >
              S
            </button>
          </div>
        </BubbleMenu>

        {/* The editable area */}
        <EditorContent
          editor={editor}
          className="border p-3 rounded-lg min-h-[200px] focus:outline-none"
        />
      </div>
    </div>
  );
};

export default StanceCreateModal;
