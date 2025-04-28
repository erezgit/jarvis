"use client";

import { useEffect, useState } from 'react';
import AppLayout from '../../../../../components/layout/AppLayout';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Project {
  id: string;
  name?: string;
  description?: string;
  status?: string;
  priority?: string;
  created_at?: string;
  last_updated?: string;
  current_phase?: string;
  completion_percentage?: number;
  resources?: {
    repository?: string;
    documentation?: string;
    webapp?: string;
    [key: string]: string | undefined;
  };
  team?: { name: string; role: string }[];
  recent_activity?: { date: string; description: string; type: string }[];
  timeline?: {
    id: string;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    status: string;
    completion_percentage: number;
  }[];
  metadata?: {
    created_by?: string;
    version?: string;
    tags?: string[];
    [key: string]: any;
  };
  [key: string]: any;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = typeof params.id === 'string' ? params.id : '';
  
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) return;
      
      setIsLoading(true);
      try {
        // Fetch the project data from the API
        const response = await fetch(`/api/memory/file?path=Jarvis/knowledge/structured_memory/projects/${projectId}.json`);
        
        if (!response.ok) {
          throw new Error(`Project not found: ${response.status}`);
        }
        
        const data = await response.json();
        try {
          // Parse the JSON content string into an object
          const projectData = JSON.parse(data.content);
          
          // Ensure ID is set
          projectData.id = projectData.id || projectId;
          
          setProject(projectData);
        } catch (parseError) {
          console.error('Error parsing project data:', parseError);
          throw new Error('Failed to parse project data');
        }
      } catch (err) {
        console.error('Error loading project:', err);
        setError(`Failed to load project: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProject();
  }, [projectId]);

  // Helper function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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
      case 'in-progress':
        return 'bg-green-900/30 text-green-400';
      case 'paused':
      case 'planned':
        return 'bg-yellow-900/30 text-yellow-400';
      case 'completed':
        return 'bg-blue-900/30 text-blue-400';
      default:
        return 'bg-gray-900/30 text-gray-400';
    }
  };

  // Function to determine activity type color
  const getActivityTypeColor = (type?: string) => {
    if (!type) return 'bg-gray-900/30 text-gray-400';
    
    switch (type.toLowerCase()) {
      case 'implementation':
        return 'bg-green-900/30 text-green-400';
      case 'design':
        return 'bg-purple-900/30 text-purple-400';
      case 'bugfix':
        return 'bg-red-900/30 text-red-400';
      case 'documentation':
        return 'bg-blue-900/30 text-blue-400';
      case 'feature':
        return 'bg-yellow-900/30 text-yellow-400';
      default:
        return 'bg-gray-900/30 text-gray-400';
    }
  };

  return (
    <AppLayout pageTitle={project?.name || 'Project Details'}>
      <div className="flex flex-col items-start">
        <div className="mb-6 w-full">
          <div className="flex items-center mb-4">
            <Link href="/knowledge" className="text-blue-400 hover:text-blue-300 mr-2">Knowledge</Link>
            <span className="text-gray-500 mx-2">/</span>
            <Link href="/knowledge/structured" className="text-blue-400 hover:text-blue-300 mr-2">Structured</Link>
            <span className="text-gray-500 mx-2">/</span>
            <Link href="/knowledge/structured/projects" className="text-blue-400 hover:text-blue-300 mr-2">Projects</Link>
            <span className="text-gray-500 mx-2">/</span>
            <span className="text-white">{project?.name || projectId}</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center w-full p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-700 p-4 rounded-md text-white w-full">
            <h3 className="text-xl font-semibold mb-2">Error</h3>
            <p>{error}</p>
            <div className="mt-4">
              <Link 
                href="/knowledge/structured/projects" 
                className="text-blue-400 hover:text-blue-300"
              >
                ← Back to Projects
              </Link>
            </div>
          </div>
        ) : project ? (
          <div className="w-full space-y-6">
            {/* Project Header */}
            <div className="bg-[#1B1B1B] p-6 rounded-lg border border-[#333333]">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold">{project.name || 'Unnamed Project'}</h1>
                  <p className="text-gray-400 mt-2">{project.description || 'No description available'}</p>
                </div>
                <div className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(project.status)}`}>
                  {project.status || 'Unknown'}
                </div>
              </div>
              
              {project.metadata?.tags && project.metadata.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.metadata.tags.map((tag: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-[#242424] rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Current Phase</h3>
                  <p>{project.current_phase || 'Unknown'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                  <p>{formatDate(project.last_updated)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Created</h3>
                  <p>{formatDate(project.created_at)}</p>
                </div>
              </div>
            </div>
            
            {/* Project Progress */}
            <div className="bg-[#1B1B1B] p-6 rounded-lg border border-[#333333]">
              <h2 className="text-xl font-semibold mb-4">Project Progress</h2>
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-500 text-sm">Overall Completion</span>
                  <span className="text-gray-500 text-sm">{project.completion_percentage || 0}%</span>
                </div>
                <div className="h-3 bg-[#242424] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${project.completion_percentage || 0}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Milestones/Timeline */}
              {project.timeline && project.timeline.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold mt-4 mb-3">Milestones</h3>
                  <div className="space-y-4">
                    {project.timeline.map((milestone) => (
                      <div key={milestone.id} className="border border-[#242424] rounded p-4">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{milestone.title}</h4>
                          <div className={`px-2 py-1 rounded text-xs ${getStatusColor(milestone.status)}`}>
                            {milestone.status || 'Unknown'}
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">{milestone.description || 'No description'}</p>
                        
                        <div className="mt-3 flex justify-between text-sm text-gray-500">
                          <span>{formatDate(milestone.start_date).split(',')[0]}</span>
                          <span>to</span>
                          <span>{formatDate(milestone.end_date).split(',')[0]}</span>
                        </div>
                        
                        <div className="mt-2">
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-500 text-xs">Progress</span>
                            <span className="text-gray-500 text-xs">{milestone.completion_percentage || 0}%</span>
                          </div>
                          <div className="h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full" 
                              style={{ width: `${milestone.completion_percentage || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {/* Team Members */}
            {project.team && project.team.length > 0 && (
              <div className="bg-[#1B1B1B] p-6 rounded-lg border border-[#333333]">
                <h2 className="text-xl font-semibold mb-4">Team</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.team.map((member, index) => (
                    <div key={index} className="flex items-center p-3 border border-[#242424] rounded">
                      <div className="w-10 h-10 bg-[#242424] rounded-full flex items-center justify-center mr-3">
                        <span>{member.name ? member.name.charAt(0) : '?'}</span>
                      </div>
                      <div>
                        <h3 className="font-medium">{member.name || 'Unknown'}</h3>
                        <p className="text-sm text-gray-400">{member.role || 'Team Member'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Recent Activity */}
            {project.recent_activity && project.recent_activity.length > 0 && (
              <div className="bg-[#1B1B1B] p-6 rounded-lg border border-[#333333]">
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  {project.recent_activity.map((activity, index) => (
                    <div key={index} className="flex items-start">
                      <div className="min-w-[100px] text-sm text-gray-500">
                        {formatDate(activity.date).split(',')[0]}
                      </div>
                      <div className="flex-1">
                        <p>{activity.description || 'No description'}</p>
                      </div>
                      <div className={`ml-4 px-2 py-1 rounded text-xs ${getActivityTypeColor(activity.type)}`}>
                        {activity.type || 'event'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Resources */}
            {project.resources && Object.keys(project.resources).length > 0 && (
              <div className="bg-[#1B1B1B] p-6 rounded-lg border border-[#333333]">
                <h2 className="text-xl font-semibold mb-4">Resources</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(project.resources).map(([key, value]) => (
                    value && (
                      <div key={key} className="flex items-center p-3 border border-[#242424] rounded">
                        <div className="mr-3 text-blue-400">
                          {key === 'repository' ? '📂' : key === 'documentation' ? '📄' : key === 'webapp' ? '🌐' : '🔗'}
                        </div>
                        <div>
                          <h3 className="font-medium capitalize">{key}</h3>
                          <p className="text-sm text-blue-400 truncate">{value}</p>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
            
            {/* Back Button */}
            <div className="mt-6">
              <Link 
                href="/knowledge/structured/projects" 
                className="text-blue-400 hover:text-blue-300"
              >
                ← Back to Projects
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
} 