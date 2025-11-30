import fs from 'fs';
import path from 'path';
import HelpTabs from '@/components/help/HelpTabs';

interface DocFile {
  id: string;
  title: string;
  content: string;
  order: number;
}

async function getDocFiles(): Promise<DocFile[]> {
  const docDir = path.join(process.cwd(), 'doc');
  const files = fs.readdirSync(docDir);

  const docs: DocFile[] = [];

  for (const file of files) {
    if (file.endsWith('.md') && file !== '00-INDEX.md') {
      const filePath = path.join(docDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Extract title from first heading or filename
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : file.replace('.md', '');

      // Extract order from filename (e.g., 01-PROJECT-OVERVIEW.md -> 1)
      const orderMatch = file.match(/^(\d+)-/);
      const order = orderMatch ? parseInt(orderMatch[1], 10) : 99;

      docs.push({
        id: file.replace('.md', ''),
        title,
        content,
        order,
      });
    }
  }

  // Sort by order
  return docs.sort((a, b) => a.order - b.order);
}

export default async function HelpPage() {
  const docs = await getDocFiles();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">도움말</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          HDN-OMNI 프로젝트 문서 및 가이드
        </p>
      </div>
      <HelpTabs docs={docs} />
    </div>
  );
}
