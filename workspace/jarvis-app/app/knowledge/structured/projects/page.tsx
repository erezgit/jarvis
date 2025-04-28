"use client";

import { useEffect, useState } from 'react';
import AppLayout from '../../../../components/layout/AppLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Project {
  id: string;
  name?: string;
  description?: string;
  status?: string;
  priority?: string;
  current_phase?: string;
  completion_percentage?: number;
  last_updated?: string;
  team?: { name: string; role: string }[];
  recent_activity?: { date: string; description: string; type: string }[];
}

export default function StructuredProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true);
      try {
        // For now, we'll hardcode the project files we know exist
        const projectFiles = ['jarvis', 'advisors', 'github_credentials'];
        const loadedProjects: Project[] = [];
        
        for (const projectFile of projectFiles) {
          try {
            const response = await fetch(`/api/memory/file?path=Jarvis/knowledge/structured_memory/projects/${projectFile}.json`);
            if (response.ok) {
              const data = await response.json();
              try {
                // Parse the JSON content string into an object
                const projectData = JSON.parse(data.content);
                
                // Ensure project has a valid ID
                if (!projectData.id) {
                  projectData.id = projectFile; // Use filename as fallback ID
                }
                
                // Validate and provide defaults for required fields
                loadedProjects.push({
                  id: projectData.id,
                  name: projectData.name || projectFile,
                  description: projectData.description || 'No description available',
                  status: projectData.status || 'unknown',
                  priority: projectData.priority || 'medium',
                  current_phase: projectData.current_phase || 'unknown',
                  completion_percentage: projectData.completion_percentage || 0,
                  last_updated: projectData.last_updated || new Date().toISOString(),
                  team: projectData.team || [],
                  recent_activity: projectData.recent_activity || []
                });
              } catch (parseError) {
                console.error(`Error parsing project ${projectFile}:`, parseError);
              }
            }
          } catch (err) {
            console.error(`Error loading project ${projectFile}:`, err);
          }
        }
        
        setProjects(loadedProjects);
      } catch (err) {
        console.error('Error loading projects:', err);
        setError('Failed to load projects');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProjects();
  }, []);

  // Helper function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    } catch (e) {
      return 'Unknown date';
    }
  };

  // Function to determine status color
  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-900/30 text-gray-400';
    
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-900/30 text-green-400';
      case 'paused':
        return 'bg-yellow-900/30 text-yellow-400';
      case 'completed':
        return 'bg-blue-900/30 text-blue-400';
      default:
        return 'bg-gray-900/30 text-gray-400';
    }
  };

  // Function to determine priority color
  const getPriorityColor = (priority?: string) => {
    if (!priority) return 'bg-gray-900/30 text-gray-400';
    
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-900/30 text-red-400';
      case 'medium':
        return 'bg-yellow-900/30 text-yellow-400';
      case 'low':
        return 'bg-blue-900/30 text-blue-400';
      default:
        return 'bg-gray-900/30 text-gray-400';
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col items-start">
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Link href="/knowledge" className="text-blue-400 hover:text-blue-300 mr-2">Knowledge</Link>
            <span className="text-gray-500 mx-2">/</span>
            <Link href="/knowledge/structured" className="text-blue-400 hover:text-blue-300 mr-2">Structured</Link>
            <span className="text-gray-500 mx-2">/</span>
            <span className="text-white">Projects</span>
          </div>
          <h1 className="text-3xl font-bold mb-3">Projects</h1>
          <p className="text-gray-400 mb-6">
            Structured information about active projects that Jarvis is assisting with.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center w-full p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-700 p-4 rounded-md text-white w-full">
            <h3 className="text-xl font-semibold mb-2">Error Loading Projects</h3>
            <p>{error}</p>
          </div>
        ) : (
          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project) => (
                <div 
                  key={project.id} 
                  className="bg-[#1B1B1B] p-6 rounded-lg border border-[#333333] hover:border-blue-500 cursor-pointer transition-colors"
                  onClick={() => router.push(`/knowledge/structured/projects/${project.id}`)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-semibold">{project.name || 'Unnamed Project'}</h2>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status || 'Unknown'}
                    </div>
                  </div>
                  
                  <p className="text-gray-400 mb-4">{project.description || 'No description available'}</p>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-500 text-sm">Phase: {project.current_phase || 'Unknown'}</span>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(project.priority)}`}>
                      {project.priority || 'Medium'} priority
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-500 text-sm">Completion</span>
                      <span className="text-gray-500 text-sm">{project.completion_percentage || 0}%</span>
                    </div>
                    <div className="h-2 bg-[#242424] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${project.completion_percentage || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Updated: {formatDate(project.last_updated)}</span>
                    <span className="text-blue-400">View Details</span>
                  </div>
                </div>
              ))}
            </div>
            
            {projects.length === 0 && (
              <div className="bg-[#1B1B1B] p-8 rounded-lg border border-[#333333] text-center">
                <p className="text-gray-400">No projects found. Create a new project to get started.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
} 