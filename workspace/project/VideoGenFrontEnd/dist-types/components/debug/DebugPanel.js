import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { getDebugState, getVideoPlayers, getActiveSpinners } from '@/lib/utils/debug';
export function DebugPanel({ visible = false }) {
    const [isVisible, setIsVisible] = useState(visible);
    const [debugData, setDebugData] = useState(getDebugState());
    const [activeTab, setActiveTab] = useState('videos');
    // Update debug data every second
    useEffect(() => {
        const interval = setInterval(() => {
            setDebugData(getDebugState());
        }, 1000);
        return () => clearInterval(interval);
    }, []);
    // Toggle visibility with keyboard shortcut (Ctrl+Shift+D)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                setIsVisible(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
    if (!isVisible)
        return null;
    const videoPlayers = getVideoPlayers();
    const activeSpinners = getActiveSpinners();
    const recentLogs = debugData.logs.slice(0, 50);
    return (_jsxs("div", { className: "fixed bottom-0 right-0 w-96 h-96 bg-black/80 text-white z-50 overflow-hidden flex flex-col", children: [_jsxs("div", { className: "flex justify-between items-center p-2 bg-gray-800", children: [_jsx("div", { className: "text-sm font-bold", children: "Debug Panel" }), _jsxs("div", { className: "flex space-x-2", children: [_jsxs("button", { className: `px-2 py-1 text-xs rounded ${activeTab === 'videos' ? 'bg-blue-600' : 'bg-gray-700'}`, onClick: () => setActiveTab('videos'), children: ["Videos (", videoPlayers.length, ")"] }), _jsxs("button", { className: `px-2 py-1 text-xs rounded ${activeTab === 'spinners' ? 'bg-blue-600' : 'bg-gray-700'}`, onClick: () => setActiveTab('spinners'), children: ["Spinners (", activeSpinners.length, ")"] }), _jsx("button", { className: `px-2 py-1 text-xs rounded ${activeTab === 'logs' ? 'bg-blue-600' : 'bg-gray-700'}`, onClick: () => setActiveTab('logs'), children: "Logs" }), _jsx("button", { className: "px-2 py-1 text-xs rounded bg-red-600", onClick: () => setIsVisible(false), children: "X" })] })] }), _jsxs("div", { className: "flex-1 overflow-auto p-2", children: [activeTab === 'videos' && (_jsx("div", { className: "space-y-2", children: videoPlayers.length === 0 ? (_jsx("div", { className: "text-gray-400 text-sm", children: "No video players found" })) : (videoPlayers.map(player => (_jsxs("div", { className: "bg-gray-800 p-2 rounded text-xs", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "font-bold", children: player.id }), _jsx("span", { className: `px-1 rounded ${player.isLoading ? 'bg-yellow-600' : 'bg-green-600'}`, children: player.isLoading ? 'Loading' : 'Ready' })] }), _jsxs("div", { className: "mt-1 space-y-1", children: [_jsxs("div", { children: ["URL: ", _jsx("span", { className: "text-gray-400", children: player.videoUrl || 'none' })] }), _jsxs("div", { children: ["Status: ", _jsx("span", { className: "text-gray-400", children: player.status })] }), _jsxs("div", { children: ["Playing: ", _jsx("span", { className: "text-gray-400", children: player.isPlaying ? 'Yes' : 'No' })] }), _jsxs("div", { children: ["Ready State: ", _jsx("span", { className: "text-gray-400", children: player.readyState ?? 'unknown' })] }), player.error && (_jsxs("div", { className: "text-red-400", children: ["Error: ", JSON.stringify(player.error)] }))] })] }, player.id)))) })), activeTab === 'spinners' && (_jsx("div", { className: "space-y-2", children: activeSpinners.length === 0 ? (_jsx("div", { className: "text-gray-400 text-sm", children: "No active spinners" })) : (activeSpinners.map(spinner => (_jsxs("div", { className: "bg-gray-800 p-2 rounded text-xs", children: [_jsx("div", { className: "font-bold", children: spinner.id }), _jsxs("div", { className: "mt-1 space-y-1", children: [_jsxs("div", { children: ["Location: ", _jsx("span", { className: "text-gray-400", children: spinner.location })] }), _jsxs("div", { children: ["Created: ", _jsx("span", { className: "text-gray-400", children: new Date(spinner.createdAt).toLocaleTimeString() })] }), _jsxs("div", { children: ["Age: ", _jsxs("span", { className: "text-gray-400", children: [Math.round((Date.now() - spinner.createdAt) / 1000), "s"] })] })] })] }, spinner.id)))) })), activeTab === 'logs' && (_jsx("div", { className: "space-y-1 text-xs", children: recentLogs.map((log, index) => (_jsxs("div", { className: "border-b border-gray-700 pb-1", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "font-bold", children: log.component }), _jsx("span", { className: "text-gray-400", children: new Date(log.timestamp).toLocaleTimeString() })] }), _jsx("div", { className: "text-gray-300", children: log.message }), log.data && (_jsx("div", { className: "text-gray-400 text-xs overflow-hidden text-ellipsis", children: JSON.stringify(log.data) }))] }, index))) }))] }), _jsx("div", { className: "p-2 bg-gray-800 text-xs", children: "Press Ctrl+Shift+D to toggle debug panel" })] }));
}
