'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Search, 
  Copy, 
  Check, 
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  category: string;
}

interface PromptTemplatesSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onSelectTemplate: (template: PromptTemplate) => void;
  promptData: Record<string, string>;
}

export function PromptTemplatesSidebar({ 
  isOpen, 
  onToggle, 
  onSelectTemplate, 
  promptData 
}: PromptTemplatesSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  // Convert promptData to template format
  const templates: PromptTemplate[] = Object.entries(promptData).map(([key, content]) => ({
    id: key,
    name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    description: content.split('\n')[0].substring(0, 100) + '...',
    content,
    category: 'Joblogic'
  }));

  // Filter templates based on search
  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyTemplate = async (template: PromptTemplate) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(template.content);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = template.content;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedId(template.id);
      toast({
        title: "Copied!",
        description: "Template copied to clipboard.",
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      toast({
        title: "Error",
        description: "Failed to copy template to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleSelectTemplate = (template: PromptTemplate) => {
    onSelectTemplate(template);
    onToggle(); // Auto dismiss the popup
    toast({
      title: "Template Selected",
      description: "Template has been loaded for editing.",
    });
  };

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={onToggle}
        className={`fixed left-4 top-1/2 -translate-y-1/2 z-50 h-12 w-12 p-0 rounded-full shadow-lg ${
          isOpen ? 'left-80' : 'left-4'
        } transition-all duration-300`}
      >
        {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-80 bg-background border-r border-border/50 transform transition-transform duration-300 z-40 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Prompt Templates</h2>
              </div>
              <Button
                onClick={onToggle}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Templates List */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {filteredTemplates.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No templates found</h3>
                    <p className="text-muted-foreground text-center text-sm">
                      {searchQuery ? 'No templates match your search.' : 'No templates available.'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredTemplates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm font-medium break-words leading-tight mb-1">
                            {template.name}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {template.description}
                          </p>
                          <Badge variant="secondary" className="text-xs mt-2">
                            {template.category}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSelectTemplate(template)}
                          className="flex-1 h-8 text-xs"
                        >
                          Use Template
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyTemplate(template)}
                          className="h-8 w-8 p-0"
                        >
                          {copiedId === template.id ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          onClick={onToggle}
        />
      )}
    </>
  );
}
