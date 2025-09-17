'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  History, 
  Search, 
  Trash2, 
  Copy, 
  ExternalLink,
  Wand2,
  PenSquare,
  BarChart3,
  Clock,
  FileText,
  Star
} from 'lucide-react';
import { useStorage } from '@/contexts/storage-context';
import { PromptData, AnalysisResult } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

interface HistoryTabProps {
  onLoadPrompt?: (promptData: PromptData) => void;
  onLoadAnalysis?: (analysisData: AnalysisResult) => void;
}

export function HistoryTab({ onLoadPrompt, onLoadAnalysis }: HistoryTabProps) {
  const { prompts, analyses, favorites } = useStorage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('prompts');
  const { toast } = useToast();

  // Filter and sort prompts based on search query (latest first)
  const filteredPrompts = prompts.prompts
    .filter(prompt => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        prompt.originalPrompt?.toLowerCase().includes(query) ||
        prompt.improvedPrompt?.toLowerCase().includes(query) ||
        prompt.context?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => b.timestamp - a.timestamp); // Sort by timestamp descending (latest first)

  // Filter and sort analyses based on search query (latest first)
  const filteredAnalyses = analyses.analyses
    .filter(analysis => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        analysis.summary.toLowerCase().includes(query) ||
        analysis.recommendations.some(rec => rec.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => b.timestamp - a.timestamp); // Sort by timestamp descending (latest first)

  // Sort favorites by timestamp (latest first)
  const sortedFavorites = favorites.favoritePrompts
    .sort((a, b) => b.timestamp - a.timestamp);

  const handleLoadPrompt = (promptData: PromptData) => {
    onLoadPrompt?.(promptData);
    toast({
      title: 'Prompt Loaded',
      description: 'The prompt has been loaded into the form.',
    });
  };

  const handleLoadAnalysis = (analysisData: AnalysisResult) => {
    onLoadAnalysis?.(analysisData);
    toast({
      title: 'Analysis Loaded',
      description: 'The analysis has been loaded for review.',
    });
  };

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Prompt copied to clipboard.',
    });
  };

  const handleDeletePrompt = (id: string) => {
    prompts.deletePrompt(id);
    toast({
      title: 'Deleted',
      description: 'Prompt has been deleted from history.',
    });
  };

  const handleToggleFavorite = (id: string) => {
    const wasFavorite = favorites.isFavorite(id);
    favorites.toggleFavorite(id);
    toast({
      title: wasFavorite ? 'Removed from Favorites' : 'Added to Favorites',
      description: wasFavorite ? 'Prompt removed from favorites.' : 'Prompt added to favorites.',
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'generated':
        return <Wand2 className="h-4 w-4 text-blue-600" />;
      case 'improved':
        return <PenSquare className="h-4 w-4 text-green-600" />;
      case 'analyzed':
        return <BarChart3 className="h-4 w-4 text-purple-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'generated':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'improved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'analyzed':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-6 w-6" />
          <h2 className="text-2xl font-bold">History</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="prompts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Prompts ({filteredPrompts.length})
          </TabsTrigger>
          <TabsTrigger value="analyses" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analyses ({filteredAnalyses.length})
          </TabsTrigger>
          <TabsTrigger value="favorites" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Favorites ({sortedFavorites.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prompts" className="mt-6">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredPrompts.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No prompts found</h3>
                    <p className="text-muted-foreground text-center">
                      {searchQuery ? 'No prompts match your search.' : 'Start by generating or improving a prompt.'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredPrompts.map((prompt) => (
                  <Card key={prompt.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(prompt.type)}
                          <CardTitle className="text-lg">
                            {prompt.type === 'generated' ? 'Generated Prompt' : 
                             prompt.type === 'improved' ? 'Improved Prompt' : 'Analyzed Prompt'}
                          </CardTitle>
                          <Badge className={getTypeColor(prompt.type)}>
                            {prompt.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleFavorite(prompt.id)}
                          >
                            <Star className={`h-4 w-4 ${favorites.isFavorite(prompt.id) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLoadPrompt(prompt)}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePrompt(prompt.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {formatDate(prompt.timestamp)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {prompt.context && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">Context</h4>
                          <p className="text-sm">{prompt.context}</p>
                        </div>
                      )}
                      
                      {prompt.originalPrompt && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">Original Prompt</h4>
                          <div className="bg-muted p-3 rounded-lg">
                            <p className="text-sm whitespace-pre-wrap">{prompt.originalPrompt}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2"
                              onClick={() => handleCopyPrompt(prompt.originalPrompt!)}
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </Button>
                          </div>
                        </div>
                      )}

                      {prompt.improvedPrompt && prompt.improvedPrompt !== prompt.originalPrompt && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">Improved Prompt</h4>
                          <div className="bg-muted p-3 rounded-lg">
                            <p className="text-sm whitespace-pre-wrap">{prompt.improvedPrompt}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2"
                              onClick={() => handleCopyPrompt(prompt.improvedPrompt!)}
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </Button>
                          </div>
                        </div>
                      )}

                      {prompt.files && prompt.files.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">Files</h4>
                          <div className="flex flex-wrap gap-2">
                            {prompt.files.map((file, index) => (
                              <Badge key={index} variant="outline">
                                {file.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="analyses" className="mt-6">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredAnalyses.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No analyses found</h3>
                    <p className="text-muted-foreground text-center">
                      {searchQuery ? 'No analyses match your search.' : 'Start by comparing prompts to generate analyses.'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredAnalyses.map((analysis) => (
                  <Card key={analysis.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-purple-600" />
                          <CardTitle className="text-lg">Analysis Result</CardTitle>
                          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                            Analysis
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLoadAnalysis(analysis)}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {formatDate(analysis.timestamp)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-1">Summary</h4>
                        <p className="text-sm">{analysis.summary}</p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{analysis.metrics.clarityScore}/10</div>
                          <div className="text-xs text-muted-foreground">Clarity</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{analysis.metrics.specificityScore}/10</div>
                          <div className="text-xs text-muted-foreground">Specificity</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{analysis.metrics.structureScore}/10</div>
                          <div className="text-xs text-muted-foreground">Structure</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{analysis.metrics.overallScore}/10</div>
                          <div className="text-xs text-muted-foreground">Overall</div>
                        </div>
                      </div>

                      {analysis.recommendations.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">Key Recommendations</h4>
                          <ul className="space-y-1">
                            {analysis.recommendations.slice(0, 3).map((rec, index) => (
                              <li key={index} className="text-sm">• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="favorites" className="mt-6">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {sortedFavorites.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Star className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
                    <p className="text-muted-foreground text-center">
                      Star prompts to add them to your favorites.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                sortedFavorites.map((prompt) => (
                  <Card key={prompt.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(prompt.type)}
                          <CardTitle className="text-lg">
                            {prompt.type === 'generated' ? 'Generated Prompt' : 
                             prompt.type === 'improved' ? 'Improved Prompt' : 'Analyzed Prompt'}
                          </CardTitle>
                          <Badge className={getTypeColor(prompt.type)}>
                            {prompt.type}
                          </Badge>
                          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            Favorite
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLoadPrompt(prompt)}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleFavorite(prompt.id)}
                          >
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {formatDate(prompt.timestamp)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {prompt.context && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">Context</h4>
                          <p className="text-sm">{prompt.context}</p>
                        </div>
                      )}
                      
                      {prompt.improvedPrompt && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">Prompt</h4>
                          <div className="bg-muted p-3 rounded-lg">
                            <p className="text-sm whitespace-pre-wrap">{prompt.improvedPrompt}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2"
                              onClick={() => handleCopyPrompt(prompt.improvedPrompt!)}
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

