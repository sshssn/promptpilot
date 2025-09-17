'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LoaderCircle, Search, BarChart3, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { evaluatePromptAction, EvaluatePromptInputs } from '@/app/actions';
import { PromptDisplay } from './prompt-display';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from './file-upload';
import { prepareFilesForGemini } from '@/lib/file-utils';
import { useStorage } from '@/contexts/storage-context';
import { PromptData } from '@/lib/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  promptToEvaluate: z.string().nonempty({ message: 'Please provide the prompt to evaluate.' }),
  chatbotType: z.enum(['supportchatbot_conversation_llm', 'supportchatbot_other_agent', 'supportchatbot_howto_agent', 'supportchatbot_complex_agent', 'supportchatbot_condition_agent'], {
    required_error: 'Please select a chatbot type.',
  }),
});

interface EvaluatePromptFormProps {
  onPromptEvaluated?: (originalPrompt: string, correctedPrompt: string, analysis: string, chatbotType: string, files?: File[]) => void;
  onAnalyzeClick?: () => void;
  hasEvaluatedPrompt?: boolean;
  initialData?: Partial<PromptData>;
}

export function EvaluatePromptForm({ 
  onPromptEvaluated, 
  onAnalyzeClick, 
  hasEvaluatedPrompt,
  initialData
}: EvaluatePromptFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<{
    analysis: string;
    suggestedCorrection: string;
    location: string;
    reason: string;
    needsCorrection: boolean;
  } | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const { prompts } = useStorage();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      promptToEvaluate: '',
      chatbotType: 'supportchatbot_condition_agent',
    },
  });

  // Populate form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        promptToEvaluate: initialData.originalPrompt || '',
        chatbotType: 'supportchatbot_condition_agent',
      });
      if (initialData.improvedPrompt) {
        setEvaluationResult({
          analysis: 'Previous evaluation result',
          suggestedCorrection: initialData.improvedPrompt,
          location: 'Multiple sections',
          reason: 'Based on previous analysis',
          needsCorrection: true
        });
      }
    }
  }, [initialData, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setEvaluationResult(null);
    
    try {
      let files = undefined;
      if (uploadedFiles.length > 0) {
        files = await prepareFilesForGemini(uploadedFiles);
      }
      
      const enhancedValues = {
        ...values,
        files
      };
      
      const result = await evaluatePromptAction(enhancedValues as EvaluatePromptInputs);
      
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
      } else if (result.data) {
        setEvaluationResult(result.data);
        
        // Save to local storage
        const promptData: Omit<PromptData, 'id' | 'timestamp'> = {
          originalPrompt: values.promptToEvaluate,
          improvedPrompt: result.data.suggestedCorrection,
          context: result.data.analysis,
          files: uploadedFiles.map(file => ({
            name: file.name,
            mimeType: file.type,
            data: '', // Will be populated by prepareFilesForGemini
            size: file.size
          })),
          type: 'evaluated'
        };
        prompts.savePrompt(promptData);
        
        // Notify parent component about the evaluated prompt
        onPromptEvaluated?.(values.promptToEvaluate, result.data.suggestedCorrection, result.data.analysis, values.chatbotType, uploadedFiles);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to evaluate prompt. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const chatbotTypeLabels = {
    supportchatbot_conversation_llm: 'Conversation LLM',
    supportchatbot_other_agent: 'Other Agent',
    supportchatbot_howto_agent: 'How-To Agent',
    supportchatbot_complex_agent: 'Complex Agent',
    supportchatbot_condition_agent: 'Condition Agent',
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="promptToEvaluate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prompt to Evaluate</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Paste the prompt you want to evaluate and correct..." 
                    {...field} 
                    rows={6} 
                  />
                </FormControl>
                <FormDescription>
                  The prompt that needs to be analyzed for clarity, completeness, and correctness.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="chatbotType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chatbot Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the type of chatbot" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(chatbotTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  The type of chatbot this prompt is intended for affects the evaluation criteria.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Upload Files (Optional)</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload Excel files, PDFs, or images to provide additional context for prompt evaluation.
              </p>
              <FileUpload
                onFilesChange={(files) => setUploadedFiles(files.map(f => f.file))}
                maxFiles={5}
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button type="submit" disabled={isLoading} className="btn-responsive">
              {isLoading ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              {isLoading ? 'Evaluating...' : 'Evaluate & Correct'}
            </Button>
            
            {hasEvaluatedPrompt && onAnalyzeClick && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onAnalyzeClick}
                className="flex-1 sm:flex-none"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Analyze Changes
              </Button>
            )}
          </div>
        </form>
      </Form>
      
      {evaluationResult && (
        <div className="mt-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {evaluationResult.needsCorrection ? (
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                **Joblogic Chatbot Analysis Results**
              </CardTitle>
              <CardDescription>
                {evaluationResult.needsCorrection ? 'Prompt needs improvement for chatbot-specific patterns' : 'Prompt is well-structured for Joblogic chatbot'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">**Analysis**</h4>
                  <p className="text-sm text-muted-foreground">{evaluationResult.analysis}</p>
                </div>
                
                {evaluationResult.needsCorrection && (
                  <>
                    <div>
                      <h4 className="font-medium mb-2">**Location of Changes**</h4>
                      <p className="text-sm text-muted-foreground">{evaluationResult.location}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">**Reason for Changes**</h4>
                      <p className="text-sm text-muted-foreground">{evaluationResult.reason}</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {evaluationResult.needsCorrection && (
            <div>
              <h3 className="text-lg font-headline font-semibold mb-2">**Suggested Corrections**</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800 mb-2">Changes Required (in quotes):</p>
                    <div className="bg-white border border-yellow-300 rounded p-3">
                      <code className="text-sm text-gray-800 whitespace-pre-wrap">{evaluationResult.suggestedCorrection}</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!evaluationResult.needsCorrection && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                No changes needed. The prompt is already well-structured and clear.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}

