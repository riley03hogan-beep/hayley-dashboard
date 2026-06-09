import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hayley Dashboard',
  description: 'A personal command-center dashboard for Hayley.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
