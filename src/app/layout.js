import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AdminProvider } from "@/context/AdminContext";
import { BookingProvider } from "@/context/BookingContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: "Havan Seat Booking",
  description: "Book your havan seats online",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
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
              </BookingProvider>
            </AdminProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
