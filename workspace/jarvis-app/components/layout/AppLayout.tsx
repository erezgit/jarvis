"use client";

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

export default function AppLayout({ children, pageTitle }: AppLayoutProps) {
  const pathname = usePathname();
  
  // Function to determine the current content based on URL path
  const getCurrentContent = () => {
    // Default fallback header
    let content = "Your AI Development Partner";
    
    // If pageTitle is passed directly, use it
    if (pageTitle) {
      return pageTitle;
    }
    
    // Determine content based on path
    if (pathname) {
      const pathParts = pathname.split('/').filter(Boolean);
      
      if (pathParts.length > 0) {
        if (pathParts[0] === 'knowledge') {
          if (pathParts.length === 1) {
            content = "Knowledge System";
          } else if (pathParts.length >= 2) {
            // Format memory type
            const memoryType = pathParts[1].charAt(0).toUpperCase() + pathParts[1].slice(1);
            
            if (pathParts.length === 2) {
              content = `${memoryType} Memory`;
            } else if (pathParts.length >= 3) {
              // Format memory subtype
              const subType = pathParts[2].charAt(0).toUpperCase() + pathParts[2].slice(1);
              content = `${memoryType} ${subType}`;
              
              // Check if we have a specific file selected (pathParts[3] would be the file ID)
              if (pathParts.length >= 4 && pathParts[3]) {
                // Format the file ID to be more readable (remove underscores, capitalize)
                const fileId = pathParts[3].replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                content = fileId;
              }
            }
          }
        } else if (pathParts[0] === 'conversations') {
          content = "Conversation History";
          if (pathParts.length > 1) {
            content = `Conversation #${pathParts[1]}`;
          }
        } else if (pathParts[0] === 'status') {
          content = "Memory System Status";
        }
      }
    }
    
    return content;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#141414] text-white">
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex h-16 items-center px-6 border-b border-[#242424]" style={{ borderWidth: '1px' }}>
          <h1 className="text-xl font-bold">Jarvis</h1>
          <span className="text-gray-400 ml-3">{getCurrentContent()}</span>
        </div>
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto py-6 px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 