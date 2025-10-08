"use client";

import { EditorContent, useEditor, useEditorState, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useEffect, useState } from 'react'
import FileHandler from '@tiptap/extension-file-handler'
import Image from '@tiptap/extension-image'
import ImageResize from 'tiptap-extension-resize-image';
import Embed from '../tiptap/embed';

import { useAuthApi } from '@/app/hooks/useAuthApi';
import { imagesApi, stancesApi } from '@/api';
import { StanceUpdateRequest } from '@/api/stances';
import { useApi } from '@/app/hooks/useApi';

function MenuBar({ editor }: { editor: Editor }) {
  // Read the current editor's state, and re-render the component when it changes
  const editorState = useEditorState({
    editor,
    selector: ctx => {
      return {
        isBold: ctx.editor.isActive('bold') ?? false,
        canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
        isItalic: ctx.editor.isActive('italic') ?? false,
        canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
        isStrike: ctx.editor.isActive('strike') ?? false,
        canStrike: ctx.editor.can().chain().toggleStrike().run() ?? false,
        isParagraph: ctx.editor.isActive('paragraph') ?? false,
        isHeading1: ctx.editor.isActive('heading', { level: 1 }) ?? false,
        isHeading2: ctx.editor.isActive('heading', { level: 2 }) ?? false,
        isHeading3: ctx.editor.isActive('heading', { level: 3 }) ?? false,
        isHeading4: ctx.editor.isActive('heading', { level: 4 }) ?? false,
        isHeading5: ctx.editor.isActive('heading', { level: 5 }) ?? false,
        isHeading6: ctx.editor.isActive('heading', { level: 6 }) ?? false,
        isBulletList: ctx.editor.isActive('bulletList') ?? false,
        isOrderedList: ctx.editor.isActive('orderedList') ?? false,
        isBlockquote: ctx.editor.isActive('blockquote') ?? false,
        canUndo: ctx.editor.can().chain().undo().run() ?? false,
        canRedo: ctx.editor.can().chain().redo().run() ?? false,
      }
    },
  })

  return (
    <div className="control-group">
      <div className="button-group">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editorState.canBold}
          className={editorState.isBold ? 'is-active' : ''}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editorState.canItalic}
          className={editorState.isItalic ? 'is-active' : ''}
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editorState.canStrike}
          className={editorState.isStrike ? 'is-active' : ''}
          title="Strikethrough"
        >
          <s>S</s>
        </button>
        <button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={editorState.isParagraph ? 'is-active' : ''}
          title="Paragraph"
        >
          ¶
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editorState.isHeading1 ? 'is-active' : ''}
          title="Heading 1"
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editorState.isHeading2 ? 'is-active' : ''}
          title="Heading 2"
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editorState.isHeading3 ? 'is-active' : ''}
          title="Heading 3"
        >
          H3
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          className={editorState.isHeading4 ? 'is-active' : ''}
          title="Heading 4"
        >
          H4
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
          className={editorState.isHeading5 ? 'is-active' : ''}
          title="Heading 5"
        >
          H5
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
          className={editorState.isHeading6 ? 'is-active' : ''}
          title="Heading 6"
        >
          H6
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editorState.isBulletList ? 'is-active' : ''}
          title="Bullet list"
        >
          •
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editorState.isOrderedList ? 'is-active' : ''}
          title="Ordered list"
        >
          1.
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editorState.isBlockquote ? 'is-active' : ''}
          title="Blockquote"
        >
          &quot;
        </button>
        <button onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule">―</button>
        <button onClick={() => editor.chain().focus().setHardBreak().run()} title="Hard break">↵</button>
        <button onClick={() => editor.chain().focus().undo().run()} disabled={!editorState.canUndo} title="Undo">
          ↶
        </button>
        <button onClick={() => editor.chain().focus().redo().run()} disabled={!editorState.canRedo} title="Redo">
          ↷
        </button>
      </div>
    </div>
  )
}

