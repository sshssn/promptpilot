import { Logo } from '@/components/logo';
import { PromptPilot } from '@/components/prompt-pilot';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 lg:p-24">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-5xl">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <div className="flex items-baseline justify-center lg:justify-start">
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground tracking-tight">
              PromptPilot
            </h1>
            <div className="-ml-1 -mt-8">
              <Logo />
            </div>
          </div>
          <p className="mt-2 text-lg text-muted-foreground font-body">
            Your AI co-pilot for crafting and refining high-quality prompts.
          </p>
        </div>
      </div>

      <div className="w-full max-w-5xl mt-8">
        <PromptPilot />
      </div>
    </main>
  );
}
