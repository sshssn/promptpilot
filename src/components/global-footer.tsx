'use client';

export function GlobalFooter() {
  return (
    <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm flex-shrink-0">
      <div className="p-3 md:p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center text-center">
            <p className="text-xs text-muted-foreground">
              PromptPilot can make mistakes - please double-check important information
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
