import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { Bold, Italic, List, ListOrdered, Undo, Redo } from 'lucide-react';

interface ResumeEditorProps {
    content: string;
    onUpdate: (content: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null;
    }

    return (
        <div className="flex items-center gap-1 p-2 border-b border-neutral-800 bg-neutral-900/50 sticky top-0 z-10 backdrop-blur-sm">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'bg-[#ADFF44]/20 text-[#ADFF44]' : 'text-neutral-400'}
            >
                <Bold className="w-4 h-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'bg-[#ADFF44]/20 text-[#ADFF44]' : 'text-neutral-400'}
            >
                <Italic className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-neutral-800 mx-2" />
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive('bulletList') ? 'bg-[#ADFF44]/20 text-[#ADFF44]' : 'text-neutral-400'}
            >
                <List className="w-4 h-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={editor.isActive('orderedList') ? 'bg-[#ADFF44]/20 text-[#ADFF44]' : 'text-neutral-400'}
            >
                <ListOrdered className="w-4 h-4" />
            </Button>
            <div className="flex-1" />
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
            >
                <Undo className="w-4 h-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
            >
                <Redo className="w-4 h-4" />
            </Button>
        </div>
    );
};

export const ResumeEditor = ({ content, onUpdate }: ResumeEditorProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Your tailored resume will appear here...',
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onUpdate(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[500px]',
            },
        },
    });

    return (
        <div className="border border-neutral-800 rounded-xl overflow-hidden bg-black/50 backdrop-blur-sm shadow-2xl">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
};
