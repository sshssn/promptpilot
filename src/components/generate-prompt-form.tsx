
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LoaderCircle, Wand2, BookText } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { generatePromptAction, GeneratePromptInputs } from '@/app/actions';
import { PromptDisplay } from './prompt-display';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  role: z.string().optional(),
  context: z.string().optional(),
  sampleInput: z.string().optional(),
  expectedOutput: z.string().optional(),
  enhanceWithJoblogic: z.boolean().default(false),
});

export function GeneratePromptForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: '',
      context: '',
      sampleInput: '',
      expectedOutput: '',
      enhanceWithJoblogic: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setGeneratedPrompt(null);
    const result = await generatePromptAction(values as GeneratePromptInputs);
    setIsLoading(false);
    
    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    } else if (result.data) {
      setGeneratedPrompt(result.data);
    }
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., An expert copywriter" {...field} />
                  </FormControl>
                  <FormDescription>What role should the AI assume?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="context"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Context</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Writing a marketing email for a new product" {...field} />
                  </FormControl>
                  <FormDescription>What is the situation or background?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="sampleInput"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sample Input / Task</FormLabel>
                <FormControl>
                  <Textarea placeholder="e.g., Product: 'AI-powered shoes'. Features: self-tying, adjusts to foot shape." {...field} rows={4} />
                </FormControl>
                <FormDescription>Provide an example of the input or the task for the AI.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="expectedOutput"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expected Output</FormLabel>
                <FormControl>
                  <Textarea placeholder="e.g., A catchy and persuasive email subject line and body." {...field} rows={4} />
                </FormControl>
                <FormDescription>What should the ideal response look like?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="enhanceWithJoblogic"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-accent/20">
                <div className="space-y-0.5">
                  <FormLabel className="text-base flex items-center gap-2">
                    <BookText className="h-4 w-4" />
                    Enhance with Joblogic Knowledge
                  </FormLabel>
                  <FormDescription>
                    Enrich the prompt with relevant information from the Joblogic knowledge base.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
            {isLoading ? (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Generating...' : 'Generate Prompt'}
          </Button>
        </form>
      </Form>
      {generatedPrompt && (
        <div className="mt-8">
          <h3 className="text-lg font-headline font-semibold mb-2">Generated Prompt</h3>
          <PromptDisplay prompt={generatedPrompt} />
        </div>
      )}
    </div>
  );
}
