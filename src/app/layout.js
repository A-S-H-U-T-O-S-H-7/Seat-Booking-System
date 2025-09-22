import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AdminProvider } from "@/context/AdminContext";
import { BookingProvider } from "@/context/BookingContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from 'react-hot-toast';
import AuthDebugger from '@/components/AuthDebugger';
import BrowserCompatibilityWrapper from '@/components/BrowserCompatibilityWrapper';

export const metadata = {
  title: "svsamiti",
  description: "Donate For a Noble Cause",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Add meta tags for better compatibility */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <BrowserCompatibilityWrapper>
          <ThemeProvider>
            <AuthProvider>
              <AdminProvider>
                <BookingProvider>
                  {children}
                  <Toaster 
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: '#363636',
                        color: '#fff',
                      },
                    }}
                  />
                  {/* <AuthDebugger /> */}
                </BookingProvider>
              </AdminProvider>
            </AuthProvider>
          </ThemeProvider>
        </BrowserCompatibilityWrapper>
      </body>
    </html>
  );
}
