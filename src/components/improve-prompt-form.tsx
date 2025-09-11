
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LoaderCircle, Wand2 } from 'lucide-react';
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
import { improvePromptAction, ImprovePromptInputs } from '@/app/actions';
import { PromptDisplay } from './prompt-display';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  existingPrompt: z.string().nonempty({ message: 'Please provide the prompt to improve.' }),
  problemDescription: z.string().nonempty({ message: 'Please describe the problem.' }),
  expectedChanges: z.string().nonempty({ message: 'Please specify the expected changes.' }),
});

export function ImprovePromptForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [improvedPrompt, setImprovedPrompt] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      existingPrompt: '',
      problemDescription: '',
      expectedChanges: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setImprovedPrompt(null);
    const result = await improvePromptAction(values as ImprovePromptInputs);
    setIsLoading(false);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    } else if (result.data) {
      setImprovedPrompt(result.data);
    }
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="existingPrompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Existing Prompt</FormLabel>
                <FormControl>
                  <Textarea placeholder="Paste your existing prompt here..." {...field} rows={6} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="problemDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Problem Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="What's wrong with the current prompt? e.g., 'The output is too generic...'" {...field} rows={4} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="expectedChanges"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expected Changes</FormLabel>
                <FormControl>
                  <Textarea placeholder="What should the improved prompt do differently? e.g., 'It should use a persuasive tone...'" {...field} rows={4} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
            {isLoading ? (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Refining...' : 'Refine Prompt'}
          </Button>
        </form>
      </Form>
      {improvedPrompt && (
        <div className="mt-8">
          <h3 className="text-lg font-headline font-semibold mb-2">Refined Prompt</h3>
          <PromptDisplay prompt={improvedPrompt} />
        </div>
      )}
    </div>
  );
}
