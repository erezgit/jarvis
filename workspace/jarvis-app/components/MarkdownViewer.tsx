"use client";

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

interface MarkdownViewerProps {
  filePath: string;
}

interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

export function MarkdownViewer({ filePath }: MarkdownViewerProps) {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      if (!filePath) return;
      
      setIsLoading(true);
      try {
        // Ensure we have the proper normalized path format
        let normalizedPath = filePath;
        
        // Remove leading slash if present
        if (normalizedPath.startsWith('/')) {
          normalizedPath = normalizedPath.substring(1);
        }
        
        // Ensure the Jarvis prefix is always present
        if (!normalizedPath.startsWith('Jarvis/')) {
          normalizedPath = `Jarvis/${normalizedPath}`;
        }
        
        console.log('Fetching file with path:', normalizedPath);
        
        // Create API path to fetch file content
        const response = await fetch(`/api/memory/file?path=${encodeURIComponent(normalizedPath)}`);
        
        if (!response.ok) {
          console.error(`API response error: ${response.status} ${response.statusText}`);
          
          // If the regular path didn't work, try some alternative paths
          if (response.status === 404) {
            const alternativePaths = [
              // Try without Jarvis prefix (API might be adding it internally)
              normalizedPath.replace('Jarvis/', ''),
              // Try with shorter paths
              `knowledge/procedural_memory/workflows/${normalizedPath.split('/').pop()}`,
              `knowledge/semantic_memory/concepts/${normalizedPath.split('/').pop()}`
            ];
            
            for (const altPath of alternativePaths) {
              console.log('Attempting alternative path:', altPath);
              const altResponse = await fetch(`/api/memory/file?path=${encodeURIComponent(altPath)}`);
              if (altResponse.ok) {
                const data = await altResponse.json();
                setContent(data.content);
                setIsLoading(false);
                return;
              }
            }
          }
          
          throw new Error(`Failed to load content: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Clean up any potential YAML frontmatter (--- ... ---)
        let cleanedContent = data.content;
        const frontmatterMatch = cleanedContent.match(/^---\n([\s\S]*?)\n---\n/);
        if (frontmatterMatch) {
          // Extract the frontmatter properties for display
          const frontmatter = frontmatterMatch[1];
          const frontmatterProps = frontmatter.split('\n').map((line: string) => {
            if (line.trim()) {
              return `**${line.split(':')[0].trim()}**: ${line.split(':').slice(1).join(':').trim()}`;
            }
            return '';
          }).filter(Boolean).join('\n\n');
          
          // Replace the YAML frontmatter with properly formatted Markdown
          cleanedContent = cleanedContent.replace(/^---\n([\s\S]*?)\n---\n/, `${frontmatterProps}\n\n`);
        }
        
        // Ensure code blocks are properly formatted
        // Replace indented code blocks with fenced code blocks
        cleanedContent = cleanedContent.replace(/^( {4}|\t)(.+)$/gm, (match: string, indent: string, code: string) => {
          return `\`\`\`\n${code}\n\`\`\``;
        });
        
        setContent(cleanedContent);
      } catch (err) {
        console.error('Error loading markdown content:', err);
        setError(`Failed to load content: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (filePath) {
      fetchContent();
    }
  }, [filePath]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700 p-4 rounded-md text-white">
        <h3 className="text-xl font-semibold mb-2">Error Loading Content</h3>
        <p>{error}</p>
        <p className="mt-2 text-sm">Path attempted: {filePath}</p>
      </div>
    );
  }

  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
          p: ({ node, ...props }) => <p className="my-3" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-6 my-3" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-6 my-3" {...props} />,
          li: ({ node, ...props }) => <li className="my-1" {...props} />,
          blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-blue-500 pl-4 py-1 my-3 italic" {...props} />,
          code({ inline, className, children, ...props }: CodeProps) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                // @ts-ignore - type issue with atomDark, but it works correctly
                style={atomDark}
                language={match[1]}
                PreTag="div"
                className="rounded-md my-4"
                showLineNumbers={true}
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className="bg-gray-800 px-1 py-0.5 rounded text-gray-200" {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
} 