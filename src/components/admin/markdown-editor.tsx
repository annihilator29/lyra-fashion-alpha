'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Link2,
  Image,
  Code,
} from 'lucide-react';

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  postId?: string; // Optional post ID for unique localStorage key
}

export function MarkdownEditor({
  content,
  onChange,
  placeholder = 'Write your blog post in Markdown...',
  postId,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<string>('editor');

  // Auto-save to localStorage (draft protection)
  useEffect(() => {
    // Use unique key per post to prevent collision
    const draftKey = postId ? `blog-post-draft-${postId}` : 'blog-post-draft-new';
    const timer = setTimeout(() => {
      if (content) {
        localStorage.setItem(draftKey, content);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [content, postId]);

  // Insert markdown helper
  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText =
      content.substring(0, start) +
      before +
      selectedText +
      after +
      content.substring(end);

    onChange(newText);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const toolbar = [
    { icon: Bold, label: 'Bold', action: () => insertMarkdown('**', '**') },
    { icon: Italic, label: 'Italic', action: () => insertMarkdown('*', '*') },
    { icon: Heading1, label: 'H1', action: () => insertMarkdown('# ', '') },
    { icon: Heading2, label: 'H2', action: () => insertMarkdown('## ', '') },
    { icon: List, label: 'List', action: () => insertMarkdown('\n- ', '') },
    {
      icon: ListOrdered,
      label: 'Numbered List',
      action: () => insertMarkdown('\n1. ', ''),
    },
    {
      icon: Link2,
      label: 'Link',
      action: () => insertMarkdown('[', '](url)'),
    },
    {
      icon: Image,
      label: 'Image',
      action: () => insertMarkdown('![alt](', ')'),
    },
    { icon: Code, label: 'Code', action: () => insertMarkdown('`', '`') },
  ];

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between border-b">
          <TabsList>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          {activeTab === 'editor' && (
            <div className="flex items-center gap-1 px-2">
              {toolbar.map((tool, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={tool.action}
                  title={tool.label}
                  className="h-8 w-8 p-0"
                >
                  <tool.icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
          )}
        </div>

        <TabsContent value="editor" className="mt-4">
          <Textarea
            value={content}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
            placeholder={placeholder}
            className="min-h-[500px] font-mono text-sm"
          />
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <div className="min-h-[500px] rounded-md border p-6">
            {content ? (
              <div className="prose prose-stone max-w-none dark:prose-invert">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-muted-foreground">Nothing to preview yet...</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {content.trim().split(/\s+/).filter(Boolean).length} words
        </span>
        <span>Auto-saving to browser storage...</span>
      </div>
    </div>
  );
}
