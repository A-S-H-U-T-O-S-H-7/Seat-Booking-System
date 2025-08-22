"use client"
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAuth } from '@/context/AuthContext';


function layout({ children }) {
    const { user, logout ,loading} = useAuth();
      const router = useRouter();
    
      const handleLogout = async () => {
        try {
          await logout();
          router.push('/login');
        } catch (error) {
          console.error('Logout error:', error);
        }
      };
  return (
    <div>
      <Header user={user} handleLogout={handleLogout} />
      {children}
      <Toaster
          reverseOrder={false}
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: { background: "#333", color: "#fff" }
          }}
        />
      <Footer/>
    </div>
  );
}

export default layout;
