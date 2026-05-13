import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { LangProvider } from '../contexts/LangContext';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'AOU Jeddah Clubs Hub | منصة أندية الجامعة العربية المفتوحة - جدة',
  description:
    'The official student clubs platform for Arab Open University – Jeddah Branch. Discover events, join clubs, and engage with your campus community.',
  keywords: ['AOU', 'Arab Open University', 'Jeddah', 'Student Council', 'Clubs', 'Events'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        <AuthProvider>
          <LangProvider>
            {children}
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: { borderRadius: '8px', fontSize: '14px' },
              }}
            />
          </LangProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
