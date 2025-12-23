import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/theme-provider';
import { StorageProvider } from '@/contexts/storage-context';
import { ModelProvider } from '@/contexts/model-context';
import { GlobalFooter } from '@/components/global-footer';
import { KeyboardShortcuts } from '@/components/keyboard-shortcuts';
import { FlowiseWidget } from '@/components/flowise-widget';

export const metadata: Metadata = {
  title: 'PromptPilot - AI Prompt Engineering Platform',
  description: 'Your AI-powered co-pilot for crafting, refining, and testing high-quality prompts. Create, improve, and validate prompts with comprehensive testing tools.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.svg" />
        <link rel="mask-icon" href="/favicon.svg" color="#8B5CF6" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=PT+Sans:wght@400;700&family=Source+Code+Pro&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <StorageProvider>
          <ModelProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <KeyboardShortcuts />
              <Toaster />
              {/* Global Flowise popup widget in bottom-right - DISABLED */}
              {/* <FlowiseWidget /> */}
            </ThemeProvider>
          </ModelProvider>
        </StorageProvider>
      </body>
    </html>
  );
}
