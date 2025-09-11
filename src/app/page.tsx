import { Logo } from '@/components/logo';
import { PromptPilot } from '@/components/prompt-pilot';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 lg:p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <div className="flex items-start gap-1">
          <div className="text-center w-full lg:text-left">
            <div className="flex items-start">
              <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground tracking-tight">
                PromptPilot
              </h1>
              <div className="-mt-1">
                <Logo />
              </div>
            </div>
            <p className="mt-2 text-lg text-muted-foreground font-body">
              Your AI co-pilot for crafting and refining high-quality prompts.
            </p>
          </div>
        </div>
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
      </div>

      <div className="w-full max-w-5xl">
        <PromptPilot />
      </div>
    </main>
  );
}
