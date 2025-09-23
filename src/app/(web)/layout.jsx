"use client"
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import ImageModal from "@/components/ImageModal";
import { useRouter } from "next/navigation";
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';


function layout({ children }) {
    const { user, logout ,loading} = useAuth();
    const router = useRouter();
    const [showEventLayoutModal, setShowEventLayoutModal] = useState(false);
    
    const handleLogout = async () => {
      try {
        await logout();
        router.push('/login');
      } catch (error) {
        console.error('Logout error:', error);
      }
    };
    
    const handleShowEventLayout = () => {
      setShowEventLayoutModal(true);
    };
  return (
    <div>
      <Header 
        user={user} 
        handleLogout={handleLogout} 
        onShowEventLayout={handleShowEventLayout}
      />
      {children}
      
      <Footer/>
      
      {/* Full-screen Event Layout Modal */}
      <ImageModal
        show={showEventLayoutModal}
        onClose={() => setShowEventLayoutModal(false)}
        imageSrc="/layout2.png"
        imageAlt="Event Layout"
        title="Event Layout"
      />
    </div>
  );
}

export default layout;
