import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Content Manager — Blades Vision Tech',
  description: 'Admin panel for managing website content',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
