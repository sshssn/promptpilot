'use client';

import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {

  // Clean markdown parser - pure markdown structure, no emojis, no tables
  const parseMarkdown = (text: string) => {
    // Remove emojis and clean up text
    text = text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
    
    // Clean up any remaining emoji-like characters
    text = text.replace(/[^\x00-\x7F]/g, '');
    
    // Convert tables to plain text format
    text = text.replace(/\|(.+)\|\s*\n\|[-\s|]+\|\s*\n((?:\|.+\|\s*\n?)*)/g, (match, header, rows) => {
      const headerCells = header.split('|').map((cell: string) => cell.trim()).filter((cell: string) => cell);
      const rowLines = rows.trim().split('\n').filter((line: string) => line.trim());
      
      let plainText = '\n';
      headerCells.forEach((cell: string, index: number) => {
        const cleanCell = cell.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').replace(/[^\x00-\x7F]/g, '');
        plainText += cleanCell;
        if (index < headerCells.length - 1) plainText += ' | ';
      });
      plainText += '\n';
      
      rowLines.forEach((line: string) => {
        const cells = line.split('|').map((cell: string) => cell.trim()).filter((cell: string) => cell);
        if (cells.length > 0) {
          cells.forEach((cell: string, index: number) => {
            const cleanCell = cell.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').replace(/[^\x00-\x7F]/g, '');
            plainText += cleanCell;
            if (index < cells.length - 1) plainText += ' | ';
          });
          plainText += '\n';
        }
      });
      
      return plainText;
    });

    // Convert CSV-like data to plain text
    text = text.replace(/^([^|\n]+,[^|\n]+(?:\n[^|\n]+,[^|\n]+)*)$/gm, (match) => {
      const lines = match.trim().split('\n');
      if (lines.length > 1) {
        const firstLine = lines[0].split(',');
        if (firstLine.length > 1) {
          let plainText = '\n';
          firstLine.forEach((header: string, index: number) => {
            const cleanHeader = header.trim().replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').replace(/[^\x00-\x7F]/g, '');
            plainText += cleanHeader;
            if (index < firstLine.length - 1) plainText += ' | ';
          });
          plainText += '\n';
          
          lines.slice(1).forEach((line: string) => {
            const cells = line.split(',');
            if (cells.length > 1) {
              cells.forEach((cell: string, index: number) => {
                const cleanCell = cell.trim().replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').replace(/[^\x00-\x7F]/g, '');
                plainText += cleanCell;
                if (index < cells.length - 1) plainText += ' | ';
              });
              plainText += '\n';
            }
          });
          return plainText;
        }
      }
      return match;
    });
    
    // Handle code blocks with syntax highlighting
    text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang || 'text';
      return `<pre class="bg-slate-900 text-slate-100 p-4 rounded-lg my-4 overflow-x-auto"><code class="text-sm language-${language}">${code.trim()}</code></pre>`;
    });
    
    // Handle inline code
    text = text.replace(/`([^`]+)`/g, '<code class="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm font-mono border">$1</code>');
    
    // Handle bold text
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900 dark:text-slate-100">$1</strong>');
    
    // Handle italic text
    text = text.replace(/\*(.*?)\*/g, '<em class="italic text-slate-700 dark:text-slate-300">$1</em>');
    
    // Handle strikethrough
    text = text.replace(/~~(.*?)~~/g, '<del class="line-through text-slate-500">$1</del>');
    
    // Handle headers with better styling
    text = text.replace(/^#### (.*$)/gim, '<h4 class="text-base font-semibold mt-4 mb-2 text-slate-800 dark:text-slate-200">$1</h4>');
    text = text.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2 text-slate-800 dark:text-slate-200">$1</h3>');
    text = text.replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-4 mb-3 text-slate-900 dark:text-slate-100">$1</h2>');
    text = text.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-3 text-slate-900 dark:text-slate-100">$1</h1>');
    
    // Handle blockquotes
    text = text.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-slate-300 dark:border-slate-600 pl-4 py-2 my-2 bg-slate-50 dark:bg-slate-800 italic text-slate-700 dark:text-slate-300">$1</blockquote>');
    
    // Handle horizontal rules
    text = text.replace(/^---$/gim, '<hr class="my-4 border-slate-300 dark:border-slate-600" />');
    text = text.replace(/^___$/gim, '<hr class="my-4 border-slate-300 dark:border-slate-600" />');
    text = text.replace(/^\*\*\*$/gim, '<hr class="my-4 border-slate-300 dark:border-slate-600" />');
    
    // Handle lists with better styling
    text = text.replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc text-slate-700 dark:text-slate-300">$1</li>');
    text = text.replace(/^- (.*$)/gim, '<li class="ml-4 list-disc text-slate-700 dark:text-slate-300">$1</li>');
    text = text.replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal text-slate-700 dark:text-slate-300">$1</li>');
    
    // Handle links with better styling
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline font-medium" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Handle images
    text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4 shadow-sm" />');
    
    // Handle line breaks
    text = text.replace(/\n\n/g, '</p><p class="my-2">');
    text = text.replace(/\n/g, '<br />');
    
    // Wrap in paragraph tags
    text = `<p class="my-2">${text}</p>`;
    
    return text;
  };

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert text-slate-800 dark:text-slate-200">
      <div dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }} />
    </div>
  );
}

