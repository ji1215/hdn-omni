'use client';

import * as Tabs from '@radix-ui/react-tabs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface DocFile {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface HelpTabsProps {
  docs: DocFile[];
}

export default function HelpTabs({ docs }: HelpTabsProps) {
  if (docs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        문서가 없습니다.
      </div>
    );
  }

  return (
    <Tabs.Root defaultValue={docs[0].id} className="flex flex-col h-[calc(100vh-180px)]">
      <Tabs.List className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar-thin">
        {docs.map((doc) => (
          <Tabs.Trigger
            key={doc.id}
            value={doc.id}
            className={cn(
              'px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors',
              'border-b-2 border-transparent',
              'text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600',
              'data-[state=active]:text-primary data-[state=active]:border-primary',
              'focus:outline-none focus:ring-2 focus:ring-primary/20'
            )}
          >
            {doc.title}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {docs.map((doc) => (
        <Tabs.Content
          key={doc.id}
          value={doc.id}
          className="flex-1 overflow-auto p-6 bg-white dark:bg-gray-800 rounded-b-lg"
        >
          <article className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-code:text-primary prose-code:bg-gray-100 dark:prose-code:bg-gray-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-a:text-primary hover:prose-a:underline">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{doc.content}</ReactMarkdown>
          </article>
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