interface StanceEditModalProps {
  open: boolean;
  onClose: () => void;
  stance_id: number;
  original_content_json: string;
  original_headline: string;
}

const StanceEditModal: React.FC<StanceEditModalProps> = ({ open, onClose, stance_id, original_content_json, original_headline }) => {
  const api = useAuthApi();
  const [headline, setHeadline] = useState(original_headline || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extensions = [
    StarterKit,
    Image,
    FileHandler.configure({
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
      onDrop: (currentEditor, files, pos) => {
        files.forEach(file => {
          const fileReader = new FileReader();
          fileReader.readAsDataURL(file);
          fileReader.onload = async () => {
            const padded = await padImageTo16x9(fileReader.result as string);
            currentEditor
              .chain()
              .insertContentAt(pos, {
                type: 'image',
                attrs: {
                  src: padded,
                },
              })
              .focus()
              .run();
          };
        });
      },
      onPaste: (currentEditor, files, htmlContent) => {
        files.forEach(file => {
          if (htmlContent) {
            // if there is htmlContent, stop manual insertion & let other extensions handle insertion via inputRule
            // you could extract the pasted file from this url string and upload it to a server for example
            console.log(htmlContent) // eslint-disable-line no-console
            return false
          }
          const fileReader = new FileReader();
          fileReader.readAsDataURL(file);
          fileReader.onload = async () => {
            const padded = await padImageTo16x9(fileReader.result as string);
            currentEditor
              .chain()
              .insertContentAt(currentEditor.state.selection.anchor, {
                type: 'image',
                attrs: {
                  src: padded,
                },
              })
              .focus()
              .run();
          };
        });
      },
    }),
    Embed
  ];

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const editor = useEditor({
    extensions,
    immediatelyRender: false,
    content: original_content_json ? JSON.parse(original_content_json) : '',
  })

  if (!editor || !open) return null;

  const handleBackdropMouseDown = (e: React.MouseEvent) => {
    // Only close if the mousedown was directly on the backdrop (not a child)
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!headline.trim()) {
      setError('Headline is required');
      return;
    }
    if (!editor) return;
    setLoading(true);
    setError(null);
    try {
      const content_json = JSON.stringify(editor.getJSON());
      const payload: StanceUpdateRequest = {
        headline: headline.trim(),
        content_json: content_json,
      };
      await stancesApi.updateStance(api, stance_id, payload);
      setLoading(false);
      onClose();
    } catch (e: any) {
      setLoading(false);
      setError(e?.message || 'Failed to post');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        className="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4 text-purple-700">Edit Your Stance</h2>
        <input
          type="text"
          className="w-full mb-4 px-3 py-2 border rounded text-lg"
          placeholder="Headline"
          value={headline}
          onChange={e => setHeadline(e.target.value)}
          disabled={loading}
        />
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="tiptap">
          <MenuBar editor={editor} />
          <EditorContent editor={editor} />
        </div>
        <div className="flex justify-end mt-6">
          <button
            className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800 disabled:opacity-50"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper: pad image to 16:9 with transparent background
async function padImageTo16x9(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const aspect = 16 / 9;
      let newW = img.width;
      let newH = img.height;
      if (img.width / img.height > aspect) {
        newH = Math.round(img.width / aspect);
        newW = img.width;
      } else {
        newW = Math.round(img.height * aspect);
        newH = img.height;
      }
      const canvas = document.createElement('canvas');
      canvas.width = newW;
      canvas.height = newH;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, newW, newH);
        ctx.save();
        ctx.globalAlpha = 0;
        ctx.fillRect(0, 0, newW, newH);
        ctx.restore();
        // Center the image
        const x = (newW - img.width) / 2;
        const y = (newH - img.height) / 2;
        ctx.drawImage(img, x, y);
        resolve(canvas.toDataURL());
      } else {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export default StanceEditModal;
