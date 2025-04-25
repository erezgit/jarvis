import { useState, useEffect } from 'react';
import { getDebugState, getVideoPlayers, getActiveSpinners } from '@/lib/utils/debug';

interface DebugPanelProps {
  visible?: boolean;
}

export function DebugPanel({ visible = false }: DebugPanelProps) {
  const [isVisible, setIsVisible] = useState(visible);
  const [debugData, setDebugData] = useState(getDebugState());
  const [activeTab, setActiveTab] = useState<'videos' | 'spinners' | 'logs'>('videos');

  // Update debug data every second
  useEffect(() => {
    const interval = setInterval(() => {
      setDebugData(getDebugState());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Toggle visibility with keyboard shortcut (Ctrl+Shift+D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isVisible) return null;

  const videoPlayers = getVideoPlayers();
  const activeSpinners = getActiveSpinners();
  const recentLogs = debugData.logs.slice(0, 50);

  return (
    <div className="fixed bottom-0 right-0 w-96 h-96 bg-black/80 text-white z-50 overflow-hidden flex flex-col">
      <div className="flex justify-between items-center p-2 bg-gray-800">
        <div className="text-sm font-bold">Debug Panel</div>
        <div className="flex space-x-2">
          <button 
            className={`px-2 py-1 text-xs rounded ${activeTab === 'videos' ? 'bg-blue-600' : 'bg-gray-700'}`}
            onClick={() => setActiveTab('videos')}
          >
            Videos ({videoPlayers.length})
          </button>
          <button 
            className={`px-2 py-1 text-xs rounded ${activeTab === 'spinners' ? 'bg-blue-600' : 'bg-gray-700'}`}
            onClick={() => setActiveTab('spinners')}
          >
            Spinners ({activeSpinners.length})
          </button>
          <button 
            className={`px-2 py-1 text-xs rounded ${activeTab === 'logs' ? 'bg-blue-600' : 'bg-gray-700'}`}
            onClick={() => setActiveTab('logs')}
          >
            Logs
          </button>
          <button 
            className="px-2 py-1 text-xs rounded bg-red-600"
            onClick={() => setIsVisible(false)}
          >
            X
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-2">
        {activeTab === 'videos' && (
          <div className="space-y-2">
            {videoPlayers.length === 0 ? (
              <div className="text-gray-400 text-sm">No video players found</div>
            ) : (
              videoPlayers.map(player => (
                <div key={player.id} className="bg-gray-800 p-2 rounded text-xs">
                  <div className="flex justify-between">
                    <span className="font-bold">{player.id}</span>
                    <span className={`px-1 rounded ${player.isLoading ? 'bg-yellow-600' : 'bg-green-600'}`}>
                      {player.isLoading ? 'Loading' : 'Ready'}
                    </span>
                  </div>
                  <div className="mt-1 space-y-1">
                    <div>URL: <span className="text-gray-400">{player.videoUrl || 'none'}</span></div>
                    <div>Status: <span className="text-gray-400">{player.status}</span></div>
                    <div>Playing: <span className="text-gray-400">{player.isPlaying ? 'Yes' : 'No'}</span></div>
                    <div>Ready State: <span className="text-gray-400">{player.readyState ?? 'unknown'}</span></div>
                    {player.error && (
                      <div className="text-red-400">Error: {JSON.stringify(player.error)}</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
        {activeTab === 'spinners' && (
          <div className="space-y-2">
            {activeSpinners.length === 0 ? (
              <div className="text-gray-400 text-sm">No active spinners</div>
            ) : (
              activeSpinners.map(spinner => (
                <div key={spinner.id} className="bg-gray-800 p-2 rounded text-xs">
                  <div className="font-bold">{spinner.id}</div>
                  <div className="mt-1 space-y-1">
                    <div>Location: <span className="text-gray-400">{spinner.location}</span></div>
                    <div>Created: <span className="text-gray-400">
                      {new Date(spinner.createdAt).toLocaleTimeString()}
                    </span></div>
                    <div>Age: <span className="text-gray-400">
                      {Math.round((Date.now() - spinner.createdAt) / 1000)}s
                    </span></div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
        {activeTab === 'logs' && (
          <div className="space-y-1 text-xs">
            {recentLogs.map((log, index) => (
              <div key={index} className="border-b border-gray-700 pb-1">
                <div className="flex justify-between">
                  <span className="font-bold">{log.component}</span>
                  <span className="text-gray-400">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-gray-300">{log.message}</div>
                {log.data && (
                  <div className="text-gray-400 text-xs overflow-hidden text-ellipsis">
                    {JSON.stringify(log.data)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-2 bg-gray-800 text-xs">
        Press Ctrl+Shift+D to toggle debug panel
      </div>
    </div>
  );
} 