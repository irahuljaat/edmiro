import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MainLayout from './components/MainLayout';
import RouteGuard from './components/RouteGuard';
import DynamicSchoolMeta from './components/DynamicSchoolMeta';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'Edmiro | Educational Management Portal',
  description: 'Smart School Management Portal for Academic Excellence, Attendance, Fees, and Exams.',
  keywords: ['Edmiro', 'School Management System', 'Academic ERP', 'Smart Education'],
  openGraph: {
    title: 'Edmiro | Educational Management Portal',
    description: 'Next-generation School ERP and Student Management System.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Edmiro Portal",
    "description": "Smart Educational ERP and School Management Platform.",
    "educationalLevel": "Primary and Senior Secondary"
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      
          
            {/* MainLayout decides whether to show Navbar and Sidebar */}
            <MainLayout>
              {children}
            </MainLayout>
          
       
      </body>
    </html>
  );
}