"use client";

import { useEffect, useState } from 'react';
import AppLayout from '../../../components/layout/AppLayout';
import Link from 'next/link';

interface MemoryStatus {
  timestamp: number;
  formatted_time: string;
  memory_systems: {
    semantic: {
      files: number;
      last_updated: string;
      freshness: string;
      completeness: string;
      percentage: number;
    };
    episodic: {
      conversation_count: number;
      session_count: number;
      last_updated: string;
      freshness: string;
      conversation_status: string;
      session_status: string;
    };
    procedural: {
      files: number;
      last_updated: string;
      freshness: string;
      completeness: string;
      percentage: number;
    };
    structured: {
      files: number;
      last_updated: string;
      freshness: string;
      completeness: string;
      percentage: number;
    };
  };
  overall_health: {
    status: string;
    description: string;
  };
  recommendations: string[];
}

export default function MemoryStatusPage() {
  const [report, setReport] = useState<MemoryStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Simulate API fetch since we don't have the actual endpoint yet
  useEffect(() => {
    const simulateReportFetch = async () => {
      try {
        setLoading(true);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - in production, this would come from the API
        const mockReport: MemoryStatus = {
          timestamp: Date.now() / 1000,
          formatted_time: new Date().toLocaleString(),
          memory_systems: {
            semantic: {
              files: 3,
              last_updated: "2025-04-25 11:05:22",
              freshness: "fresh",
              completeness: "complete",
              percentage: 60
            },
            episodic: {
              conversation_count: 1,
              session_count: 1,
              last_updated: "2025-04-25 11:30:15",
              freshness: "fresh",
              conversation_status: "active",
              session_status: "active"
            },
            procedural: {
              files: 4,
              last_updated: "2025-04-25 11:15:46",
              freshness: "fresh",
              completeness: "complete",
              percentage: 80
            },
            structured: {
              files: 3,
              last_updated: "2025-04-25 10:02:58",
              freshness: "fresh",
              completeness: "complete",
              percentage: 100
            }
          },
          overall_health: {
            status: "healthy",
            description: "All memory systems are functioning properly with recent updates."
          },
          recommendations: [
            "Continue adding semantic memory concepts to enhance knowledge capabilities",
            "Consider creating more episodic conversations to build richer interaction history",
            "Schedule regular memory maintenance to ensure continued health"
          ]
        };
        
        setReport(mockReport);
      } catch (err) {
        console.error('Error fetching report:', err);
        setError('Failed to fetch memory status report');
      } finally {
        setLoading(false);
      }
    };
    
    simulateReportFetch();
  }, []);

  const getFreshnessColor = (freshness: string) => {
    switch (freshness) {
      case 'fresh': return 'text-green-400';
      case 'normal': return 'text-yellow-400';
      case 'stale': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };
  
  const getCompletenessColor = (completeness: string) => {
    switch (completeness) {
      case 'complete': return 'text-green-400';
      case 'partial': return 'text-yellow-400';
      case 'empty': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };
  
  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-900/30 border-green-700';
      case 'warning': return 'bg-yellow-900/30 border-yellow-700';
      case 'critical': return 'bg-red-900/30 border-red-700';
      default: return 'bg-gray-900/30 border-gray-700';
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col items-start">
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Link href="/knowledge" className="text-blue-400 hover:text-blue-300 mr-2">Knowledge</Link>
            <span className="text-gray-500 mx-2">/</span>
            <span className="text-white">Memory Status</span>
          </div>
          <h1 className="text-3xl font-bold mb-3">Memory System Status</h1>
          <p className="text-gray-400 mb-6">
            Real-time status of Jarvis's cognitive memory systems.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center w-full p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-700 p-4 rounded-md text-white w-full">
            <h3 className="text-xl font-semibold mb-2">Error Loading Status</h3>
            <p>{error}</p>
          </div>
        ) : report ? (
          <div className="w-full space-y-6">
            {/* Overall Health */}
            <div className={`p-6 rounded-lg border ${getHealthColor(report.overall_health.status)}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Overall Health</h2>
                <span className={`px-3 py-1 rounded-full text-sm uppercase font-bold ${
                  report.overall_health.status === 'healthy' ? 'bg-green-900/50 text-green-400' :
                  report.overall_health.status === 'warning' ? 'bg-yellow-900/50 text-yellow-400' :
                  'bg-red-900/50 text-red-400'
                }`}>
                  {report.overall_health.status}
                </span>
              </div>
              <p className="text-gray-300">{report.overall_health.description}</p>
              <div className="mt-4 text-sm text-gray-400">
                Last updated: {report.formatted_time}
              </div>
            </div>
            
            {/* Memory Systems Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Semantic Memory */}
              <div className="bg-[#1B1B1B] p-6 rounded-lg border border-[#333333]">
                <h3 className="text-xl font-semibold mb-4">Semantic Memory</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Files:</span>
                    <span className="text-white">{report.memory_systems.semantic.files}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Updated:</span>
                    <span className="text-white">{report.memory_systems.semantic.last_updated}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Freshness:</span>
                    <span className={getFreshnessColor(report.memory_systems.semantic.freshness)}>
                      {report.memory_systems.semantic.freshness}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Completeness:</span>
                    <span className={getCompletenessColor(report.memory_systems.semantic.completeness)}>
                      {report.memory_systems.semantic.completeness} ({report.memory_systems.semantic.percentage}%)
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Episodic Memory */}
              <div className="bg-[#1B1B1B] p-6 rounded-lg border border-[#333333]">
                <h3 className="text-xl font-semibold mb-4">Episodic Memory</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Conversations:</span>
                    <span className="text-white">{report.memory_systems.episodic.conversation_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sessions:</span>
                    <span className="text-white">{report.memory_systems.episodic.session_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Updated:</span>
                    <span className="text-white">{report.memory_systems.episodic.last_updated}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Freshness:</span>
                    <span className={getFreshnessColor(report.memory_systems.episodic.freshness)}>
                      {report.memory_systems.episodic.freshness}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className="text-white">
                      {report.memory_systems.episodic.conversation_status}/{report.memory_systems.episodic.session_status}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Procedural Memory */}
              <div className="bg-[#1B1B1B] p-6 rounded-lg border border-[#333333]">
                <h3 className="text-xl font-semibold mb-4">Procedural Memory</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Files:</span>
                    <span className="text-white">{report.memory_systems.procedural.files}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Updated:</span>
                    <span className="text-white">{report.memory_systems.procedural.last_updated}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Freshness:</span>
                    <span className={getFreshnessColor(report.memory_systems.procedural.freshness)}>
                      {report.memory_systems.procedural.freshness}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Completeness:</span>
                    <span className={getCompletenessColor(report.memory_systems.procedural.completeness)}>
                      {report.memory_systems.procedural.completeness} ({report.memory_systems.procedural.percentage}%)
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Structured Memory */}
              <div className="bg-[#1B1B1B] p-6 rounded-lg border border-[#333333]">
                <h3 className="text-xl font-semibold mb-4">Structured Memory</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Files:</span>
                    <span className="text-white">{report.memory_systems.structured.files}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Updated:</span>
                    <span className="text-white">{report.memory_systems.structured.last_updated}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Freshness:</span>
                    <span className={getFreshnessColor(report.memory_systems.structured.freshness)}>
                      {report.memory_systems.structured.freshness}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Completeness:</span>
                    <span className={getCompletenessColor(report.memory_systems.structured.completeness)}>
                      {report.memory_systems.structured.completeness} ({report.memory_systems.structured.percentage}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recommendations */}
            <div className="bg-[#1B1B1B] p-6 rounded-lg border border-[#333333]">
              <h3 className="text-xl font-semibold mb-4">Recommendations</h3>
              <ul className="space-y-3">
                {report.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    <span className="text-gray-300">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Refresh Button */}
            <div className="flex justify-center mt-6">
              <button 
                onClick={() => {
                  setLoading(true);
                  // In production, this would refresh from the API
                  setTimeout(() => setLoading(false), 1000);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md"
              >
                Refresh Status
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
} 