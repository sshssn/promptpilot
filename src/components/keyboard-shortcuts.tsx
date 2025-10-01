'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function KeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CTRL+ALT+P - Navigate to playground (avoiding Shift+Enter conflicts)
      if (e.ctrlKey && e.altKey && e.key === 'p') {
        e.preventDefault();
        router.push('/playground');
      }
      // CTRL+ALT+C - Navigate to compare
      if (e.ctrlKey && e.altKey && e.key === 'c') {
        e.preventDefault();
        router.push('/compare');
      }
      // CTRL+ALT+H - Navigate to home
      if (e.ctrlKey && e.altKey && e.key === 'h') {
        e.preventDefault();
        router.push('/');
      }
      // CTRL+ALT+M - Open model testing (if on playground)
      if (e.ctrlKey && e.altKey && e.key === 'm') {
        e.preventDefault();
        if (window.location.pathname === '/playground') {
          // Trigger model test interface
          const event = new CustomEvent('openModelTest');
          window.dispatchEvent(event);
        } else {
          router.push('/playground');
        }
      }
      // CTRL+ALT+N - New chat (if on playground)
      if (e.ctrlKey && e.altKey && e.key === 'n') {
        e.preventDefault();
        if (window.location.pathname === '/playground') {
          // Trigger new chat
          const event = new CustomEvent('newChat');
          window.dispatchEvent(event);
        } else {
          router.push('/playground');
        }
      }
      // CTRL+ALT+B - Back page
      if (e.ctrlKey && e.altKey && e.key === 'b') {
        e.preventDefault();
        router.back();
      }
      // CTRL+ALT+T - Toggle stress test (if on playground)
      if (e.ctrlKey && e.altKey && e.key === 't') {
        e.preventDefault();
        if (window.location.pathname === '/playground') {
          // Trigger stress test interface
          const event = new CustomEvent('openStressTest');
          window.dispatchEvent(event);
        }
      }
      // CTRL+ALT+S - Toggle settings (if on playground)
      if (e.ctrlKey && e.altKey && e.key === 's') {
        e.preventDefault();
        if (window.location.pathname === '/playground') {
          // Trigger settings
          const event = new CustomEvent('openSettings');
          window.dispatchEvent(event);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return null; // This component doesn't render anything
}
