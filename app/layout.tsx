import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import { ThemeProvider, ThemeToggle } from '@/components/ThemeProvider';
import { FiShield, FiCoffee, FiExternalLink, FiGithub, FiMail } from 'react-icons/fi';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SeeTruth | Workplace Transparency',
  description: 'Honest workplace reviews, salaries, and culture ratings.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200`}>
        <ThemeProvider>
       {/* Main Content */}
          <main className="flex-grow">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-4 flex-wrap justify-center">
                  <a href="https://buymeacoffee.com/biruktafese" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <FiCoffee className="w-4 h-4 text-amber-500" /> Buy Me a Coffee
                  </a>
                  <a href="https://ye-buna.com/biruktafese" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <FiExternalLink className="w-4 h-4" /> Ye-Buna Support
                  </a>
                  <a href="https://github.com/biruk-tafese/seetruth" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <FiGithub className="w-4 h-4" /> GitHub Star
                  </a>
                  <a href="mailto:cstafesebiruk23@gmail.com" className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <FiMail className="w-4 h-4 text-red-500" /> Report Bug
                  </a>
                </div>
                <p className="text-xs">&copy; {new Date().getFullYear()} SeeTruth. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}