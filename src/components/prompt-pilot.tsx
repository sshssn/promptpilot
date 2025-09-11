
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeneratePromptForm } from './generate-prompt-form';
import { ImprovePromptForm } from './improve-prompt-form';
import { PenSquare, Wand2 } from 'lucide-react';

export function PromptPilot() {
  return (
    <div className="flex flex-col items-center lg:items-start">
      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px] bg-primary/10">
          <TabsTrigger value="generate">
            <Wand2 className="mr-2 h-4 w-4" />
            Generate New
          </TabsTrigger>
          <TabsTrigger value="improve">
            <PenSquare className="mr-2 h-4 w-4" />
            Improve Existing
          </TabsTrigger>
        </TabsList>
        <TabsContent value="generate" className="mt-6 p-6 border rounded-lg bg-card">
          <GeneratePromptForm />
        </TabsContent>
        <TabsContent value="improve" className="mt-6 p-6 border rounded-lg bg-card">
          <ImprovePromptForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
