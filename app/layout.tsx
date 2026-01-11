import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';

export const metadata: Metadata = {
    title: 'MazdoorMitra - Friend of the Laborer',
    description: 'Connecting daily wage workers with contractors through digital contracts',
    keywords: 'mazdoor, labor, construction, contractors, digital contract, worker rights',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="hi">
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="font-hindi">
                <AuthProvider>
                    <div className="min-h-screen flex flex-col">
                        <Navbar />
                        {children}
                    </div>
                </AuthProvider>
            </body>
        </html>
    );
}
